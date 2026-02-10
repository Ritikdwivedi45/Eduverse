import express from "express";
import {
  createEnrollment,
  getMyCourses,
  getCourseEnrollments,
  getEnrollmentProgress
} from "../controllers/enrollment.controller.js";

import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// Student routes
router.post("/", authorize("student"), createEnrollment);

router.get("/my-courses", authorize("student"), getMyCourses);

router.get(
  "/:enrollmentId/progress",
  authorize("student", "instructor", "admin"),
  getEnrollmentProgress
);

// Instructor / Admin routes
router.get(
  "/course/:courseId",
  authorize("instructor", "admin"),
  getCourseEnrollments
);

export default router;
