import { Router } from 'express';
import { createFeedback, getFeedbacks, updateFeedbackStatus } from '../controllers/feedback.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { feedbackSubmissionLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

// Public feedback submission (with spam rate limiting)
router.post('/', feedbackSubmissionLimiter, createFeedback);

// Public or Admin read access to feedbacks with rich filtering & search
router.get('/', getFeedbacks);

// Protected Admin update endpoint
router.patch('/:id/status', requireAuth, updateFeedbackStatus);

export default router;
