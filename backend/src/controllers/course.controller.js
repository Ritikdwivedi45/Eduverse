import Course from "../models/Course.model.js";

import Lecture from '../models/Lecture.js';
import Enrollment from "../models/Enrollment.model.js";
import { AppError } from '../utils/errorHandler.js';

// @desc    Create a new course
// @route   POST /api/v1/courses
// @access  Private/Instructor
export const createCourse = async (req, res, next) => {
  try {
    const { title, description, price, category, difficulty } = req.body;
    
    // Check if instructor already has a course with same title
    const existingCourse = await Course.findOne({
      title,
      instructorId: req.user.id,
      isDeleted: false
    });
    
    if (existingCourse) {
      return next(new AppError('You already have a course with this title', 400));
    }
    
    const course = await Course.create({
      title,
      description,
      price,
      category,
      difficulty,
      instructorId: req.user.id,
      status: 'draft'
    });
    
    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all courses (with filters)
// @route   GET /api/v1/courses
// @access  Public/Private based on role
export const getCourses = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      difficulty,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = { isDeleted: false };
    
    // Apply filters based on user role
    if (req.user) {
      if (req.user.role === 'admin') {
        // Admin sees all non-deleted courses
      } else if (req.user.role === 'instructor') {
        // Instructors see their own courses
        query.instructorId = req.user.id;
      } else {
        // Students see only published courses
        query.status = 'published';
      }
    } else {
      // Public sees only published courses
      query.status = 'published';
    }
    
    // Apply additional filters
    if (status && ['draft', 'published', 'pending', 'rejected'].includes(status)) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const courses = await Course.find(query)
      .populate('instructorId', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);
    
    const total = await Course.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: courses,
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

// @desc    Get single course
// @route   GET /api/v1/courses/:id
// @access  Public/Private based on role
export const getCourse = async (req, res, next) => {
  try {
   const course = await Course.findOne({
  _id: req.params.id,
  isDeleted: false
});

    
    if (!course) {
      return next(new AppError('Course not found', 404));
    }
    
    // Check access permissions
    
    
    // If user is enrolled, include lectures
    let lectures = [];
    if (req.user && req.user.role === 'student') {
      const isEnrolled = await Enrollment.isEnrolled(req.user.id, course._id);
      if (isEnrolled) {
        lectures = await Lecture.find({
          courseId: course._id,
          isDeleted: false
        }).sort('order');
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        ...course.toObject(),
        lectures: lectures.length > 0 ? lectures : undefined
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/v1/courses/:id
// @access  Private/Instructor (own courses) or Admin
export const updateCourse = async (req, res, next) => {
  try {
    let course;
const id = req.params.id;

if (!isNaN(id)) {
  // Map 1,2,3 → actual MongoDB courses
  const courses = await Course.find({
    status: 'published',
    isDeleted: false
  }).sort({ createdAt: 1 });

  course = courses[Number(id) - 1];
} else {
  course = await Course.findOne({
    _id: id,
    isDeleted: false
  });
}

    
    if (!course) {
      return next(new AppError('Course not found', 404));
    }
    
    // Check permission
    if (req.user.role !== 'admin' && !course.instructorId.equals(req.user.id)) {
      return next(new AppError('Not authorized to update this course', 403));
    }
    
    // Prevent updating certain fields if course is published
    if (course.status === 'published' && req.user.role !== 'admin') {
      const allowedFields = ['title', 'description', 'category', 'difficulty'];
      Object.keys(req.body).forEach(key => {
        if (!allowedFields.includes(key)) {
          delete req.body[key];
        }
      });
    }
    
    // If instructor is changing price or other major fields, set to pending
    if (req.user.role === 'instructor' && course.status === 'published') {
      const reviewFields = ['price', 'thumbnail'];
      const needsReview = reviewFields.some(field => 
        req.body[field] !== undefined && req.body[field] !== course[field]
      );
      
      if (needsReview) {
        req.body.status = 'pending';
      }
    }
    
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedCourse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course (soft delete)
// @route   DELETE /api/v1/courses/:id
// @access  Private/Instructor (own courses) or Admin
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      isDeleted: false
    });
    
    if (!course) {
      return next(new AppError('Course not found', 404));
    }
    
    // Check permission
    if (req.user.role !== 'admin' && !course.instructorId.equals(req.user.id)) {
      return next(new AppError('Not authorized to delete this course', 403));
    }
    
    // Soft delete the course
    await course.softDelete();
    
    // Also soft delete associated lectures
    await Lecture.updateMany(
      { courseId: course._id },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );
    
    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject course
// @route   PATCH /api/v1/courses/:id/approve
// @access  Private/Admin
export const approveCourse = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    
    if (!['published', 'rejected'].includes(status)) {
      return next(new AppError('Invalid status. Use "published" or "rejected"', 400));
    }
    
    const course = await Course.findOne({
      _id: req.params.id,
      isDeleted: false,
      status: { $in: ['pending', 'draft'] }
    });
    
    if (!course) {
      return next(new AppError('Course not found or not in pending/draft status', 404));
    }
    
    course.status = status;
    if (status === 'rejected' && rejectionReason) {
      course.rejectionReason = rejectionReason;
    }
    
    await course.save();
    
    // Mock: Send notification to instructor
    // In production, send email/notification
    console.log(`Course ${course.title} has been ${status} by admin`);
    
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};