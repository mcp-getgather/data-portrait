import * as Sentry from '@sentry/node';
import { Socket } from 'net';
import express from 'express';
import { errorHandler } from './middleware/error-handler.js';
import { healthRoutes } from './routes/health-routes.js';
import { apiRoutes } from './routes/api-routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { settings } from './config.js';
import { IPBlockerMiddleware } from './middleware/ip-blocker-middleware.js';
import { geolocationService } from './services/geolocation-service.js';
import { imageService } from './services/image-service.js';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import session from 'express-session';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

Sentry.init({
  dsn: settings.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
});
const app = express();

// Security configuration
app.set('trust proxy', true);
app.disable('x-powered-by');

// Basic security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Production-only security headers
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  }

  next();
});

const createProxy = (path: string) =>
  createProxyMiddleware({
    target: `${settings.GETGATHER_URL}${path}`,
    changeOrigin: true,
    on: {
      proxyReq: async (proxyReq, req) => {
        if (req.method == 'POST') {
          if (!req.body) {
            req.body = {};
          }
          const clientIp = geolocationService.getClientIp(req);
          const requestLocationData =
            geolocationService.getClientLocationFromCache(clientIp);
          req.body.location = requestLocationData;
          proxyReq.setHeader(
            'Content-Length',
            Buffer.byteLength(JSON.stringify(req.body))
          );
          proxyReq.write(JSON.stringify(req.body));
        } else {
          fixRequestBody(proxyReq, req);
        }
      },
      error: (
        err: Error,
        req: express.Request,
        res: express.Response | Socket
      ) => {
        console.error(`Proxy req: ${req} error: ${err}`);
        if ('status' in res) {
          res.status(500).send('Proxy error occurred');
        }
      },
    },
  });

const proxyPaths = [
  '/link',
  '/__assets',
  '/__static',
  '/__static/assets',
  '/__static/assets/logos',
  '/api',
];

proxyPaths.forEach((path) => {
  app.use(path, createProxy(path));
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware
app.use(
  session({
    secret: settings.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);
app.use((req, res, next) => {
  if (req) {
    if (req.session) {
      req.session.createdAt = Date.now();
    }
  }
  next();
});

app.use(new IPBlockerMiddleware(geolocationService).middleware);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client')));

// Serve generated images from public directory
app.use(express.static(path.join(process.cwd(), 'public')));

// Router
app.use('/health', healthRoutes);
app.use('/getgather', apiRoutes);
app.use('*name', (_req, res) => {
  res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

Sentry.setupExpressErrorHandler(app);
app.use(errorHandler);

// Initialize image cleanup service
imageService.initializeImageCleanup();

app.listen(3000, () => {
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }
  console.log('🚀 Server is listening on port 3000...');
});
