import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { Socket } from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// MCP Client setup
let mcpClient: Client | null = null;
let initPromise: Promise<Client> | null = null;

const serverUrl = process.env.GETGATHER_URL || 'http://localhost:8000';
const mcpUrl = `${serverUrl}/mcp/`;

function getAppHost(req: express.Request): string {
  // If APP_HOST is explicitly set, use it
  if (process.env.APP_HOST) {
    return process.env.APP_HOST;
  }

  // Get protocol (http/https)
  const protocol = req.protocol;

  // Get host (includes hostname and port if present)
  const host = req.get('host') || 'localhost:5173';

  return `${protocol}://${host}`;
}

async function initializeMcpClient(): Promise<Client> {
  if (mcpClient) return mcpClient;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const client = new Client(
      { name: 'circuit-shack-server', version: '1.0.0' },
      { capabilities: {} }
    );

    const transport = new StreamableHTTPClientTransport(new URL(mcpUrl));

    await client.connect(transport);
    mcpClient = client;
    return client;
  })();

  try {
    return await initPromise;
  } finally {
    initPromise = null;
  }
}

function getMcpClient(): Client {
  if (!mcpClient) {
    throw new Error(
      'MCP client not initialized. Call initializeMcpClient() first.'
    );
  }
  return mcpClient;
}

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.post('/api/search-purchase-history', async (req, res) => {
  try {
    const { keyword = 'computer' } = req.body;

    const mcpClient = getMcpClient();

    const result = await mcpClient.callTool({
      name: 'amazon_search_purchase_history',
      arguments: { keyword },
    });

    const structuredContent = result.structuredContent as {
      url?: string;
      link_id?: string;
    };

    if (structuredContent?.url?.includes(serverUrl ?? '')) {
      const appHost = getAppHost(req);
      const proxyPath = structuredContent.url.replace(serverUrl, `${appHost}`);
      structuredContent.url = proxyPath;
    }

    res.json({
      success: true,
      data: structuredContent,
    });
  } catch (error) {
    console.error('Search purchase history error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/api/poll-auth', async (req, res) => {
  try {
    const { link_id } = req.body;

    if (!link_id) {
      return res.status(400).json({
        success: false,
        error: 'link_id is required',
      });
    }

    const mcpClient = getMcpClient();
    const result = await mcpClient.callTool(
      {
        name: 'poll_auth',
        arguments: { link_id },
      },
      undefined,
      {
        timeout: 6000000,
        maxTotalTimeout: 6000000,
      }
    );

    const structuredContent = result.structuredContent as {
      status?: string;
    };

    res.json({
      success: true,
      data: structuredContent,
    });
  } catch (error) {
    console.error('Poll auth error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

const createProxy = (path: string) =>
  createProxyMiddleware({
    target: `${serverUrl}${path}`,
    changeOrigin: true,
    on: {
      proxyReq: fixRequestBody,
      error: (
        err: Error,
        req: express.Request,
        res: express.Response | Socket
      ) => {
        console.error('Proxy error:', err);
        if ('status' in res) {
          res.status(500).send('Proxy error occurred');
        }
      },
    },
  });

const proxyPaths = ['/auth', '/link', '/api', '/assets'];

proxyPaths.forEach((path) => {
  app.use(path, createProxy(path));
});

// Serve static files only in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from dist directory (after API routes)
  app.use(express.static(path.join(__dirname, '..', 'dist')));

  // Catch-all handler: send back React app for any non-API, non-static routes
  app.use((req, res, next) => {
    // If it's an API route, let other handlers deal with it
    if (req.path.startsWith('/api/') || req.path.startsWith('/health')) {
      return next();
    }
    // For all other routes, serve the React app
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });
}

// Initialize MCP client and start server
async function startServer() {
  try {
    console.log('Initializing MCP client...');
    await initializeMcpClient();
    console.log('MCP client initialized successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      if (process.env.NODE_ENV === 'production') {
        console.log('Serving static files from dist/');
      } else {
        console.log('API only mode - use Vite dev server for frontend');
      }
    });
  } catch (error) {
    console.error('Failed to initialize MCP client:', error);
    process.exit(1);
  }
}

startServer();
