# Razorpay Setup Guide

## Overview
We're using Razorpay for payment processing instead of Stripe. Razorpay is popular in India and supports INR payments seamlessly.

---

## 1. Create Razorpay Account

1. Go to https://razorpay.com/
2. Click "Sign Up" and create an account
3. Complete KYC verification (required for production)
4. For now, you can use **Test Mode** to develop

---

## 2. Get API Keys

1. Login to Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Click **Generate Test Keys** (for development)
4. Copy:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret** (keep this secure!)

---

## 3. Configure Environment Variables

Add to your `backend/.env`:

```env
# Razorpay
RAZORPAY_KEY_ID="rzp_test_your_key_id_here"
RAZORPAY_KEY_SECRET="your_key_secret_here"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret_here"
```

---

## 4. Create Subscription Plans (Optional)

For recurring subscriptions, you can create plans in Razorpay:

1. Go to **Subscriptions** → **Plans** in Razorpay Dashboard
2. Create plans:
   - **Pro Plan**: ₹499/month
   - **Agency Plan**: ₹1499/month
3. Copy the Plan IDs and add to `.env`:

```env
RAZORPAY_PLAN_PRO_ID="plan_xxxxxxxxxxxxx"
RAZORPAY_PLAN_AGENCY_ID="plan_xxxxxxxxxxxxx"
```

---

## 5. Setup Webhook (for production)

1. Go to **Settings** → **Webhooks** in Razorpay Dashboard
2. Click **Add New Webhook**
3. Enter URL: `https://your-backend-url.com/api/payments/webhook`
4. Select events:
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.cancelled`
   - `payment.captured`
5. Copy the **Webhook Secret** and add to `.env`

---

## 6. Install Razorpay Package

```bash
cd backend
npm install razorpay
```

---

## 7. Database Migration

Since we changed from `stripeCustomerId` to `razorpayCustomerId`:

```bash
npm run db:push
```

This will update your database schema.

---

## API Endpoints

### Get Available Plans
```http
GET /api/payments/plans
```

Response:
```json
{
  "success": true,
  "plans": {
    "FREE": { "name": "Free", "price": 0, ... },
    "PRO": { "name": "Pro", "price": 49900, ... },
    "AGENCY": { "name": "Agency", "price": 149900, ... }
  }
}
```

### Create Order (One-time Payment)
```http
POST /api/payments/create-order
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "planTier": "PRO"
}
```

Response:
```json
{
  "success": true,
  "orderId": "order_xxxxx",
  "amount": 49900,
  "currency": "INR",
  "key": "rzp_test_xxxxx"
}
```

### Verify Payment
```http
POST /api/payments/verify-payment
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "xxxxx",
  "planTier": "PRO"
}
```

### Create Subscription
```http
POST /api/payments/create-subscription
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "planTier": "PRO"
}
```

### Cancel Subscription
```http
POST /api/payments/cancel-subscription
Authorization: Bearer <jwt-token>
```

---

## Frontend Integration (Angular)

You'll need to add Razorpay checkout script in your Angular app:

### 1. Add script to `index.html`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### 2. Create Payment Service:

```typescript
// payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

declare var Razorpay: any;

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  async createOrder(planTier: string) {
    return this.http.post(`${this.apiUrl}/create-order`, { planTier });
  }

  async verifyPayment(paymentData: any) {
    return this.http.post(`${this.apiUrl}/verify-payment`, paymentData);
  }

  openCheckout(orderId: string, amount: number, planTier: string) {
    const options = {
      key: 'YOUR_RAZORPAY_KEY_ID', // from environment
      amount: amount,
      currency: 'INR',
      name: 'OneLinks',
      description: `${planTier} Plan Subscription`,
      order_id: orderId,
      handler: (response: any) => {
        // Send to backend for verification
        this.verifyPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          planTier: planTier
        }).subscribe(result => {
          console.log('Payment verified!', result);
        });
      },
      prefill: {
        email: 'user@example.com',
        contact: '9999999999'
      },
      theme: {
        color: '#3B82F6'
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  }
}
```

### 3. Usage in Component:

```typescript
// pricing.component.ts
async upgradeToPro() {
  const order: any = await this.paymentService.createOrder('PRO').toPromise();
  
  if (order.success) {
    this.paymentService.openCheckout(
      order.orderId,
      order.amount,
      'PRO'
    );
  }
}
```

---

## Pricing

| Plan | Price (INR) | Price in Paise | Features |
|------|-------------|----------------|----------|
| Free | ₹0 | 0 | 1 business, 5 links |
| Pro | ₹499/month | 49900 | 5 businesses, 50 links, analytics |
| Agency | ₹1499/month | 149900 | Unlimited businesses & links |

**Note**: Razorpay amounts are in **paise** (1 INR = 100 paise)

---

## Testing

### Test Card Details (Test Mode):
- **Card Number**: 4111 1111 1111 1111
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **OTP**: 123456

### Test UPI:
- **UPI ID**: success@razorpay
- **OTP**: 123456

---

## Production Checklist

- [ ] Complete KYC verification on Razorpay
- [ ] Switch to Live Mode keys
- [ ] Configure webhook URL
- [ ] Test payment flow end-to-end
- [ ] Add error handling for failed payments
- [ ] Set up email notifications for successful payments
- [ ] Configure refund policy
- [ ] Add terms and conditions

---

## Resources

- Razorpay Docs: https://razorpay.com/docs/
- Subscription API: https://razorpay.com/docs/subscriptions/
- Checkout: https://razorpay.com/docs/payments/payment-gateway/
- Webhooks: https://razorpay.com/docs/webhooks/
