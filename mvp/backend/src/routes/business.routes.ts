import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import prisma from '../config/database';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createBusinessSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  bio: z.string().max(500).optional(),
  theme: z.string().default('modern'),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#3B82F6'),
});

// Get all businesses for current user
router.get('/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const businesses = await prisma.business.findMany({
      where: { userId: req.user?.id },
      include: {
        links: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        contacts: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ businesses });
  })
);

// Get business by slug (public)
router.get('/slug/:slug',
  asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const business = await prisma.business.findUnique({
      where: { slug, published: true },
      include: {
        links: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        contacts: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    if (!business) {
      throw new AppError('Business not found', 404);
    }

    // Track view
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.analytics.upsert({
      where: {
        businessId_date: {
          businessId: business.id,
          date: today,
        },
      },
      update: {
        views: { increment: 1 },
        uniqueViews: { increment: 1 },
      },
      create: {
        businessId: business.id,
        date: today,
        views: 1,
        uniqueViews: 1,
        clicks: 0,
      },
    });

    res.json({ business });
  })
);

// Create new business
router.post('/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const validatedData = createBusinessSchema.parse(req.body);

    // Check if slug is unique
    const existing = await prisma.business.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existing) {
      throw new AppError('Slug already taken', 400);
    }

    // @ts-ignore - Prisma type issue
    const business = await prisma.business.create({
      data: {
        userId: req.user!.id,
        ...validatedData,
      },
    });

    res.status(201).json({ business });
  })
);

// Update business
router.patch('/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Check ownership
    const existing = await prisma.business.findFirst({
      where: { id, userId: req.user?.id },
    });

    if (!existing) {
      throw new AppError('Business not found', 404);
    }

    // Extract nested relations
    const { links, contacts, ...businessData } = req.body;

    // Update business basic data
    const business = await prisma.business.update({
      where: { id },
      data: businessData,
    });

    // Update links if provided
    if (links && Array.isArray(links)) {
      // Delete all existing links
      await prisma.link.deleteMany({
        where: { businessId: id },
      });

      // Create new links (filter out temp IDs)
      if (links.length > 0) {
        await prisma.link.createMany({
          data: links.map((link: any, index: number) => ({
            businessId: id,
            title: link.title,
            url: link.url,
            icon: link.icon || null,
            platform: link.platform || null,
            order: index,
            isActive: link.isActive !== false,
          })),
        });
      }
    }

    // Update contacts if provided
    if (contacts && Array.isArray(contacts)) {
      // Delete all existing contacts
      await prisma.contact.deleteMany({
        where: { businessId: id },
      });

      // Create new contacts
      if (contacts.length > 0) {
        await prisma.contact.createMany({
          data: contacts.map((contact: any, index: number) => ({
            businessId: id,
            platform: contact.platform,
            value: contact.value,
            label: contact.label || null,
            order: index,
            isActive: contact.isActive !== false,
          })),
        });
      }
    }

    // Fetch updated business with relations
    const updatedBusiness = await prisma.business.findUnique({
      where: { id },
      include: {
        links: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        contacts: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    res.json({ business: updatedBusiness });
  })
);

// Delete business
router.delete('/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Check ownership
    const existing = await prisma.business.findFirst({
      where: { id, userId: req.user?.id },
    });

    if (!existing) {
      throw new AppError('Business not found', 404);
    }

    await prisma.business.delete({
      where: { id },
    });

    res.json({ message: 'Business deleted successfully' });
  })
);

export default router;
