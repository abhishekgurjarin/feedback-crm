import { z } from 'zod';

export const createFeedbackSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters long')
    .max(100, 'Title cannot exceed 100 characters')
    .trim(),
  category: z.enum(
    ['Bug Report', 'Feature Request', 'UI/UX', 'Performance', 'Praise', 'Other'],
    {
      errorMap: () => ({ message: 'Please select a valid feedback category' }),
    }
  ),
  rating: z
    .number({ invalid_type_error: 'Rating must be a number' })
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  comment: z
    .string()
    .min(5, 'Please provide more details in your comment (min 5 characters)')
    .max(1000, 'Comment cannot exceed 1000 characters')
    .trim(),
  userEmail: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  userName: z
    .string()
    .max(50, 'Name cannot exceed 50 characters')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
});

export const getFeedbackQuerySchema = z.object({
  page: z.string().optional().default('1').transform((val) => Math.max(1, parseInt(val, 10) || 1)),
  limit: z.string().optional().default('10').transform((val) => Math.min(100, Math.max(1, parseInt(val, 10) || 10))),
  category: z.string().optional(),
  rating: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
  status: z.string().optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(['createdAt', 'rating', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const updateFeedbackStatusSchema = z.object({
  status: z.enum(['NEW', 'REVIEWED', 'IN_PROGRESS', 'RESOLVED'], {
    errorMap: () => ({ message: 'Invalid status provided' }),
  }),
  adminNotes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});
