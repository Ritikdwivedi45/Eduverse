import express from "express";
import {
  createOrder,
  verifyPayment,
  getPaymentHistory
} from "../controllers/payment.controller.js";

import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// Student routes
router.post("/create-order", authorize("student"), createOrder);

router.post("/verify", authorize("student"), verifyPayment);

router.get("/history", authorize("student"), getPaymentHistory);

export default router;
