import User from "../models/User.model.js";
import Course from "../models/Course.model.js";
import Payment from "../models/Payment.model.js";
import Enrollment from "../models/Enrollment.model.js";
import { AppError } from "../utils/errorHandler.js";

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      isBlocked,
      search
    } = req.query;
    
    const query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (isBlocked !== undefined) {
      query.isBlocked = isBlocked === 'true';
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const users = await User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: users,
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

// @desc    Block/Unblock user
// @route   PUT /api/v1/admin/users/:id/block
// @access  Private/Admin
export const toggleUserBlock = async (req, res, next) => {
  try {
    const { action } = req.body; // 'block' or 'unblock'
    
    if (!['block', 'unblock'].includes(action)) {
      return next(new AppError('Invalid action. Use "block" or "unblock"', 400));
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    // Prevent blocking other admins
    if (user.role === 'admin' && req.user.id !== user._id.toString()) {
      return next(new AppError('Cannot block other administrators', 403));
    }
    
    user.isBlocked = action === 'block';
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user,
      message: `User ${action === 'block' ? 'blocked' : 'unblocked'} successfully`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    // Time periods for comparison
    const now = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    // Get total counts
    const [
      totalUsers,
      totalInstructors,
      totalCourses,
      totalEnrollments,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'instructor' }),
      Course.countDocuments({ isDeleted: false }),
      Enrollment.countDocuments({ isActive: true }),
      Payment.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);
    
    // Get monthly stats
    const monthlyStats = await Payment.aggregate([
      {
        $match: {
          status: 'paid',
          createdAt: { $gte: lastMonth }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          enrollments: { $addToSet: '$courseId' }
        }
      },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          year: '$_id.year',
          revenue: 1,
          enrollmentCount: { $size: '$enrollments' }
        }
      },
      { $sort: { year: 1, month: 1 } }
    ]);
    
    // Get recent enrollments
    const recentEnrollments = await Enrollment.find({ isActive: true })
      .populate('studentId', 'name email')
      .populate('courseId', 'title')
      .sort({ enrolledAt: -1 })
      .limit(10);
    
    // Get top courses by enrollment
    const topCourses = await Course.aggregate([
      { $match: { isDeleted: false } },
      { $sort: { enrollmentsCount: -1 } },
      { $limit: 5 },
      {
        $project: {
          title: 1,
          enrollmentsCount: 1,
          price: 1,
          instructorId: 1
        }
      }
    ]);
    
    // Populate instructor names
    await User.populate(topCourses, { path: 'instructorId', select: 'name' });
    
    res.status(200).json({
      success: true,
      data: {
        totals: {
          users: totalUsers,
          instructors: totalInstructors,
          courses: totalCourses,
          enrollments: totalEnrollments,
          revenue: totalRevenue[0]?.total || 0
        },
        monthlyStats,
        recentEnrollments,
        topCourses
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending courses for approval
// @route   GET /api/v1/admin/pending-courses
// @access  Private/Admin
export const getPendingCourses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const query = {
      status: 'pending',
      isDeleted: false
    };
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const courses = await Course.find(query)
      .populate('instructorId', 'name email')
      .sort({ createdAt: -1 })
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

// @desc    Get revenue analytics
// @route   GET /api/v1/admin/revenue-analytics
// @access  Private/Admin
export const getRevenueAnalytics = async (req, res, next) => {
  try {
    const { period = 'monthly' } = req.query;
    
    let groupBy;
    let dateFormat;
    
    switch (period) {
      case 'daily':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        dateFormat = '%Y-%m-%d';
        break;
      case 'weekly':
        groupBy = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        dateFormat = '%Y-W%U';
        break;
      case 'monthly':
      default:
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        dateFormat = '%Y-%m';
        break;
    }
    
    const revenueData = await Payment.aggregate([
      {
        $match: {
          status: 'paid',
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } // Last year
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$amount' },
          transactions: { $sum: 1 },
          averageOrderValue: { $avg: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          period: {
            $dateToString: {
              format: dateFormat,
              date: '$createdAt'
            }
          },
          revenue: 1,
          transactions: 1,
          averageOrderValue: 1
        }
      },
      { $sort: { period: 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: revenueData
    });
  } catch (error) {
    next(error);
  }
};