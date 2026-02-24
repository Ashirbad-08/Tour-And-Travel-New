import mongoose from "mongoose";

// USER SCHEMA
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    contact: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (value) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: "Please enter a valid email address",
      },
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum : ["user","admin","editor"],
    },

   loyaltyPoints: {
  type: Number,
  default: 0
},


    isVerified: {
      type: Boolean,
      default: false,
    },

    emailOTP: String,
    emailOTPExpire: Date,
    resetOTP: String,
    resetOTPExpire: Date,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
