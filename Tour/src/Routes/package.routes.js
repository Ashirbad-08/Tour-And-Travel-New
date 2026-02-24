import express from "express";
const Router = express.Router();
import {createPackage,updatePackage,deletePackage,getPackageById,getAllPackages}  from "../controller/package.controller.js" 
import upload from "../middleware/upload.js";

import { protectAdmin } from "../middleware/authMiddleware.js";

// const { isAuth, isAdmin } = require("../middlewares/auth")

  // Router.post("/create",protectAdmin,  createPackage);
  Router.post(
  "/create",
  protectAdmin,
  upload.single("thumbnailImage"), 
  createPackage
);
Router.put("/:id",protectAdmin, upload.single("thumbnailImage"), updatePackage);
Router.delete("/:id",protectAdmin, deletePackage);
Router.get("/:id",protectAdmin, getPackageById);
Router.get("/", getAllPackages);

export default Router;