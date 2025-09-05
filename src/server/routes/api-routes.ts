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

router.post('/log', (req, res) => {
  // The client sends an object: { brand: string, orders: PurchaseHistory[] }
  console.log(
    'Received orders from client:',
    JSON.stringify(req.body, null, 2)
  );
  // Respond with 204 No Content to signal successful receipt without extra payload
  res.sendStatus(204);
});

export { router as apiRoutes };
