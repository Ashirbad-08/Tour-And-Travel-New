import express from "express";
import { getTrendingPackages } from "../controller/trending.controller.js";

const router = express.Router();

router.get("/", getTrendingPackages);

export default router;
