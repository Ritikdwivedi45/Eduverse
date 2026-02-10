import express from "express";
import {
  getUsers,
  toggleUserBlock,
  getDashboardStats,
  getPendingCourses,
  getRevenueAnalytics
} from "../controllers/admin.controller.js";

import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin protection
router.use(protect);
router.use(authorize("admin"));

// User management
router.get("/users", getUsers);
router.put("/users/:id/block", toggleUserBlock);

// Dashboard
router.get("/stats", getDashboardStats);
router.get("/pending-courses", getPendingCourses);
router.get("/revenue-analytics", getRevenueAnalytics);

export default router;
