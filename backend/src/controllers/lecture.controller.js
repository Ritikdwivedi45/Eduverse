import Lecture from '../models/Lecture.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { AppError } from '../utils/errorHandler.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// @desc    Upload lecture video
// @route   POST /api/v1/courses/:id/lectures
// @access  Private/Instructor
export const uploadLecture = async (req, res, next) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      isDeleted: false
    });
    
    if (!course) {
      return next(new AppError('Course not found', 404));
    }
    
    // Check if user is the instructor
    if (!course.instructorId.equals(req.user.id) && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to add lectures to this course', 403));
    }
    
    const { title, description, order, isPreview } = req.body;
    
    if (!req.file) {
      return next(new AppError('Video file is required', 400));
    }
    
    // Upload to Cloudinary (mock implementation)
    const uploadResult = await uploadToCloudinary(req.file);
    
    // Validate video duration (mock - in production, use ffprobe or similar)
    const duration = Math.floor(Math.random() * 1200) + 60; // Mock: 1-20 minutes
    
    const lecture = await Lecture.create({
      title,
      description,
      videoUrl: uploadResult.secure_url,
      duration,
      order: order ? parseInt(order) : undefined,
      courseId: course._id,
      isPreview: isPreview === 'true'
    });
    
    res.status(201).json({
      success: true,
      data: lecture
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get course lectures
// @route   GET /api/v1/courses/:id/lectures
// @access  Private (enrolled students) or Public (preview lectures)
export const getLectures = async (req, res, next) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      isDeleted: false
    });
    
    if (!course) {
      return next(new AppError('Course not found', 404));
    }
    
    // Check if user can access lectures
    let canAccess = false;
    
    if (req.user) {
      if (req.user.role === 'admin') {
        canAccess = true;
      } else if (req.user.role === 'instructor' && course.instructorId.equals(req.user.id)) {
        canAccess = true;
      } else if (req.user.role === 'student') {
        const isEnrolled = await Enrollment.isEnrolled(req.user.id, course._id);
        canAccess = isEnrolled;
      }
    }
    
    // Build query
    const query = {
      courseId: course._id,
      isDeleted: false
    };
    
    // If not enrolled, only show preview lectures
    if (!canAccess) {
      query.isPreview = true;
      
      // Check if course is published
      if (course.status !== 'published') {
        return next(new AppError('Not authorized to view lectures', 403));
      }
    }
    
    const lectures = await Lecture.find(query)
      .sort('order')
      .select('-isDeleted -deletedAt');
    
    res.status(200).json({
      success: true,
      data: lectures,
      canAccess // Send info about access level
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lecture
// @route   DELETE /api/v1/lectures/:lectureId
// @access  Private/Instructor (own courses) or Admin
export const deleteLecture = async (req, res, next) => {
  try {
    const lecture = await Lecture.findOne({
      _id: req.params.lectureId,
      isDeleted: false
    }).populate('courseId');
    
    if (!lecture || !lecture.courseId) {
      return next(new AppError('Lecture not found', 404));
    }
    
    const course = lecture.courseId;
    
    // Check permission
    if (req.user.role !== 'admin' && !course.instructorId.equals(req.user.id)) {
      return next(new AppError('Not authorized to delete this lecture', 403));
    }
    
    // Soft delete the lecture
    await lecture.softDelete();
    
    // Update enrollment progress for students who completed this lecture
    await Enrollment.updateMany(
      {
        courseId: course._id,
        'progress.completedLectures': lecture._id
      },
      {
        $pull: { 'progress.completedLectures': lecture._id }
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'Lecture deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark lecture as completed
// @route   POST /api/v1/lectures/:lectureId/complete
// @access  Private/Student (enrolled)
export const markLectureComplete = async (req, res, next) => {
  try {
    const lecture = await Lecture.findOne({
      _id: req.params.lectureId,
      isDeleted: false
    });
    
    if (!lecture) {
      return next(new AppError('Lecture not found', 404));
    }
    
    // Check if student is enrolled
    const enrollment = await Enrollment.findOne({
      studentId: req.user.id,
      courseId: lecture.courseId,
      isActive: true
    });
    
    if (!enrollment) {
      return next(new AppError('You are not enrolled in this course', 403));
    }
    
    // Mark lecture as completed
    await enrollment.markLectureCompleted(lecture._id);
    
    res.status(200).json({
      success: true,
      data: enrollment.progress
    });
  } catch (error) {
    next(error);
  }
};