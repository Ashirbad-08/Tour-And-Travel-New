import express from "express";
const Router = express.Router();
import {createPackage,updatePackage,deletePackage,getPackageById,getAllPackages}  from "../controller/package.controller.js" 

import { protectAdmin } from "../middleware/authMiddleware.js";

// const { isAuth, isAdmin } = require("../middlewares/auth")

  Router.post("/create",protectAdmin,  createPackage);
Router.put("/:id",protectAdmin,  updatePackage);
Router.delete("/:id",protectAdmin, deletePackage);
Router.get("/:id", getPackageById);
Router.get("/", getAllPackages);

export default Router;
