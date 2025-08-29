import { Router } from 'express';
import { handleAuthProxy } from '../handlers/auth-handler.js';
import { handlePortraitGeneration } from '../handlers/portrait-handler.js';
import {
  handleLinkCreate,
  handleLinkStatus,
} from '../handlers/link-handler.js';

const router = Router();

// Auth proxy endpoint
router.post('/auth/:brandName', handleAuthProxy);

// Link creation proxy endpoint
router.post('/link/create', handleLinkCreate);

// Link status proxy endpoint
router.get('/link/status/:linkId', handleLinkStatus);

// Portrait generation endpoint
router.post('/generate-portrait', handlePortraitGeneration);

export { router as apiRoutes };
