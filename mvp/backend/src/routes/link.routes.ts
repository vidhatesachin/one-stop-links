import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import prisma from '../config/database';
import { z } from 'zod';

const router = Router();

// Validation schema
const createLinkSchema = z.object({
  businessId: z.string().uuid(),
  title: z.string().min(1).max(100),
  url: z.string().url(),
  icon: z.string().optional(),
  platform: z.string().optional(),
});

// Get links for a business
router.get('/business/:businessId',
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

    const links = await prisma.link.findMany({
      where: { businessId },
      orderBy: { order: 'asc' },
    });

    res.json({ links });
  })
);

// Create link
router.post('/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const validatedData = createLinkSchema.parse(req.body);

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: { id: validatedData.businessId, userId: req.user?.id },
    });

    if (!business) {
      throw new AppError('Business not found', 404);
    }

    // Get max order
    const maxOrder = await prisma.link.aggregate({
      where: { businessId: validatedData.businessId },
      _max: { order: true },
    });

    const link = await prisma.link.create({
      data: {
        ...validatedData,
        order: (maxOrder._max.order || 0) + 1,
      },
    });

    res.status(201).json({ link });
  })
);

// Update link
router.patch('/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Verify ownership through business
    const existingLink = await prisma.link.findFirst({
      where: { 
        id,
        business: { userId: req.user?.id },
      },
    });

    if (!existingLink) {
      throw new AppError('Link not found', 404);
    }

    const link = await prisma.link.update({
      where: { id },
      data: req.body,
    });

    res.json({ link });
  })
);

// Delete link
router.delete('/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Verify ownership
    const existingLink = await prisma.link.findFirst({
      where: { 
        id,
        business: { userId: req.user?.id },
      },
    });

    if (!existingLink) {
      throw new AppError('Link not found', 404);
    }

    await prisma.link.delete({
      where: { id },
    });

    res.json({ message: 'Link deleted successfully' });
  })
);

// Track click
router.post('/:id/click',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { country, city, device, browser, referrer } = req.body;

    await prisma.click.create({
      data: {
        linkId: id,
        country,
        city,
        device,
        browser,
        referrer,
      },
    });

    // Update analytics
    const link = await prisma.link.findUnique({
      where: { id },
      select: { businessId: true },
    });

    if (link) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.analytics.upsert({
        where: {
          businessId_date: {
            businessId: link.businessId,
            date: today,
          },
        },
        update: {
          clicks: { increment: 1 },
        },
        create: {
          businessId: link.businessId,
          date: today,
          views: 0,
          uniqueViews: 0,
          clicks: 1,
        },
      });
    }

    res.json({ success: true });
  })
);

export default router;
