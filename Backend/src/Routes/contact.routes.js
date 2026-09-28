import express from "express";
import {
  submitContactForm,
  getAllMessages,
  getSingleMessage,
  replyToMessage,
} from "../controller/contact.controller.js";

import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", submitContactForm);              
router.get("/", protectAdmin, getAllMessages);                  
router.get("/:id", protectAdmin, getSingleMessage);            
router.post("/reply/:id",protectAdmin, replyToMessage);      

export default router;