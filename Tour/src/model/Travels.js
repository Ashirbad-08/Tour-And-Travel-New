import mongoose from "mongoose";

const travelsSchema = new mongoose.Schema(
  {
    travelName: {
      type: String,
      required: [true, "Travel name is required"],
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[6-9]\d{9}$/, "Invalid phone number"],
    },

    address: {
      type: String,
      required: [true, "Address is required"],
    },

    jobField: {
      type: String,
      required: [true, "Job field is required"],
    },

    packages: {
      type: String,
      required: [true, "Packages are required"],
    },

    memberCategory: {
      type: String,
      enum: ["Gold", "Silver", "Bronze"],
      required: true,
    },

    image: {
      url: String,
      public_id: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Travels", travelsSchema);
