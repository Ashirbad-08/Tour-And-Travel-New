import express from "express";
import {
  register,
  login,
  verifyEmail,
  resendOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  logout,
  getMyProfile,
  updateMyProfile,
  changePassword,
  deactivateAccount,
  getUserBookings
} from "../controller/auth.controller.js";

import { apiLimiter } from "../middleware/rateLimiter.js";
import { userAuth } from "../middleware/userAuthMiddleware.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", apiLimiter, register);
router.post("/verify-email", apiLimiter, verifyEmail);
router.post("/resend-otp", apiLimiter, resendOTP);
router.post("/login", apiLimiter, login);
router.post("/forgot-password", apiLimiter, forgotPassword);
router.post("/verify-reset-otp", apiLimiter, verifyResetOTP);
router.post("/reset-password", apiLimiter, resetPassword);
router.post("/logout", apiLimiter, logout);

router.get("/me", userAuth, getMyProfile);
router.patch("/me", userAuth, updateMyProfile);
router.delete("/me", userAuth, deactivateAccount);
router.patch("/update-password", userAuth, changePassword);

router.get("/users/:id/bookings", userAuth, getUserBookings);

export default router;
