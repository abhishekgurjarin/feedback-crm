import { Router } from 'express';
import { getHealth, getMetrics } from '../controllers/health.controller.js';

const router = Router();

// Public health check endpoint for monitoring / load balancers
router.get('/health', getHealth);

// Public observability system metrics endpoint
router.get('/metrics', getMetrics);

export default router;
