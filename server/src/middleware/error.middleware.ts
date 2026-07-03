import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger.js';
import { recordError } from './observability.middleware.js';

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response<ApiErrorResponse>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  recordError();

  if (err instanceof ZodError) {
    logger.warn({ err: err.issues, url: req.url }, 'Validation error');
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request parameters or payload',
        details: err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
  }

  if (err instanceof Error) {
    logger.error({ err: err.message, stack: err.stack, url: req.url }, 'Unhandled application error');
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: err.message || 'An unexpected internal server error occurred.',
      },
    });
  }

  logger.error({ err, url: req.url }, 'Unknown error');
  return res.status(500).json({
    success: false,
    error: {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred.',
    },
  });
};
