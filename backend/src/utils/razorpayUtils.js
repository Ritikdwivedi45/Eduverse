// Mock Razorpay functions
// In production, use actual Razorpay SDK

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export const createRazorpayOrder = async (options) => {
  // Mock implementation
  // In production:
  // const razorpay = new Razorpay({ key_id, key_secret });
  // const order = await razorpay.orders.create(options);
  
  return {
    id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    entity: 'order',
    amount: options.amount,
    amount_paid: 0,
    amount_due: options.amount,
    currency: options.currency || 'INR',
    receipt: options.receipt,
    status: 'created',
    attempts: 0,
    notes: options.notes,
    created_at: Date.now()
  };
};

export const verifyPaymentSignature = (orderId, paymentId, signature) => {
  // Mock implementation
  // In production, use crypto to verify signature
  
  // For development/testing, accept any signature
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // In production:
  // const crypto = require('crypto');
  // const generatedSignature = crypto
  //   .createHmac('sha256', RAZORPAY_KEY_SECRET)
  //   .update(orderId + '|' + paymentId)
  //   .digest('hex');
  // return generatedSignature === signature;
  
  return true; // Mock verification
};