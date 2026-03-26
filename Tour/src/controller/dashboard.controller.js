import { asyncHandler } from "../middleware/asyncHandler.js";
import logger from "../utils/logger.js";

import Booking from "../model/bookings.js";
import Package from "../model/package.model.js";
import User from "../model/user.model.js"

export const getDashboardOverview = asyncHandler(async (req, res) => {

  const totalBookings = await Booking.countDocuments();

  const totalPackages = await Package.countDocuments();

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
      totalEarnings,
      totalTrips,
      tripStats: {
        Doned: confirmedTrips,
        Booked: pendingTrips,
        cancelled: cancelledTrips
      }
    }
  });
});



export const getRevenueOverview = async (req, res) => {
  try {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const weeklyData = await Booking.aggregate([
      {
        $match: {
          status: "confirmed",
          createdAt: { $gte: startOfWeek, $lte: endOfWeek }
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
    let weekResult = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);

      const mongoDay = i + 1;

      const found = weeklyData.find(d => d._id === mongoDay);

      weekResult.push({
        day: weekDays[i],
        date: currentDate.toISOString().split("T")[0],
        revenue: found ? found.revenue : 0
      });
    }

    const weekTotal = weekResult.reduce((sum, d) => sum + d.revenue, 0);

    res.json({
      success: true,
      currentWeek: {
        start: startOfWeek,
        end: endOfWeek,
        totalRevenue: weekTotal,
        days: weekResult
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
      $group: {
        _id: "$packageName",
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
    .sort({ createdAt: -1 })
    .limit(5);

  const formattedBookings = bookings.map((item) => ({
    travelerName: item.travelerName,
    packageName: item.packageName,
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
      .populate("package", "title destination price")
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




// export const getRecentActivity = asyncHandler(async (req, res) => {

//   // Recent Bookings
//   const recentBookings = await Booking.find()
//     .sort({ createdAt: -1 })
//     .limit(3);

//   // Recent Cancelled Bookings
//   const cancelledBookings = await Booking.find({ status: "cancelled" })
//     .sort({ updatedAt: -1 })
//     .limit(3);
  
//   const completedBookings = await Booking.find({status:"confirmed"})
//     .sort({updatedAt: -1})
//     .limit(3);


//   const activities = [];

//   // Booking Activity
//   recentBookings.forEach((booking) => {
//     activities.push({
//       type: "booking",
//       message: `${booking.travelerName} booked the ${booking.packageName} package.`,
//       time: booking.createdAt
//     });
//   });

//   // Cancelled Activity
//   cancelledBookings.forEach((booking) => {
//     activities.push({
//       type: "cancelled",
//       message: `${booking.travelerName} cancelled the ${booking.packageName} package.`,
//       time: booking.updatedAt
//     });
//   });
  
//   completedBookings.forEach((booking) => {
//       const formattedDate = new Date(booking.startDate).toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "short"
//     });
//     activities.push({
//       type: "confirmed",
//       message: `${booking.travelerName} confirmed the ${booking.packageName} package for ${formattedDate}`,
//       time: booking.updatedAt
//     });
//   });

//   // Sort All Activities by Latest
//   activities.sort((a, b) => new Date(b.time) - new Date(a.time));

//   res.status(200).json({
//     success: true,
//     count: activities.length,
//     data: activities.slice(0, 5) // show latest 5 like UI
//   });
// });


// export const getTravelPackages = asyncHandler(async (req, res) => {

//   const page = Number(req.query.page) || 1;
//   const limit = Number(req.query.limit) || 3;
//   const skip = (page - 1) * limit;

//   // 1️⃣ Get total unique package names from bookings
//   const totalPackagesAgg = await Booking.aggregate([
//     {
//       $group: {
//         _id: "$packageName"
//       }
//     }
//   ]);

//   const total = totalPackagesAgg.length;

//   // 2️⃣ Get top booked package names
//   const topPackages = await Booking.aggregate([
//     {
//       $group: {
//         _id: "$packageName",
//         totalBookings: { $sum: 1 }
//       }
//     },
//     { $sort: { totalBookings: -1 } },
//     { $skip: skip },
//     { $limit: limit }
//   ]);

//   const packageNames = topPackages.map(pkg => pkg._id);

//   // 3️⃣ Fetch packages using case-insensitive match
//   const packages = await Pakage.find({
//     title: {
//       $in: packageNames.map(name => new RegExp(`^${name}$`, "i"))
//     }
//   });

//   // 4️⃣ Format response
//   const formattedPackages = packages.map(pkg => ({
//     title: pkg.title,
//     destination: pkg.destination,
//     price: pkg.price,
//     duration: `${pkg.travelPlans?.length || 0} Days`,
//     slug: pkg.slug
//   }));

//   res.status(200).json({
//     success: true,
//     page,
//     limit,
//     totalPackages: total,
//     totalPages: Math.ceil(total / limit),
//     data: formattedPackages
//   });

// });

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
        "title location price durationDays durationNights category thumbnailImage createdAt"
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



// export const bookingCalendar = async (req, res) => {

//   try {
//     const bookings = await Booking.find({ status: "confirmed" })
//       .populate("package", "title")
//       .select("travelerName package startDate endDate status participants price")
//       .sort({ startDate: 1 });

//     const calendarEvents = bookings.map((booking) => ({
//       id: booking._id,
//       title: `${booking.travelerName} - ${booking.package?.title}`,
//       start: booking.startDate,
//       end: booking.endDate,
//       extendedProps: {
//         status: booking.status,
//         participants: booking.participants,
//         price: booking.price,
//       },
//     }));

//     res.status(200).json({
//       success: true,
//       total: calendarEvents.length,
//       data: calendarEvents,
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const bookingCalendar = asyncHandler(async (req, res) => {

  const bookings = await Booking.find({ status: "confirmed" })
    .populate("package", "title destination")
    .select("travelerName package startDate endDate status participants price")
    .sort({ startDate: 1 });

  const calendarEvents = bookings.map((booking) => ({
    id: booking._id,
    title: `${booking.travelerName} - ${
      booking.package?.title || "Package Removed"
    }`,
    start: booking.startDate,
    end: booking.endDate,
    extendedProps: {
      status: booking.status,
      participants: booking.participants,
      price: booking.price,
      destination: booking.package?.destination || null
    }
  }));

  res.status(200).json({
    success: true,
    total: calendarEvents.length,
    data: calendarEvents
  });

});