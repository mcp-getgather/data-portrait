import { Router } from 'express';
import { handlePortraitGeneration } from '../handlers/portrait-handler.js';
import {
  handlePurchaseHistory,
  handleMcpPoll,
  handlePurchaseHistoryDetails,
  handleDpageUrl,
  handleDpageSigninCheck,
} from '../handlers/mcp-handler.js';
import { handleAnalytics } from '../handlers/analytics-handler.js';

const router = Router();

// Get dpage url
router.get('/dpage-url/:brandName', handleDpageUrl);

router.get('/dpage-signin-check/:linkId', handleDpageSigninCheck);

// Get purchase history
router.get('/purchase-history/:brandName', handlePurchaseHistory);

// Get purchase history details (wayfair and officedepot)
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

router.post('/analytics', handleAnalytics);

export { router as apiRoutes };
