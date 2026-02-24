import express from "express";
import {
  getAdminNotifications,
  markNotificationRead
} from "../controller/notification.controller.js";

import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protectAdmin , getAdminNotifications);
router.patch("/:id/read", protectAdmin , markNotificationRead);

export default router;