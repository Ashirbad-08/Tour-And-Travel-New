import Booking from "../model/bookings.js";
import Package from "../model/package.model.js";
import User from "../model/user.model.js"; // ✅ FIX 1: IMPORT USER
import {Coupon } from "../model/coupon.js";
import {createNotification} from "../utils/createNotification.js";


//CREATE BOOKING (USER + ADMIN)--------------------------------------------------

export const createBooking = async (req, res) => {
  try {
    const {
      travelerName,
      userId,
      packageId,
      startDate,
      endDate,
      participants,
      pricePerDay
    } = req.body;

    if (
      !travelerName ||
      !packageId ||
      !startDate ||
      !endDate ||
      !participants ||
      !pricePerDay
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    // Validate package
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: "Invalid package ID"
      });
    }

    let bookingUserId = null;

    // USER creates booking
    if (req.user) {
      bookingUserId = req.user._id;
    }

    // ADMIN creates booking
    if (req.admin) {
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required when admin creates booking"
        });
      }

      const foundUser = await User.findById(userId);
      if (!foundUser) {
        return res.status(404).json({
          success: false,
          message: "Invalid user ID"
        });
      }

      bookingUserId = foundUser._id;
    }

    if (!bookingUserId) {
      return res.status(401).json({
        success: false,
        message: "User not logged in"
      });
    }

//Date validation
const today = new Date();
today.setHours(0, 0, 0, 0);

const start = new Date(startDate);
start.setHours(0, 0, 0, 0);

const end = new Date(endDate);
end.setHours(0, 0, 0, 0);

if (start < today) {
  return res.status(400).json({
    success: false,
    message: "Start date cannot be in the past"
  });
}

if (end <= start) {
  return res.status(400).json({
    success: false,
    message: "End date must be after start date"
  });
}

    const diffDays = Math.ceil(
      (end - start) / (1000 * 60 * 60 * 24)
    );

    const totalPrice = diffDays * pricePerDay * participants;

    const booking = await Booking.create({
      travelerName,
      user: bookingUserId,
      package: packageId,
      startDate,
      endDate,
      participants,
      pricePerDay,
      price: totalPrice,
      duration: `${diffDays} Days`,
      status: "pending",
      bookingCode: "BKG" + Date.now()
    });

    await createNotification({
    type: "booking",
    title: "New Booking Created",
    message: `New booking ${booking.bookingCode} created`,
    referenceId: booking._id,
    forAdmin: true
   });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking
    });

  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ADMIN GET BOOKINGS (Pagination + Search)---------------------------------------

export const getAllBookings = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;
    const search = req.query.search || "";

    let query = {};

    if (search) {

      if (search.startsWith("BKG")) {

        // Exact match only
        const booking = await Booking.findOne({ bookingCode: search });

        if (!booking) {
          return res.status(400).json({
            success: false,
            message: "Invalid or incomplete booking code"
          });
        }

        return res.json({
          success: true,
          page: 1,
          limit: 1,
          totalPages: 1,
          totalBookings: 1,
          data: [booking]
        });

      } else {
        query = {
          $or: [
            { travelerName: { $regex: search, $options: "i" } },
            { packageName: { $regex: search, $options: "i" } }
          ]
        };
      }
    }

    const total = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalBookings: total,
      data: bookings
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ================= GET MY BOOKINGS (USER) ================= */

// GET MY BOOKINGS (USER) ----------------------------------------------

export const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("package", "title")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: bookings.length,
    data: bookings
  });
};



//UPDATE BOOKING (ADMIN) -------------------------------------

export const updateBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found"
    });
  }

  Object.assign(booking, req.body);
  await booking.save();

  await createNotification({
  type: "booking",
  title: `Booking ${booking.status}`,
  message: `Booking ${booking.bookingCode} marked as ${booking.status}`,
  referenceId: booking._id
});

  res.json({
    success: true,
    message: "Booking updated successfully",
    data: booking
  });
};


//UPDATE BOOKING STATUS-------------------------------

export const updateBookingStatus = async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found"
    });
  }

  if (["cancelled", "completed"].includes(booking.status)) {
    return res.status(400).json({
      success: false,
      message: `Booking already ${booking.status}`
    });
  }

  //USER cancellation after confirmation
  if (req.user) {
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Only confirmed bookings can be cancelled"
      });
    }
booking.status = "cancelled"
    ;
    booking.refundRequested = true;

    await booking.save();

    return res.json({
      success: true,
      message: "Booking cancelled. Refund will be processed",
      data: booking
    });
  }

  // ADMIN actions
  if (req.admin) {
    if (
      booking.status === "pending" &&
      !["confirmed", "cancelled"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Pending booking can only be confirmed or cancelled"
      });
    }

    if (
      booking.status === "confirmed" &&
      !["cancelled", "completed"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Confirmed booking can only be cancelled or completed"
      });
    }

    booking.status = status;
    await booking.save();

    return res.json({
      success: true,
      message: `Booking ${status} successfully`,
      data: booking
    });
  }

  return res.status(403).json({
    success: false,
    message: "Unauthorized"
  });
};



// UPDATE PAYMENT STATUS (ADMIN) --------------------------------------------

export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const allowedStatuses = ["pending", "paid", "failed", "refunded"];

    if (!allowedStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status"
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Confirmed booking can only be cancelled or completed"
      });
    }

    //Cannot change payment after completion
    if (booking.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed booking payment cannot be changed"
      });
    }

    // Cannot mark paid if booking cancelled
    if (booking.status === "cancelled" && paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Cancelled booking cannot be marked as paid"
      });
    }

    //Refund only if already paid
    if (paymentStatus === "refunded" && booking.paymentStatus !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Refund allowed only for paid bookings"
      });
    }

    booking.paymentStatus = paymentStatus;
    await booking.save();

    res.json({
      success: true,
      message: `Payment status updated to ${paymentStatus}`,
      data: booking
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE BOOKING (ADMIN) -----------------------------------------------------

export const deleteBooking = async (req, res) => {
  await Booking.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Booking deleted successfully"
  });
};


// BOOKING STATISTICS (ADMIN PANEL)---------------------------------------------------

export const getBookingStats = async (req, res) => {
  try {

    const totalBookings = await Booking.countDocuments();

    const participantsAgg = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: "$participants" } } }
    ]);

    const earningsAgg = await Booking.aggregate([
      { $match: { status: "confirmed" } },
      { $group: { _id: null, total: { $sum: "$price" } } }
    ]);

    const topPackages = await Booking.aggregate([
      {
        $group: {
          _id: "$packageName",
          totalBookings: { $sum: 1 },
          totalParticipants: { $sum: "$participants" }
        }
      },
      { $sort: { totalParticipants: -1 } },
      { $limit: 4 }
    ]);

    const tripsOverview = await Booking.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.month": 1 } }
    ]);

    res.json({
      success: true,
      totalBookings,
      totalParticipants: participantsAgg[0]?.total || 0,
      totalEarnings: earningsAgg[0]?.total || 0,
      topPackages,
      tripsOverview
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// APPLY COUPON (USER + ADMIN) --------------------------------------------
export const applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;

    if (!couponCode) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    //AUTHORIZATION
    if (req.user) {
      if (booking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }
    }
    // admin allowed

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "Coupon can be applied only to pending bookings"
      });
    }

    if (booking.coupon) {
      return res.status(400).json({
        message: "Coupon already applied"
      });
    }

    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true
    });

    if (!coupon) {
      return res.status(400).json({ message: "Invalid coupon" });
    }

    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      return res.status(400).json({ message: "Coupon expired" });
    }

    //GLOBAL USAGE LIMIT
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        message: "Coupon usage limit reached"
      });
    }

    if (req.user && coupon.perUserLimit) {
  const alreadyUsed = await Booking.exists({
    user: req.user._id,
    coupon: coupon._id
  });

  if (alreadyUsed) {
    return res.status(400).json({
      message: "You have already used this coupon"
    });
  }
}

    //CALCULATE DISCOUNT
    let discountAmount = 0;

    if (coupon.discount_type === "percentage") {
      discountAmount = (booking.price * coupon.discountValue) / 100;

      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(
          discountAmount,
          coupon.maxDiscountAmount
        );
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    booking.coupon = coupon._id;
    booking.discountAmount = discountAmount;
    booking.finalPrice = booking.price - discountAmount;

    //UPDATE COUPON USAGE
    coupon.usedCount += 1;


    await coupon.save();
    await booking.save();

    res.json({
      success: true,
      message: "Coupon applied successfully",
      data: booking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// REMOVE COUPON (USER + ADMIN) --------------------------------------------
export const removeCoupon = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // AUTHORIZATION
    if (req.user) {
      if (booking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }
    }
    // admin allowed

    if (!booking.coupon) {
      return res.status(400).json({ message: "No coupon applied" });
    }

    if (booking.status === "completed") {
      return res.status(400).json({
        message: "Cannot modify completed booking"
      });
    }

    const coupon = await Coupon.findById(booking.coupon);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    const userId = req.user ? req.user._id.toString() : null;


    if (coupon.usedCount > 0) {
      coupon.usedCount -= 1;
    }

    // RESTORE PRICE
    booking.finalPrice += booking.discountAmount;
    booking.discountAmount = 0;
    booking.coupon = null;

    await coupon.save();
    await booking.save();

    res.json({
      success: true,
      message: "Coupon removed successfully",
      data: booking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
