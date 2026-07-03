import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.RATE_LIMIT_MAX, // Limit each IP to RATE_LIMIT_MAX requests per `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again after 15 minutes.',
    },
  },
});

// A stricter rate limiter for feedback submissions specifically (to prevent spam)
export const feedbackSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Max 30 feedback submissions per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'SUBMISSION_LIMIT_EXCEEDED',
      message: 'You have submitted too much feedback recently. Please pause for a few minutes.',
    },
  },
});
