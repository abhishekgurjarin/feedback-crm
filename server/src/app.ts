import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { config } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';
import { observabilityMiddleware } from './middleware/observability.middleware.js';
import { apiRateLimiter } from './middleware/rateLimit.middleware.js';
import feedbackRoutes from './routes/feedback.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import authRoutes from './routes/auth.routes.js';
import healthRoutes from './routes/health.routes.js';

const app = express();

// 1. Basic Middleware
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// 2. Observability & Rate Limiting
app.use(observabilityMiddleware);
app.use('/api', apiRateLimiter);

// 3. API Routes
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', healthRoutes); // mounts /api/health and /api/metrics

// 4. Production Static File Serving (for single-container Docker or Monorepo deployment)
const clientBuildPath = path.resolve(process.cwd(), '../client/dist');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.use('*', (_req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  // Fallback root welcome route in development
  app.get('/', (_req, res) => {
    res.status(200).json({
      success: true,
      message: '🚀 Welcome to Acowale Pulse CRM Backend API. Visit /api/health or /api/analytics for status.',
    });
  });
}

// 5. Centralized Error Handler (must be last)
app.use(errorHandler);

export default app;
