import { LocationData } from './middleware/geolocation-middleware.js';

declare global {
  namespace Express {
    interface Request {
      location?: LocationData;
      sessionID: string;
      session?: { createdAt?: number };
    }
  }
}
