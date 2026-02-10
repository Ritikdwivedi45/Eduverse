import express from 'express';
import {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  approveCourse
} from '../controllers/course.controller.js';
import { protect, authorize } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

// Public
router.get('/', getCourses);
router.get('/:id', getCourse);

// Protected
router.use(protect);

// Instructor
router.post('/', authorize('instructor','admin'), upload.single('thumbnail'), createCourse);
router.put('/:id', authorize('instructor','admin'), upload.single('thumbnail'), updateCourse);
router.delete('/:id', authorize('instructor','admin'), deleteCourse);

// Admin
router.patch('/:id/approve', authorize('admin'), approveCourse);

export default router;
