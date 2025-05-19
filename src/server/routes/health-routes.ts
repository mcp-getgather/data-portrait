import { Router } from 'express';

const router = Router();

router.get('/', (_, res) => {
  res.json({
    status: 'OK',
    timestamp: Math.floor(Date.now() / 1000),
    service: 'potrait-app-server',
  });
});

export { router as healthRoutes };
