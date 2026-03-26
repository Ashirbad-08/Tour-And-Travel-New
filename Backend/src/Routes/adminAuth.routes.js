import express from "express";
import {
  adminLogin,
  adminProfile,
  updateAdminProfile,
  changeAdminPassword,
  adminLogout,
} from "../controller/adminController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", adminLogin);

router.get("/profile", protectAdmin, adminProfile);
router.patch("/profile", protectAdmin, updateAdminProfile);
router.patch("/change-password", protectAdmin, changeAdminPassword);

router.post("/logout", adminLogout);

export default router;
