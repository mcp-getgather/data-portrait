import { Router } from 'express';
import { handleAuthProxy } from '../handlers/auth-handler.js';
import { handlePortraitGeneration } from '../handlers/portrait-handler.js';

const router = Router();

// Auth proxy endpoint
router.post('/auth/:brandName', handleAuthProxy);

// Portrait generation endpoint
router.post('/generate-portrait', handlePortraitGeneration);

export { router as apiRoutes };
