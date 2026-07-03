import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db.js';
import {
  createFeedbackSchema,
  getFeedbackQuerySchema,
  updateFeedbackStatusSchema,
} from '../validators/feedback.validator.js';
import { logger } from '../config/logger.js';

export const createFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = createFeedbackSchema.parse(req.body);

    const newFeedback = await prisma.feedback.create({
      data: validatedData,
    });

    logger.info({ id: newFeedback.id, category: newFeedback.category, rating: newFeedback.rating }, 'New feedback submitted');

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your feedback has been submitted successfully.',
      data: newFeedback,
    });
  } catch (err) {
    next(err);
  }
};

export const getFeedbacks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = getFeedbackQuerySchema.parse(req.query);

    const where: Prisma.FeedbackWhereInput = {};

    if (query.category && query.category !== 'ALL') {
      where.category = query.category;
    }

    if (query.rating !== undefined && !isNaN(query.rating)) {
      where.rating = query.rating;
    }

    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { comment: { contains: query.search } },
        { userName: { contains: query.search } },
      ];
    }

    const total = await prisma.feedback.count({ where });
    const totalPages = Math.ceil(total / query.limit) || 1;
    const skip = (query.page - 1) * query.limit;

    const items = await prisma.feedback.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: { [query.sortBy]: query.sortOrder },
    });

    return res.status(200).json({
      success: true,
      data: items,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateFeedbackStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const { status, adminNotes } = updateFeedbackStatusSchema.parse(req.body);

    const existing = await prisma.feedback.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Feedback with ID ${id} was not found.`,
        },
      });
    }

    const updated = await prisma.feedback.update({
      where: { id },
      data: {
        status,
        ...(adminNotes !== undefined ? { adminNotes } : {}),
      },
    });

    // Create audit log entry
    if (req.adminUser) {
      await prisma.auditLog.create({
        data: {
          adminId: req.adminUser.id,
          action: 'STATUS_UPDATE',
          details: `Updated feedback [${id}] status from ${existing.status} to ${status}`,
        },
      });
    }

    logger.info({ id, oldStatus: existing.status, newStatus: status, admin: req.adminUser?.email }, 'Feedback status updated');

    return res.status(200).json({
      success: true,
      message: 'Feedback status updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};
