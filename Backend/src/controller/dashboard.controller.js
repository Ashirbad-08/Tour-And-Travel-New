import { asyncHandler } from "../middleware/asyncHandler.js";
import logger from "../utils/logger.js";

import Booking from "../model/bookings.js";
import Package from "../model/package.model.js";
import User from "../model/user.model.js"

export const getDashboardOverview = asyncHandler(async (req, res) => {

  const totalBookings = await Booking.countDocuments();
  const totalPackages = await Package.countDocuments();
  const totalUsers = await User.countDocuments();

  const totalEarningsAgg = await Booking.aggregate([
    { $match: { status: "confirmed" } },
    {
      $group: {
        _id: null,
        total: { $sum: "$price" }
      }
    }
  ]);

  const totalEarnings =
    totalEarningsAgg.length > 0 ? totalEarningsAgg[0].total : 0;

  const totalTrips = await Booking.countDocuments();
  const confirmedTrips = await Booking.countDocuments({ status: "confirmed" });
  const pendingTrips = await Booking.countDocuments({ status: "pending" });
  const cancelledTrips = await Booking.countDocuments({ status: "cancelled" });

  res.status(200).json({
    success: true,
    data: {
      totalBookings,
      totalPackages,
      totalUsers,
      totalEarnings,
      totalTrips,
      tripStats: {
        Done: confirmedTrips,
        Booked: pendingTrips,
        cancelled: cancelledTrips
      }
    }
  });
});



export const getRevenueOverview = async (req, res) => {
  try {
    const period = (req.query.period || "week").toLowerCase();
    const now = new Date();

    if (period === "month") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);

      const monthlyData = await Booking.aggregate([
        {
          $match: {
            status: "confirmed",
            createdAt: { $gte: monthStart, $lt: monthEnd }
          }
        },
        {
          $group: {
            _id: { $ceil: { $divide: [{ $dayOfMonth: "$createdAt" }, 7] } },
            revenue: { $sum: "$price" }
          }
        }
      ]);

      const data = [1, 2, 3, 4, 5].map((w) => {
        const found = monthlyData.find((m) => m._id === w);
        return { week: `W${w}`, label: `W${w}`, revenue: found ? found.revenue : 0 };
      });

      const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

      return res.json({
        success: true,
        period: "month",
        totalRevenue,
        data,
        currentMonth: {
          start: monthStart,
          end: new Date(monthEnd.getTime() - 1),
          totalRevenue,
          weeks: data
        }
      });
    }

    if (period === "year") {
      const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      const yearEnd = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0, 0);
      const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      const yearlyData = await Booking.aggregate([
        {
          $match: {
            status: "confirmed",
            createdAt: { $gte: yearStart, $lt: yearEnd }
          }
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            revenue: { $sum: "$price" }
          }
        }
      ]);

      const data = monthLabels.map((label, idx) => {
        const month = idx + 1;
        const found = yearlyData.find((m) => m._id === month);
        return { month: label, label, revenue: found ? found.revenue : 0 };
      });

      const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

      return res.json({
        success: true,
        period: "year",
        totalRevenue,
        data,
        currentYear: {
          year: now.getFullYear(),
          totalRevenue,
          months: data
        }
      });
    }

    // Default: week
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const weeklyData = await Booking.aggregate([
      {
        $match: {
          status: "confirmed",
          createdAt: { $gte: startOfWeek, $lt: endOfWeek }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          revenue: { $sum: "$price" }
        }
      }
    ]);

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const data = weekDays.map((day, idx) => {
      const mongoDay = idx + 1; // 1=Sun
      const found = weeklyData.find((d) => d._id === mongoDay);
      return { day, label: day, revenue: found ? found.revenue : 0 };
    });

    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

    return res.json({
      success: true,
      period: "week",
      totalRevenue,
      data,
      currentWeek: {
        start: startOfWeek,
        end: new Date(endOfWeek.getTime() - 1),
        totalRevenue,
        days: data
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};




export const getTopDestinations = asyncHandler(async (req, res) => {

  const topDestinations = await Booking.aggregate([
    {
      $lookup: {
        from: "packages",
        localField: "package",
        foreignField: "_id",
        as: "pkgInfo"
      }
    },
    { $unwind: { path: "$pkgInfo", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: { $ifNull: ["$pkgInfo.title", "Unknown Package"] },
        totalBookings: { $sum: 1 }
      }
    },
    { $sort: { totalBookings: -1 } },
    { $limit: 5 }
  ]);

  res.status(200).json({
    success: true,
    data: topDestinations
  });
});



export const getRecentBookings = asyncHandler(async (req, res) => {

  const bookings = await Booking.find()
    .populate("package", "title")
    .sort({ createdAt: -1 })
    .limit(5);

  const formattedBookings = bookings.map((item) => ({
    travelerName: item.travelerName,
    packageName: item.package?.title || "Unknown Package",
    duration: item.duration,
    startDate: item.startDate,
    endDate: item.endDate,
    price: item.price,
    status: item.status
  }));

  res.status(200).json({
    success: true,
    count: formattedBookings.length,
    data: formattedBookings
  });
});



export const getUpcomingTrips = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 3;
    const skip = (page - 1) * limit;

    const today = new Date();

    const total = await Booking.countDocuments({
      startDate: { $gte: today },
      status: { $ne: "cancelled" }
    });

    const trips = await Booking.find({
      startDate: { $gte: today },
      status: { $ne: "cancelled" }
    })
      .populate("package", "title destination price thumbnailImage")
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: trips
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getRecentActivity = asyncHandler(async (req, res) => {

  const recentBookings = await Booking.find()
    .populate("package", "title")
    .sort({ createdAt: -1 })
    .limit(3);

  const cancelledBookings = await Booking.find({ status: "cancelled" })
    .populate("package", "title")
    .sort({ updatedAt: -1 })
    .limit(3);

  const completedBookings = await Booking.find({ status: "confirmed" })
    .populate("package", "title")
    .sort({ updatedAt: -1 })
    .limit(3);

  const activities = [];

  // Booking Activity
  recentBookings.forEach((booking) => {
    activities.push({
      type: "booking",
      message: `${booking.travelerName} booked the ${booking.package?.title || "Unknown"} package.`,
      time: booking.createdAt
    });
  });

  // Cancelled Activity
  cancelledBookings.forEach((booking) => {
    activities.push({
      type: "cancelled",
      message: `${booking.travelerName} cancelled the ${booking.package?.title || "Unknown"} package.`,
      time: booking.updatedAt
    });
  });

  completedBookings.forEach((booking) => {
    const formattedDate = new Date(booking.startDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short"
    });

    activities.push({
      type: "confirmed",
      message: `${booking.travelerName} confirmed the ${booking.package?.title || "Unknown"} package for ${formattedDate}`,
      time: booking.updatedAt
    });
  });

  activities.sort((a, b) => new Date(b.time) - new Date(a.time));

  res.status(200).json({
    success: true,
    count: activities.length,
    data: activities.slice(0, 5)
  });
});

export const getTravelPackages = async (req, res) => {
  try {
    const packages = await Package.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select(
        "title destination price durationDays durationNights category thumbnailImage createdAt"
      );

    res.status(200).json({
      success: true,
      total: packages.length,
      data: packages
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const bookingCalendar = asyncHandler(async (req, res) => {
  const now = new Date();
  const year = Number(req.query.year) || now.getFullYear();
  const month = Number(req.query.month) || (now.getMonth() + 1); // 1-12

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return res.status(400).json({
      success: false,
      message: "Invalid year or month. Use month as 1-12."
    });
  }

  const monthStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const monthEnd = new Date(year, month, 1, 0, 0, 0, 0);

  const bookings = await Booking.find({
    startDate: { $gte: monthStart, $lt: monthEnd },
    status: { $ne: "cancelled" }
  })
    .populate("package", "title destination")
    .select("travelerName package startDate endDate status participants price")
    .sort({ startDate: 1 });

  const calendarEvents = bookings.map((booking) => ({
    id: booking._id,
    day: new Date(booking.startDate).getDate(),
    travelerName: booking.travelerName,
    packageTitle: booking.package?.title || "Package Removed",
    destination: booking.package?.destination || null,
    startDate: booking.startDate,
    endDate: booking.endDate,
    status: booking.status,
    participants: booking.participants,
    price: booking.price
  }));

  const bookedDates = [...new Set(calendarEvents.map((event) => event.day))].sort((a, b) => a - b);

  res.status(200).json({
    success: true,
    year,
    month,
    total: calendarEvents.length,
    bookedDates,
    data: calendarEvents
  });

});
