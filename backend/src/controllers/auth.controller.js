import asyncHandler from "express-async-handler";
import crypto from "crypto";
import User from "../models/User.model.js";
import sendEmail from "../utils/sendEmail.js";
import { generateToken } from "../utils/jwt.js";

/* =========================
   REGISTER
========================= */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ success: false, message: "User already exists" });
  }

  const user = await User.create({ name, email, password, role });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user,
  });
});

/* =========================
   LOGIN
========================= */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const token = generateToken(user._id);

  res.json({
    success: true,
    token,
    user,
  });
});

/* =========================
   LOGOUT
========================= */
export const logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: "Logged out" });
});

/* =========================
   GET ME
========================= */
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

/* =========================
   UPDATE DETAILS
========================= */
export const updateDetails = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, user });
});

/* =========================
   UPDATE PASSWORD
========================= */
export const updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.comparePassword(req.body.currentPassword))) {
    return res.status(401).json({ success: false, message: "Wrong password" });
  }

  user.password = req.body.newPassword;
  await user.save();

  res.json({ success: true });
});

/* =========================
   FORGOT PASSWORD
========================= */
export const forgotPassword = asyncHandler(async (req, res) => {
  res.json({ success: true, message: "Reset email sent (mock)" });
});

/* =========================
   RESET PASSWORD
========================= */
export const resetPassword = asyncHandler(async (req, res) => {
  res.json({ success: true, message: "Password reset" });
});

/* =========================
   VERIFY EMAIL
========================= */
export const verifyEmail = asyncHandler(async (req, res) => {
  res.json({ success: true, message: "Email verified" });
});

/* =========================
   RESEND VERIFICATION
========================= */
export const resendVerification = asyncHandler(async (req, res) => {
  res.json({ success: true, message: "Verification email sent" });
});
