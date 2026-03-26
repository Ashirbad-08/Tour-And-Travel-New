/*import express from "express";
import multer from "multer";
import { createGallery, getAllGallery, deleteGallery } from "../controller/gallery.controller.js";

const router = express.Router();

// Multer config
const upload = multer({
  dest: "uploads/",
});

// Routes
router.post("/", upload.array("images", 10), createGallery);
router.get("/", getAllGallery);
router.delete("/:id", deleteGallery);

export default router;*/
import express from "express";
import multer from "multer";
import { createGallery, getAllGallery, deleteGallery } from "../controller/gallery.controller.js";

const router = express.Router();

// Multer config
const upload = multer({
  dest: "uploads/",
});

// Routes
router.post("/", upload.array("images", 10), createGallery);
router.get("/", getAllGallery);
router.delete("/:id", deleteGallery);

export default router;

