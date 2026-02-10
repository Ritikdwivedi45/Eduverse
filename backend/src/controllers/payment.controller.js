import Payment from '../models/Payment.model.js';

import Course from '../models/Course.model.js';
import Enrollment from "../models/Enrollment.model.js";

import { AppError } from '../utils/errorHandler.js';
import { createRazorpayOrder, verifyPaymentSignature } from '../utils/razorpayUtils.js';


// @desc    Create Razorpay order
// @route   POST /api/v1/payments/create-order
// @access  Private/Student
export const createOrder = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    
    // Validate course
    const course = await Course.findOne({
      _id: courseId,
      status: 'published',
      isDeleted: false
    });
    
    if (!course) {
      return next(new AppError('Course not available for purchase', 404));
    }
    
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      studentId: req.user.id,
      courseId,
      isActive: true
    });
    
    if (existingEnrollment) {
      return next(new AppError('Already enrolled in this course', 400));
    }
    
    // Check if payment already exists and is pending
    const existingPayment = await Payment.findOne({
      studentId: req.user.id,
      courseId,
      status: { $in: ['created', 'attempted'] }
    });
    
    if (existingPayment) {
      return res.status(200).json({
        success: true,
        data: {
          orderId: existingPayment.orderId,
          amount: existingPayment.amount,
          currency: existingPayment.currency,
          razorpayOrder: existingPayment.razorpayOrder
        }
      });
    }
    
    // Create Razorpay order
    const amount = Math.round(course.price * 100); // Convert to paise
    
    const razorpayOrder = await createRazorpayOrder({
      amount,
      currency: 'INR',
      receipt: `course_${courseId}_${Date.now()}`,
      notes: {
        courseId: courseId.toString(),
        studentId: req.user.id.toString(),
        courseTitle: course.title
      }
    });
    
    // Save payment record
    const payment = await Payment.create({
      orderId: razorpayOrder.id,
      studentId: req.user.id,
      courseId,
      amount,
      currency: 'INR',
      status: 'created',
      razorpayOrder
    });
    
    res.status(200).json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount,
        currency: 'INR',
        razorpayOrder
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment and create enrollment
// @route   POST /api/v1/payments/verify
// @access  Private/Student
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Find payment record
    const payment = await Payment.findOne({
      orderId: razorpay_order_id,
      studentId: req.user.id,
      status: { $in: ['created', 'attempted'] }
    });
    
    if (!payment) {
      return next(new AppError('Payment record not found', 404));
    }
    
    // Verify payment signature
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    
    if (!isValid) {
      payment.status = 'failed';
      await payment.save();
      return next(new AppError('Payment verification failed', 400));
    }
    
    // Update payment record
    payment.paymentId = razorpay_payment_id;
    payment.signature = razorpay_signature;
    payment.status = 'paid';
    await payment.save();
    
    // Create enrollment
    const enrollment = await Enrollment.create({
      studentId: req.user.id,
      courseId: payment.courseId,
      paymentId: payment._id
    });
    
    // Update course enrollment count
    await Course.findByIdAndUpdate(payment.courseId, {
      $inc: { enrollmentsCount: 1 }
    });
    
    // Mock: Send enrollment confirmation email
    console.log(`Enrollment created for user ${req.user.id} in course ${payment.courseId}`);
    
    res.status(200).json({
      success: true,
      data: {
        payment,
        enrollment,
        message: 'Payment verified and enrollment successful'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment history
// @route   GET /api/v1/payments/history
// @access  Private/Student
export const getPaymentHistory = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status
    } = req.query;
    
    const query = { studentId: req.user.id };
    
    if (status) {
      query.status = status;
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const payments = await Payment.find(query)
      .populate('courseId', 'title thumbnail')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await Payment.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};