const asyncHandler = require('express-async-handler');
const User = require('../models/User.model');
const Course = require('../models/Course.model');
const Enrollment = require('../models/Enrollment.model');
const cloudinary = require('../config/cloudinary.config');

// @desc    Get user profile
// @route   GET /api/v1/users/profile/:id
// @access  Public
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -verificationToken -verificationTokenExpire -resetPasswordToken -resetPasswordExpire')
    .populate({
      path: 'createdCourses',
      select: 'title thumbnail price studentsEnrolled ratings',
      match: { isPublished: true, isApproved: true }
    })
    .populate({
      path: 'enrolledCourses',
      select: 'title thumbnail price instructor',
      options: { limit: 6 }
    });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // If user is instructor, get additional stats
  let instructorStats = null;
  if (user.role === 'instructor') {
    const totalStudents = await Enrollment.countDocuments({
      course: { $in: user.createdCourses },
      status: { $in: ['active', 'completed'] }
    });

    const totalRevenue = await Enrollment.aggregate([
      {
        $match: {
          course: { $in: user.createdCourses }
        }
      },
      {
        $lookup: {
          from: 'payments',
          localField: 'payment',
          foreignField: '_id',
          as: 'paymentDetails'
        }
      },
      {
        $unwind: '$paymentDetails'
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$paymentDetails.amount' }
        }
      }
    ]);

    instructorStats = {
      totalCourses: user.createdCourses.length,
      totalStudents,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total / 100 : 0
    };
  }

  res.status(200).json({
    success: true,
    data: {
      user,
      instructorStats
    }
  });
});

// @desc    Update user avatar
// @route   PUT /api/v1/users/avatar
// @access  Private
const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image'
    });
  }

  const user = await User.findById(req.user.id);

  // Delete old avatar from Cloudinary if exists and not default
  if (user.avatar?.public_id && user.avatar.public_id !== 'default_avatar') {
    await cloudinary.uploader.destroy(user.avatar.public_id);
  }

  // Update user avatar
  user.avatar = {
    public_id: req.file.public_id,
    url: req.file.secure_url
  };

  await user.save();

  res.status(200).json({
    success: true,
    data: user.avatar
  });
});

// @desc    Update user role (request to become instructor)
// @route   PUT /api/v1/users/become-instructor
// @access  Private
const becomeInstructor = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user.role === 'instructor') {
    return res.status(400).json({
      success: false,
      message: 'You are already an instructor'
    });
  }

  const { bio, profession, socialLinks } = req.body;

  // Update user profile with instructor details
  user.role = 'instructor';
  user.bio = bio || user.bio;
  user.profession = profession || user.profession;
  
  if (socialLinks) {
    user.socialLinks = {
      ...user.socialLinks,
      ...JSON.parse(socialLinks)
    };
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Congratulations! You are now an instructor',
    data: user
  });
});

// @desc    Get user enrolled courses
// @route   GET /api/v1/users/enrolled-courses
// @access  Private (Student)
const getEnrolledCourses = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user.id })
    .populate({
      path: 'course',
      select: 'title thumbnail instructor duration totalLessons',
      populate: {
        path: 'instructor',
        select: 'name avatar'
      }
    })
    .sort('-lastAccessed');

  res.status(200).json({
    success: true,
    count: enrollments.length,
    data: enrollments
  });
});

// @desc    Get user dashboard data
// @route   GET /api/v1/users/dashboard
// @access  Private
const getDashboard = asyncHandler(async (req, res) => {
  const user = req.user;
  let dashboardData = {};

  if (user.role === 'student') {
    // Student dashboard
    const enrollments = await Enrollment.find({ student: user._id })
      .populate('course', 'title thumbnail category')
      .limit(5)
      .sort('-lastAccessed');

    const recentEnrollments = await Enrollment.find({ student: user._id })
      .populate('course', 'title thumbnail price')
      .limit(3)
      .sort('-enrolledAt');

    const progressStats = await Enrollment.aggregate([
      { $match: { student: user._id } },
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          completedCourses: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          averageProgress: { $avg: '$progress' }
        }
      }
    ]);

    dashboardData = {
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      stats: progressStats[0] || {
        totalCourses: 0,
        completedCourses: 0,
        averageProgress: 0
      },
      recentCourses: enrollments,
      recentEnrollments
    };
  } else if (user.role === 'instructor') {
    // Instructor dashboard
    const courses = await Course.find({ instructor: user._id })
      .select('title thumbnail price studentsEnrolled ratings status')
      .limit(5)
      .sort('-createdAt');

    const courseStats = await Course.aggregate([
      { $match: { instructor: user._id } },
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          publishedCourses: {
            $sum: { $cond: [{ $eq: ['$isPublished', true] }, 1, 0] }
          },
          totalStudents: { $sum: '$studentsEnrolled' },
          averageRating: { $avg: '$ratings.average' }
        }
      }
    ]);

    const revenueStats = await Enrollment.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'courseDetails'
        }
      },
      { $unwind: '$courseDetails' },
      { $match: { 'courseDetails.instructor': user._id } },
      {
        $lookup: {
          from: 'payments',
          localField: 'payment',
          foreignField: '_id',
          as: 'paymentDetails'
        }
      },
      { $unwind: '$paymentDetails' },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$paymentDetails.amount' },
          totalEnrollments: { $sum: 1 }
        }
      }
    ]);

    dashboardData = {
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      stats: courseStats[0] || {
        totalCourses: 0,
        publishedCourses: 0,
        totalStudents: 0,
        averageRating: 0
      },
      revenueStats: revenueStats[0] || {
        totalRevenue: 0,
        totalEnrollments: 0
      },
      recentCourses: courses
    };
  } else if (user.role === 'admin') {
    // Admin dashboard (handled in admin.controller.js)
    return res.status(200).json({
      success: true,
      message: 'Admin dashboard data available at /api/v1/admin/dashboard'
    });
  }

  res.status(200).json({
    success: true,
    data: dashboardData
  });
});

// @desc    Get user learning progress
// @route   GET /api/v1/users/progress
// @access  Private (Student)
const getLearningProgress = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user.id })
    .populate({
      path: 'course',
      select: 'title thumbnail duration totalLessons'
    })
    .sort('-lastAccessed');

  // Calculate overall progress
  const overallProgress = enrollments.reduce((acc, enrollment) => {
    return acc + (enrollment.progress || 0);
  }, 0) / (enrollments.length || 1);

  // Get completion rate
  const completedCourses = enrollments.filter(e => e.status === 'completed').length;
  const completionRate = enrollments.length > 0 ? 
    (completedCourses / enrollments.length) * 100 : 0;

  // Get time spent (mock data - in production, track actual time)
  const estimatedTimeSpent = enrollments.reduce((acc, enrollment) => {
    const courseDuration = enrollment.course?.duration || 0;
    return acc + (courseDuration * (enrollment.progress / 100));
  }, 0);

  res.status(200).json({
    success: true,
    data: {
      enrollments,
      statistics: {
        totalCourses: enrollments.length,
        completedCourses,
        overallProgress: Math.round(overallProgress),
        completionRate: Math.round(completionRate),
        estimatedTimeSpent: Math.round(estimatedTimeSpent)
      }
    }
  });
});

// @desc    Update user preferences
// @route   PUT /api/v1/users/preferences
// @access  Private
const updatePreferences = asyncHandler(async (req, res) => {
  const { emailNotifications, theme } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $set: {
        'preferences.emailNotifications': emailNotifications,
        'preferences.theme': theme
      }
    },
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({
    success: true,
    data: user.preferences
  });
});

// @desc    Search users (Admin only)
// @route   GET /api/v1/users/search
// @access  Private (Admin)
const searchUsers = asyncHandler(async (req, res) => {
  const { query, role, status, page = 1, limit = 20 } = req.query;

  const filter = {};

  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ];
  }

  if (role) {
    filter.role = role;
  }

  if (status) {
    filter.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const users = await User.find(filter)
    .select('-password -verificationToken -verificationTokenExpire -resetPasswordToken -resetPasswordExpire')
    .skip(skip)
    .limit(parseInt(limit))
    .sort('-createdAt');

  const total = await User.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    pages: Math.ceil(total / limit),
    data: users
  });
});

module.exports = {
  getUserProfile,
  updateAvatar,
  becomeInstructor,
  getEnrolledCourses,
  getDashboard,
  getLearningProgress,
  updatePreferences,
  searchUsers
};