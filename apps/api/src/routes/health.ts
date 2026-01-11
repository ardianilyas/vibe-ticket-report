import { Router, Request, Response } from 'express';
import { APP_NAME, API_VERSION } from '@repo/shared';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: APP_NAME,
    version: API_VERSION,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export { router as healthRouter };
