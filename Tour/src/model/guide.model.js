import mongoose from "mongoose";

const guideSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
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

    phone:{
      type: String,
      required :[true, "phone number is required"],
      match: [/^\d{10}$/, "Contact must be 10 digits"],
    },

    avatar: {
      public_id: String,
      url: String,
    },

    title: {
      type: String,
      required : [true, "Title is required"],
    },

    experienceYears: Number,

    level: {
      type: String,
      enum: ["Junior", "Mid", "Senior"],
    },

    jobType: String,

    status: {
      type: String,
      default: "Active",
    },

    skills: [String],
  },
  { timestamps: true }
);

export default mongoose.model("Guide", guideSchema);
