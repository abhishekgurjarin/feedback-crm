import app from './app.js';
import { config } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './config/db.js';

const PORT = config.PORT;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Acowale Pulse CRM API server running on http://localhost:${PORT} in ${config.NODE_ENV} mode`);
  logger.info(`📊 Health check available at http://localhost:${PORT}/api/health`);
  logger.info(`📈 Analytics summary available at http://localhost:${PORT}/api/analytics`);
});

// Graceful Shutdown handling for Kubernetes / Docker / SIGINT
const gracefulShutdown = async (signal: string) => {
  logger.info(`⚠️ Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    logger.info('🔌 HTTP server closed.');
    try {
      await prisma.$disconnect();
      logger.info('💾 Prisma database connections closed.');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during Prisma disconnect');
      process.exit(1);
    }
  });

  // Force shutdown if graceful close takes > 10s
  setTimeout(() => {
    logger.error('⏱️ Graceful shutdown timed out after 10 seconds. Forcing process exit.');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, '💥 Unhandled Rejection at Promise');
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, '💥 Uncaught Exception! Shutting down immediately.');
  process.exit(1);
});
