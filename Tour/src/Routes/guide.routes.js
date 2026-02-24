import express from "express";
import upload from "../middleware/upload.js"; // your multer/cloudinary upload
import {
  createGuide,
  getGuides,
  getGuideById,
  deleteGuide,
  updateGuide
} from "../controller/guide.controller.js";
import { validateCreateGuide } from "../validator/guide.validation.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", upload.single("avatar"),protectAdmin, validateCreateGuide, createGuide);
router.get("/", getGuides);
router.get("/:id", getGuideById);
router.put("/:id", upload.single("avatar"),protectAdmin, updateGuide);
router.delete("/:id",protectAdmin, deleteGuide);

export default router;
