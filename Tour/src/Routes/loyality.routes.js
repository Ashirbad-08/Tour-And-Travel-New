import express from "express";
const Router = express.Router();

import { addLoyaltyPoints,getRewardPoints } from "../controller/loyality.controller.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

Router.put("/",protectAdmin, addLoyaltyPoints);
Router.get("/:userId",protectAdmin, getRewardPoints);

export default Router;