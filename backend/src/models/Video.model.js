const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayPaymentId: String,
  razorpaySignature: String,
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'card', 'netbanking', 'wallet', 'upi'],
    default: 'razorpay'
  },
  receipt: String,
  notes: {
    type: Map,
    of: String
  },
  refundAmount: Number,
  refundId: String,
  refundStatus: String,
  refundedAt: Date,
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return (this.amount / 100).toFixed(2); // Razorpay amount is in paise
});

// Check if payment is successful
paymentSchema.virtual('isSuccessful').get(function() {
  return this.status === 'completed';
});

// Check if payment is refunded
paymentSchema.virtual('isRefunded').get(function() {
  return this.status === 'refunded';
});

// Check if payment is pending
paymentSchema.virtual('isPending').get(function() {
  return this.status === 'pending';
});

module.exports = mongoose.model('Payment', paymentSchema);