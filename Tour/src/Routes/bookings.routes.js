import express from "express";
import {
  createBooking,
  getAllBookings,
  getMyBookings,
  updateBooking,
  updateBookingStatus,
  updatePaymentStatus,
  deleteBooking,
  getBookingStats,
  applyCoupon,
  removeCoupon
} from "../controller/bookings.controller.js";

import { userAuth } from "../middleware/userAuthMiddleware.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// USER + ADMIN
router.post("/", (req, res, next) => {

    if (req.cookies?.adminToken) {

      return protectAdmin(req, res, next);
    }
    return userAuth(req, res, next);
  },
  createBooking
);

// USER
router.get("/my-bookings", userAuth, getMyBookings);
router.patch("/:id/status", userAuth, updateBookingStatus);

//Both admin and user can apply the coupon
router.patch("/apply-coupon/:id",(req, res, next) => {
    if (req.cookies?.adminToken) {return protectAdmin(req, res, next);}
    return userAuth(req, res, next);
  },applyCoupon);

//Both admin and user can remove the coupon  
router.delete("/remove-coupon/:id", (req, res, next) => {
    if (req.cookies?.adminToken) { return protectAdmin(req, res, next);}
    return userAuth(req, res, next);
  },removeCoupon);

// ADMIN
router.get("/", protectAdmin, getAllBookings);
router.put("/:id", protectAdmin, updateBooking);
router.patch("/status/:id", protectAdmin, updateBookingStatus);
router.patch("/payment-status/:id", protectAdmin, updatePaymentStatus );
router.delete("/:id", protectAdmin, deleteBooking);
router.get("/stats", protectAdmin, getBookingStats);

export default router;
