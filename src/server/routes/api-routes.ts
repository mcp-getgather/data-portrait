import { Router } from 'express';
import { handlePortraitGeneration } from '../handlers/portrait-handler.js';
import {
  handlePurchaseHistory,
  handleMcpPoll,
  handlePurchaseHistoryDetails,
} from '../handlers/mcp-handler.js';

const router = Router();

// Get purchase history
router.get('/purchase-history/:brandName', handlePurchaseHistory);

// Get purchase history details (only wayfair for now)
router.get(
  '/purchase-history-details/:brandName/:orderId',
  handlePurchaseHistoryDetails
);

// MCP poll endpoint
router.get('/mcp-poll/:linkId', handleMcpPoll);

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
