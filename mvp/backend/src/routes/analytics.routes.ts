import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import prisma from '../config/database';

const router = Router();

// Get analytics for a business
router.get('/business/:businessId',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { businessId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify ownership
    const business = await prisma.business.findFirst({
      where: { id: businessId, userId: req.user?.id },
    });

    if (!business) {
      throw new AppError('Business not found', 404);
    }

    const where: any = { businessId };
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const analytics = await prisma.analytics.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    // Get top links
    const topLinks = await prisma.link.findMany({
      where: { businessId },
      include: {
        _count: {
          select: { clicks: true },
        },
      },
      orderBy: {
        clicks: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    res.json({ analytics, topLinks });
  })
);

// Get overview stats
router.get('/business/:businessId/overview',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { businessId } = req.params;

    // Verify ownership
    const business = await prisma.business.findFirst({
      where: { id: businessId, userId: req.user?.id },
    });

    if (!business) {
      throw new AppError('Business not found', 404);
    }

    // Get total stats
    const totalStats = await prisma.analytics.aggregate({
      where: { businessId },
      _sum: {
        views: true,
        uniqueViews: true,
        clicks: true,
      },
    });

    // Get last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentStats = await prisma.analytics.findMany({
      where: {
        businessId,
        date: { gte: sevenDaysAgo },
      },
      orderBy: { date: 'asc' },
    });

    res.json({
      total: {
        views: totalStats._sum.views || 0,
        uniqueViews: totalStats._sum.uniqueViews || 0,
        clicks: totalStats._sum.clicks || 0,
      },
      recent: recentStats,
    });
  })
);

export default router;
