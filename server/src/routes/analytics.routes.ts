import { Router } from 'express';
import { getAnalyticsSummary } from '../controllers/analytics.controller.js';

const router = Router();

// Get rich analytics summary for dashboard
router.get('/', getAnalyticsSummary);

export default router;
