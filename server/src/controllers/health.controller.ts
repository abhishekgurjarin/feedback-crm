import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { getMetricsSummary } from '../middleware/observability.middleware.js';

export const getHealth = async (_req: Request, res: Response) => {
  const startTime = Date.now();
  let dbStatus = 'connected';
  let dbLatencyMs = 0;
  let isHealthy = true;

  try {
    const dbStart = process.hrtime.bigint();
    await prisma.$queryRaw`SELECT 1`;
    const dbEnd = process.hrtime.bigint();
    dbLatencyMs = Number(dbEnd - dbStart) / 1_000_000;
  } catch (err) {
    dbStatus = `disconnected (${err instanceof Error ? err.message : 'Unknown error'})`;
    isHealthy = false;
  }

  const memoryUsage = process.memoryUsage();
  const uptimeSeconds = process.uptime();

  const payload = {
    status: isHealthy ? 'UP' : 'DOWN',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'acowale-pulse-crm-backend',
    database: {
      status: dbStatus,
      latencyMs: Number(dbLatencyMs.toFixed(2)),
    },
    system: {
      uptimeSeconds: Math.floor(uptimeSeconds),
      uptimeFormatted: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${Math.floor(uptimeSeconds % 60)}s`,
      memory: {
        rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
        heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      },
    },
    executionMs: Date.now() - startTime,
  };

  return res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    data: payload,
  });
};

export const getMetrics = async (_req: Request, res: Response) => {
  const summary = getMetricsSummary();
  return res.status(200).json({
    success: true,
    data: summary,
  });
};
