import express from "express";
import {
  adminLogin,
  adminProfile,
  adminLogout,
} from "../controller/adminController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", adminLogin);

router.get("/profile", protectAdmin, adminProfile);

router.post("/logout", adminLogout);

export default router;
