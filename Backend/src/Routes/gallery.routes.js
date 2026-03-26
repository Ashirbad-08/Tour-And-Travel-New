
import express from "express";
import upload from "../middleware/upload.js";
import { protectAdmin } from "../middleware/authMiddleware.js";
import {
  createGallery,
  getAllGallery,
  deleteGallery,
  updateGallery,
  reorderGalleryImages
} from "../controller/gallery.controller.js";

const router = express.Router();

router.post("/", protectAdmin, upload.array("images", 10), createGallery);
router.get("/", getAllGallery); // Public view
router.delete("/:id", protectAdmin, deleteGallery);
router.put("/:id", protectAdmin, upload.array("images", 10), updateGallery);
router.patch("/reorder/:id", protectAdmin, reorderGalleryImages);

export default router;
