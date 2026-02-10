const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateAvatar,
  becomeInstructor,
  getEnrolledCourses,
  getDashboard,
  getLearningProgress,
  updatePreferences,
  searchUsers
} = require('../controllers/user.controller');
const {
  protect,
  optionalAuth
} = require('../middleware/auth.middleware');
const {
  requireAdmin,
  requireInstructor,
  requireStudent
} = require('../middleware/role.middleware');
const {
  uploadSingleImage
} = require('../middleware/upload.middleware');

// Public routes
router.get('/profile/:id', optionalAuth, getUserProfile);

// Protected routes
router.put('/avatar', protect, uploadSingleImage, updateAvatar);
router.put('/become-instructor', protect, becomeInstructor);
router.get('/enrolled-courses', protect, requireStudent, getEnrolledCourses);
router.get('/dashboard', protect, getDashboard);
router.get('/progress', protect, requireStudent, getLearningProgress);
router.put('/preferences', protect, updatePreferences);

// Admin routes
router.get('/admin/search', protect, requireAdmin, searchUsers);

module.exports = router;