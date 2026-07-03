import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';

interface MetricsStore {
  totalRequests: number;
  totalErrors: number;
  statusCodes: Record<string, number>;
  latenciesMs: number[]; // circular buffer of last 500 requests for p95 computation
  startTime: number;
}

const metrics: MetricsStore = {
  totalRequests: 0,
  totalErrors: 0,
  statusCodes: { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 },
  latenciesMs: [],
  startTime: Date.now(),
};

export const recordError = () => {
  metrics.totalErrors++;
};

export const observabilityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();
  metrics.totalRequests++;

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;

    // Track latency in circular buffer (max 500 entries)
    if (metrics.latenciesMs.length >= 500) {
      metrics.latenciesMs.shift();
    }
    metrics.latenciesMs.push(durationMs);

    // Track status code bucket
    const statusBucket = `${Math.floor(res.statusCode / 100)}xx`;
    metrics.statusCodes[statusBucket] = (metrics.statusCodes[statusBucket] || 0) + 1;

    if (res.statusCode >= 400) {
      logger.warn({ method: req.method, url: req.originalUrl, status: res.statusCode, durationMs: durationMs.toFixed(2) }, 'HTTP Request Warning/Error');
    } else {
      logger.info({ method: req.method, url: req.originalUrl, status: res.statusCode, durationMs: durationMs.toFixed(2) }, 'HTTP Request Completed');
    }
  });

  next();
};

export const getMetricsSummary = () => {
  const sortedLatencies = [...metrics.latenciesMs].sort((a, b) => a - b);
  const count = sortedLatencies.length;
  const p50 = count > 0 ? sortedLatencies[Math.floor(count * 0.5)] : 0;
  const p95 = count > 0 ? sortedLatencies[Math.floor(count * 0.95)] : 0;
  const p99 = count > 0 ? sortedLatencies[Math.floor(count * 0.99)] : 0;
  const avg = count > 0 ? sortedLatencies.reduce((sum, val) => sum + val, 0) / count : 0;

  return {
    uptimeSeconds: Math.floor((Date.now() - metrics.startTime) / 1000),
    totalRequests: metrics.totalRequests,
    totalErrors: metrics.totalErrors,
    errorRatePercentage: metrics.totalRequests > 0 ? ((metrics.totalErrors / metrics.totalRequests) * 100).toFixed(2) + '%' : '0.00%',
    statusCodes: metrics.statusCodes,
    latencyMs: {
      avg: Number(avg.toFixed(2)),
      p50: Number(p50.toFixed(2)),
      p95: Number(p95.toFixed(2)),
      p99: Number(p99.toFixed(2)),
    },
    timestamp: new Date().toISOString(),
  };
};
