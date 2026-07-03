import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { config } from '../config/env.js';
import { loginSchema } from '../validators/auth.validator.js';
import { logger } from '../config/logger.js';

function hashPassword(password: string): string {
  const salt = 'acowale_salt_2026';
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.adminUser.findUnique({ where: { email } });

    if (!user) {
      logger.warn({ email }, 'Failed login attempt: user not found');
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email address or password.',
        },
      });
    }

    const hashedInput = hashPassword(password);
    if (hashedInput !== user.passwordHash) {
      logger.warn({ email }, 'Failed login attempt: incorrect password');
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email address or password.',
        },
      });
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: '24h' });

    await prisma.auditLog.create({
      data: {
        adminId: user.id,
        action: 'LOGIN',
        details: `Admin user ${user.email} logged in successfully`,
      },
    });

    logger.info({ email: user.email, role: user.role }, 'Admin user logged in successfully');

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        token,
        user: payload,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.adminUser) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    return res.status(200).json({
      success: true,
      data: req.adminUser,
    });
  } catch (err) {
    next(err);
  }
};
