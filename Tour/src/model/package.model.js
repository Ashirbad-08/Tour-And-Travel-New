
import mongoose from 'mongoose';
const travelPlanSchema = new mongoose.Schema({
  dayNumber: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});


// Main Package Schema
const packageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Package title is required"],
      trim: true
    },

    slug: {
      type: String,
      required: true,
      unique: true
    },

    destination: {
      type: String,
      required: [true, "Destination is required"],
      trim: true
    },

    price: {
      type: Number,
      required: true,
      min: [0, "Price must be greater than 0"]
    },

    durationDays: {
      type: Number,
      required: true,
      min: 1
    },

    durationNights: {
      type: Number,
      required: true,
      min: 0
    },

    maxPerson: {
      type: Number,
      required: true,
      min: 1
    },

    thumbnailImage: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true,
      enum: ["Adventure", "Family", "Honeymoon", "Luxury", "Budget"]
    },
includes: [String],
  excludes: [String],

    travelPlans: [travelPlanSchema],

  },
  { timestamps: true }
);

// Export model
export default  mongoose.model('Package', packageSchema);
