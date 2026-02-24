import express from "express";
import {
  createFaq,
  getAllFaqs,
  getActiveFaqs,
  updateFaq,
  deleteFaq,
  toggleFaqStatus,
} from "../controller/faq.controller.js";

import {
  createFaqValidation,
  updateFaqValidation,
} from "../validator/faq.validation.js";

const router = express.Router();

/* ========= ADMIN ROUTES ========= */

router.post("/", createFaqValidation, createFaq);
router.get("/admin", getAllFaqs);
router.put("/:id", updateFaqValidation, updateFaq);
router.delete("/:id", deleteFaq);
router.patch("/toggle/:id", toggleFaqStatus);

/* ========= USER ROUTE ========= */

router.get("/", getActiveFaqs);

export default router;