import mongoose from "mongoose";

const bookingsSchema = new mongoose.Schema(
  {
    // 🔗 RELATIONS
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true
    },

    travelerName: {
      type: String,
      required: true,
      trim: true
    },

    bookingCode: {
      type: String,
      unique: true
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    duration: String,

    participants: {
      type: Number,
      required: true,
      min: 1
    },

    pricePerDay: {
      type: Number,
      required: true
    },

    price: Number,

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending"
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null
    },

    discountAmount: {
     type: Number,
     default: 0
    },

    finalPrice: {
      type: Number
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending"
    },

    refundRequested: {
      type: Boolean,
      default: false
    }
  },

  { timestamps: true }
  
);

export default mongoose.model("Booking", bookingsSchema);