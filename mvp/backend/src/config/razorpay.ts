import Razorpay from 'razorpay';

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('Razorpay credentials are not configured');
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Plan configurations (in paise - 1 INR = 100 paise)
export const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    currency: 'INR',
    interval: 'month',
    features: {
      businesses: 1,
      linksPerBusiness: 5,
      customDomain: false,
      analytics: false,
    },
  },
  PRO: {
    name: 'Pro',
    price: 49900, // ₹499
    currency: 'INR',
    interval: 'month',
    features: {
      businesses: 5,
      linksPerBusiness: 50,
      customDomain: true,
      analytics: true,
    },
  },
  AGENCY: {
    name: 'Agency',
    price: 149900, // ₹1499
    currency: 'INR',
    interval: 'month',
    features: {
      businesses: -1, // unlimited
      linksPerBusiness: -1, // unlimited
      customDomain: true,
      analytics: true,
    },
  },
};
