import Enrollment from "../models/Enrollment.model.js";
;
import Course from '../models/Course.model.js';
import Payment from '../models/Payment.model.js';
import { AppError } from '../utils/errorHandler.js';

// @desc    Create enrollment (called after successful payment)
// @route   POST /api/v1/enrollments
// @access  Private/Student
export const createEnrollment = async (req, res, next) => {
  try {
    const { paymentId, courseId } = req.body;
    
    // Verify payment
    const payment = await Payment.findOne({
      _id: paymentId,
      studentId: req.user.id,
      status: 'paid'
    });
    
    if (!payment) {
      return next(new AppError('Payment not found or not completed', 404));
    }
    
    // Check if course exists and is published
    const course = await Course.findOne({
      _id: courseId,
      status: 'published',
      isDeleted: false
    });
    
    if (!course) {
      return next(new AppError('Course not available for enrollment', 404));
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
    
    // Create enrollment
    const enrollment = await Enrollment.create({
      studentId: req.user.id,
      courseId,
      paymentId: payment._id
    });
    
    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrollmentsCount: 1 }
    });
    
    res.status(201).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my enrolled courses
// @route   GET /api/v1/enrollments/my-courses
// @access  Private/Student
export const getMyCourses = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'enrolledAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = {
      studentId: req.user.id,
      isActive: true
    };
    
    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const enrollments = await Enrollment.find(query)
      .populate({
        path: 'courseId',
        select: 'title description thumbnail instructorId price ratings',
        populate: {
          path: 'instructorId',
          select: 'name'
        }
      })
      .sort(sort)
      .skip(skip)
      .limit(limitNum);
    
    const total = await Enrollment.countDocuments(query);
    
    // Filter out enrollments with deleted courses
    const validEnrollments = enrollments.filter(enrollment => enrollment.courseId);
    
    res.status(200).json({
      success: true,
      data: validEnrollments,
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

// @desc    Get students enrolled in a course
// @route   GET /api/v1/enrollments/course/:courseId
// @access  Private/Instructor (own course) or Admin
export const getCourseEnrollments = async (req, res, next) => {
  try {
    const course = await Course.findOne({
      _id: req.params.courseId,
      isDeleted: false
    });
    
    if (!course) {
      return next(new AppError('Course not found', 404));
    }
    
    // Check permission
    if (req.user.role !== 'admin' && !course.instructorId.equals(req.user.id)) {
      return next(new AppError('Not authorized to view enrollments for this course', 403));
    }
    
    const {
      page = 1,
      limit = 20,
      sortBy = 'enrolledAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = {
      courseId: course._id,
      isActive: true
    };
    
    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const enrollments = await Enrollment.find(query)
      .populate('studentId', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);
    
    const total = await Enrollment.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: enrollments,
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

// @desc    Get enrollment progress
// @route   GET /api/v1/enrollments/:enrollmentId/progress
// @access  Private/Student (own enrollment) or Instructor/Admin
export const getEnrollmentProgress = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.enrollmentId)
      .populate('courseId', 'title')
      .populate('progress.completedLectures', 'title order');
    
    if (!enrollment) {
      return next(new AppError('Enrollment not found', 404));
    }
    
    // Check permission
    if (req.user.role === 'student' && !enrollment.studentId.equals(req.user.id)) {
      return next(new AppError('Not authorized to view this enrollment', 403));
    }
    
    // Get all lectures for the course to calculate progress
    const Lecture = (await import('../models/Lecture.js')).default;
    const totalLectures = await Lecture.countDocuments({
      courseId: enrollment.courseId,
      isDeleted: false
    });
    
    res.status(200).json({
      success: true,
      data: {
        enrollment,
        progress: {
          completed: enrollment.progress.completedLectures.length,
          total: totalLectures,
          percentage: enrollment.progress.completionPercentage
        }
      }
    });
  } catch (error) {
    next(error);
  }
};