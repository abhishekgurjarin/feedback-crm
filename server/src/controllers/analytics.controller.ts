import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';

export const getAnalyticsSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const total = await prisma.feedback.count();

    if (total === 0) {
      return res.status(200).json({
        success: true,
        data: {
          total: 0,
          averageRating: 0,
          npsScore: 0,
          categoryDistribution: [],
          statusDistribution: { NEW: 0, REVIEWED: 0, IN_PROGRESS: 0, RESOLVED: 0 },
          sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
          recentSubmissions: [],
        },
      });
    }

    // 1. Average Rating & NPS approximation
    const aggregate = await prisma.feedback.aggregate({
      _avg: { rating: true },
    });
    const averageRating = Number((aggregate._avg.rating || 0).toFixed(2));

    // Calculate promoters (4-5), passives (3), detractors (1-2)
    const [promoters, passives, detractors] = await Promise.all([
      prisma.feedback.count({ where: { rating: { gte: 4 } } }),
      prisma.feedback.count({ where: { rating: 3 } }),
      prisma.feedback.count({ where: { rating: { lte: 2 } } }),
    ]);
    const npsScore = Math.round(((promoters - detractors) / total) * 100);

    // 2. Category Distribution
    const byCategory = await prisma.feedback.groupBy({
      by: ['category'],
      _count: { category: true },
    });
    const categoryDistribution = byCategory
      .map((item) => ({
        category: item.category,
        count: item._count.category,
        percentage: Number(((item._count.category / total) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.count - a.count);

    // 3. Status Distribution
    const byStatus = await prisma.feedback.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    const statusDistribution: Record<string, number> = { NEW: 0, REVIEWED: 0, IN_PROGRESS: 0, RESOLVED: 0 };
    for (const item of byStatus) {
      statusDistribution[item.status] = item._count.status;
    }

    // 4. Recent Submissions (Top 5)
    const recentSubmissions = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return res.status(200).json({
      success: true,
      data: {
        total,
        averageRating,
        npsScore,
        categoryDistribution,
        statusDistribution,
        sentimentBreakdown: {
          positive: promoters,
          neutral: passives,
          negative: detractors,
        },
        recentSubmissions,
      },
    });
  } catch (err) {
    next(err);
  }
};
