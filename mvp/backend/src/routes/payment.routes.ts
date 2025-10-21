import { Router } from 'express';
import { razorpay, PLANS } from '../config/razorpay';
import { authenticate } from '../middleware/auth.middleware';
import { db } from '../config/database';
import crypto from 'crypto';

const router = Router();

// Get available plans
router.get('/plans', (req, res) => {
  res.json({ success: true, plans: PLANS });
});

// Create subscription order
router.post('/create-subscription', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { planTier } = req.body;

    if (!['PRO', 'AGENCY'].includes(planTier)) {
      return res.status(400).json({ error: 'Invalid plan tier' });
    }

    const plan = PLANS[planTier as keyof typeof PLANS];

    // Create Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env[`RAZORPAY_PLAN_${planTier}_ID`] || '', // You'll create plans in Razorpay dashboard
      customer_notify: 1,
      total_count: 12, // 12 months
      notes: {
        userId,
        planTier,
      },
    });

    res.json({
      success: true,
      subscriptionId: subscription.id,
      planDetails: plan,
    });
  } catch (error: any) {
    console.error('Subscription creation error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Create one-time payment order (alternative to subscription)
router.post('/create-order', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { planTier } = req.body;

    if (!['PRO', 'AGENCY'].includes(planTier)) {
      return res.status(400).json({ error: 'Invalid plan tier' });
    }

    const plan = PLANS[planTier as keyof typeof PLANS];

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: plan.price,
      currency: plan.currency,
      receipt: `order_${userId}_${Date.now()}`,
      notes: {
        userId,
        planTier,
      },
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment
router.post('/verify-payment', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planTier } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Update user subscription
    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

    await db.user.update({
      where: { id: userId },
      data: {
        planTier,
        subscriptionId: razorpay_payment_id,
        subscriptionEnd,
      },
    });

    res.json({ success: true, message: 'Payment verified and subscription activated' });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Verify subscription payment
router.post('/verify-subscription', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { razorpay_subscription_id, razorpay_payment_id, razorpay_signature, planTier } = req.body;

    // Verify signature
    const body = razorpay_payment_id + '|' + razorpay_subscription_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid subscription signature' });
    }

    // Update user subscription
    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

    await db.user.update({
      where: { id: userId },
      data: {
        planTier,
        subscriptionId: razorpay_subscription_id,
        subscriptionEnd,
      },
    });

    res.json({ success: true, message: 'Subscription verified and activated' });
  } catch (error: any) {
    console.error('Subscription verification error:', error);
    res.status(500).json({ error: 'Failed to verify subscription' });
  }
});

// Webhook handler for Razorpay events
router.post('/webhook', async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== webhookSignature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    switch (event) {
      case 'subscription.activated':
        // Handle subscription activation
        const subscriptionActivated = payload.subscription.entity;
        await handleSubscriptionActivated(subscriptionActivated);
        break;

      case 'subscription.charged':
        // Handle successful payment
        const subscriptionCharged = payload.subscription.entity;
        await handleSubscriptionCharged(subscriptionCharged);
        break;

      case 'subscription.cancelled':
        // Handle subscription cancellation
        const subscriptionCancelled = payload.subscription.entity;
        await handleSubscriptionCancelled(subscriptionCancelled);
        break;

      case 'payment.captured':
        // Handle one-time payment
        const payment = payload.payment.entity;
        await handlePaymentCaptured(payment);
        break;
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Helper functions for webhook handlers
async function handleSubscriptionActivated(subscription: any) {
  const userId = subscription.notes.userId;
  const planTier = subscription.notes.planTier;

  const subscriptionEnd = new Date();
  subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

  await db.user.update({
    where: { id: userId },
    data: {
      planTier,
      subscriptionId: subscription.id,
      subscriptionEnd,
    },
  });
}

async function handleSubscriptionCharged(subscription: any) {
  const userId = subscription.notes.userId;

  // Extend subscription by 1 month
  const subscriptionEnd = new Date();
  subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

  await db.user.update({
    where: { id: userId },
    data: {
      subscriptionEnd,
    },
  });
}

async function handleSubscriptionCancelled(subscription: any) {
  const userId = subscription.notes.userId;

  await db.user.update({
    where: { id: userId },
    data: {
      planTier: 'FREE',
      subscriptionId: null,
      subscriptionEnd: null,
    },
  });
}

async function handlePaymentCaptured(payment: any) {
  const userId = payment.notes.userId;
  const planTier = payment.notes.planTier;

  const subscriptionEnd = new Date();
  subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

  await db.user.update({
    where: { id: userId },
    data: {
      planTier,
      subscriptionId: payment.id,
      subscriptionEnd,
    },
  });
}

// Cancel subscription
router.post('/cancel-subscription', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const user = await db.user.findUnique({ where: { id: userId } });

    if (!user?.subscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // Cancel in Razorpay
    await razorpay.subscriptions.cancel(user.subscriptionId);

    // Update user
    await db.user.update({
      where: { id: userId },
      data: {
        planTier: 'FREE',
        subscriptionId: null,
        subscriptionEnd: null,
      },
    });

    res.json({ success: true, message: 'Subscription cancelled' });
  } catch (error: any) {
    console.error('Cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

export default router;
