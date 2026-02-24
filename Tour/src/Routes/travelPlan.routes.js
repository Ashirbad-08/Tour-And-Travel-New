import express from "express";
const Router = express.Router();
import { addTravelPlan,updateTravelPlan,deleteTravelPlan,getTravelPlans } from "../controller/travelPlan.controller.js";
import { protectAdmin } from "../middleware/authMiddleware.js";
Router.post("/:packageId", protectAdmin, addTravelPlan);
Router.put("/:packageId/:planId", protectAdmin, updateTravelPlan);
Router.delete("/:packageId/:planId", protectAdmin, deleteTravelPlan);
Router.get("/:packageId", getTravelPlans);
export default Router;