const asyncHandler = require('express-async-handler');

const authorize = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  });
};

// Specific role middlewares
const requireAdmin = authorize('admin');
const requireInstructor = authorize('instructor');
const requireStudent = authorize('student');
const requireInstructorOrAdmin = authorize('instructor', 'admin');

// Check course ownership
const checkCourseOwnership = asyncHandler(async (req, res, next) => {
  const Course = require('../models/Course.model');
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Allow admin to access all courses
  if (req.user.role === 'admin') {
    req.course = course;
    return next();
  }

  // Check if user is the instructor of this course
  if (course.instructor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this course'
    });
  }

  req.course = course;
  next();
});

// Check enrollment
const checkEnrollment = asyncHandler(async (req, res, next) => {
  const Enrollment = require('../models/Enrollment.model');
  
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId || req.body.courseId
  });

  if (!enrollment) {
    return res.status(403).json({
      success: false,
      message: 'You are not enrolled in this course'
    });
  }

  req.enrollment = enrollment;
  next();
});

module.exports = {
  authorize,
  requireAdmin,
  requireInstructor,
  requireStudent,
  requireInstructorOrAdmin,
  checkCourseOwnership,
  checkEnrollment
};