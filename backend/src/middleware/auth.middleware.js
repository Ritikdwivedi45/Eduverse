import jwt from 'jsonwebtoken';
import User from "../models/User.model.js";

import { AppError } from '../utils/errorHandler.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return next(new AppError('Not authorized to access this route', 401));
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }
    
    // Check if user is blocked
    if (user.isBlocked) {
      return next(new AppError('Your account has been blocked', 403));
    }
    
    // Check if password was changed after token was issued
    if (user.passwordChangedAt) {
      const changedTimestamp = parseInt(
        user.passwordChangedAt.getTime() / 1000,
        10
      );
      
      if (decoded.iat < changedTimestamp) {
        return next(
          new AppError('User recently changed password. Please login again.', 401)
        );
      }
    }
    
    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Not authorized to access this route', 401));
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Middleware to check course ownership
export const checkCourseOwnership = async (req, res, next) => {
  try {
    const courseId = req.params.id || req.params.courseId;
    const Course = (await import('../models/Course.js')).default;
    
    const course = await Course.findOne({
      _id: courseId,
      isDeleted: false
    });
    
    if (!course) {
      return next(new AppError('Course not found', 404));
    }
    
    // Admin can access all courses
    if (req.user.role === 'admin') {
      req.course = course;
      return next();
    }
    
    // Instructors can only access their own courses
    if (req.user.role === 'instructor' && course.instructorId.equals(req.user.id)) {
      req.course = course;
      return next();
    }
    
    return next(new AppError('Not authorized to access this course', 403));
  } catch (error) {
    next(error);
  }
};

// Middleware to check enrollment
export const checkEnrollment = async (req, res, next) => {
  try {
    const courseId = req.params.id || req.params.courseId;
    const Enrollment = (await import('../models/Enrollment.js')).default;
    
    const isEnrolled = await Enrollment.isEnrolled(req.user.id, courseId);
    
    if (!isEnrolled && req.user.role !== 'admin') {
      return next(new AppError('You are not enrolled in this course', 403));
    }
    
    next();
  } catch (error) {
    next(error);
  }
};