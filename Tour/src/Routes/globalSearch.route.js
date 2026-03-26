import express from "express";
import {
   globalSearch,
   searchSuggestions
  } from "../controller/globalSearch.controller.js";

const router = express.Router();


router.get("/", globalSearch);
router.get("/suggestions", searchSuggestions);

export default router;

