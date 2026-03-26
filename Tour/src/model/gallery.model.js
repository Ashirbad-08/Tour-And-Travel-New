/*import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Gallery", gallerySchema);*/
import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    imageUrls: 
      {
        type: [String],
        required: true,
      },
    
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Gallery", gallerySchema);

