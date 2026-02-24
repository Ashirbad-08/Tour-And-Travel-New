import express from "express";
import {
  getDashboardOverview,
  getRevenueOverview,
  getTopDestinations,
  getRecentBookings,
  getUpcomingTrips,
  getRecentActivity,
  getTravelPackages,
  bookingCalendar,
} from "../controller/dashboard.controller.js";
import { protectAdmin } from "../middleware/authMiddleware.js";


const router = express.Router();

router.get("/overview",protectAdmin, getDashboardOverview);
router.get("/revenue",protectAdmin, getRevenueOverview);
router.get("/top-destinations",protectAdmin, getTopDestinations);
router.get("/recent-bookings",protectAdmin, getRecentBookings);
router.get("/upcoming-trips",protectAdmin, getUpcomingTrips);
router.get("/recent-activity",protectAdmin, getRecentActivity);

router.get("/travel-packages",protectAdmin, getTravelPackages);
router.get("/booking-calender",protectAdmin, bookingCalendar);

export default router;
