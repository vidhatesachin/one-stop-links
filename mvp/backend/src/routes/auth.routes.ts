import { Router, Request, Response } from 'express';
import passport from 'passport';
import * as jwt from 'jsonwebtoken';
import { AuthRequest, authenticate } from '../middleware/auth.middleware';
import prisma from '../config/database';

const router = Router();

// Google OAuth - Initiate
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  session: false 
}));

// Google OAuth - Callback
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  async (req: Request, res: Response) => {
    const user = (req as AuthRequest).user;
    
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    const expiresIn: string | number = process.env.JWT_EXPIRES_IN || '7d';
    // @ts-ignore - JWT type issue
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      secret,
      { expiresIn }
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Get current user
router.get('/me',
  authenticate,
  async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const user = await prisma.user.findUnique({
      where: { id: authReq.user?.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        planTier: true,
        createdAt: true,
      },
    });

    res.json({ user });
  }
);

// Logout
router.post('/logout', (_req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
