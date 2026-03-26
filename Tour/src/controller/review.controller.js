import Review from "../model/review.model.js";
import Booking from "../model/bookings.js";
import { createNotification } from "../utils/createNotification.js";


//USER – GET ALL APPROVED REVIEWS FOR A PACKAGE------------------------------------

export const getPackageReviews = async (req, res) => {
  try {
    const { packageId } = req.params;

    const reviews = await Review.find({
      package: packageId,
      status: "approved"
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: reviews.length,
      data: reviews
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


//USER – CREATE REVIEW FOR A PACKAGE----------------------------

export const createReview = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const { packageId } = req.params;

    if (!rating || !review) {
      return res.status(400).json({
        success: false,
        message: "Rating and review are required"
      });
    }
//booking Validation
    const completedBooking = await Booking.findOne({
      user: req.user._id,
      package: packageId,
      status: "completed"
    });

    if (!completedBooking) {
      return res.status(403).json({
        success: false,
        message:
          "You can review this package only after completing your travel"
      });
    }

    //Prevent duplicate review
    const existingReview = await Review.findOne({
      user: req.user._id,
      package: packageId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this package"
      });
    }

    const newReview = await Review.create({
      user: req.user._id,
      package: packageId,
      rating,
      review,
      status: "pending"
    });

    res.status(201).json({
      success: true,
      message: "Review submitted and waiting for admin approval",
      data: newReview
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this package"
      });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};


//ADMIN – GET ALL REVIEWS (PENDING + APPROVED + REJECTED)----------------------------

export const getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "firstName lastName email")
      .populate("package", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


//ADMIN – GET PENDING REVIEWS ONLY----------------------------

export const getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: "pending" })
      .populate("user", "name email")
      .populate("package", "title");

    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


//ADMIN – APPROVE OR REJECT REVIEW----------------------------

export const updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    // Status can be changed ONLY when current status is "pending"
    if (review.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot change status once review is ${review.status}`
      });
    }

    review.status = status;
    await review.save();

    await createNotification({
    type: "review",
    title: "New Review Submitted",
    message: "A new review is waiting for admin approval",
    referenceId: review._id
    });

    res.json({
      success: true,
      message: `Review ${status} successfully`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


//ADMIN – DELETE REVIEW (APPROVED REVIEWS ONLY)----------------------------
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    //Pending reviews → no deletion
    if (review.status === "pending") {
      return res.status(403).json({
        success: false,
        message: "Pending reviews cannot be deleted"
      });
    }

    //Rejected reviews → no deletion
    if (review.status === "rejected") {
      return res.status(403).json({
        success: false,
        message: "Rejected reviews cannot be deleted"
      });
    }
    // Admin can delete any approved review
    if (review.status === "approved") {
    
      if (req.admin) {
        await review.deleteOne();
        return res.json({
          success: true,
          message: "Review deleted by admin"
        });
      }

      // User can delete ONLY own approved review
      if (
        req.user &&
        review.user.toString() === req.user._id.toString()
      ) {
        await review.deleteOne();
        return res.json({
          success: true,
          message: "Review deleted successfully"
        });
      }

      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this review"
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
