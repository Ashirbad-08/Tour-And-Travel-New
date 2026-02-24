import mongoose from "mongoose";

// ================= SERVICE SCHEMA =================
const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true }, // Cloudinary URL
  },
  { timestamps: true }
);

export const Service = mongoose.model("Service", serviceSchema);

// ================= INFO PAGE SCHEMA =================
const infoPageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

export const InfoPage = mongoose.model("InfoPage", infoPageSchema);

// ================= SINGLE IMAGE PAGE SCHEMA =================
const pageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true }, // Cloudinary URL
  },
  { timestamps: true }
);

export const Page = mongoose.model("Page", pageSchema);

// ================= MULTI IMAGE PAGE SCHEMA =================
const multiImagePageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String, required: true }], // Array of Cloudinary URLs
  },
  { timestamps: true }
);

export const MultiImagePage = mongoose.model(
  "MultiImagePage",
  multiImagePageSchema
);

// ================= NEW PAGE SCHEMA =================
const newPageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true }, // Cloudinary URL
  },
  { timestamps: true }
);

export const NewPage = mongoose.model("NewPage", newPageSchema);
