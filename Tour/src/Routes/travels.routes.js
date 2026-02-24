import express from "express";
import upload from "../middleware/upload.js";
import {
  createTravels,
  getTravels,
  getSingleTravels,
  deleteTravels,
} from "../controller/travels.controller.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/travels", upload.single("image"),protectAdmin, createTravels);
router.get("/travels", getTravels);
router.get("/travels/:id", getSingleTravels);
router.delete("/travels/:id",protectAdmin, deleteTravels);

export default router;
