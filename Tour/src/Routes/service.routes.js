//import express from "express";
//import upload from "../middlewares/multer.middleware.js";
import express from "express";
import upload from "../middleware/upload.js"
//import multer from "multer";
import { protectAdmin } from "../middleware/authMiddleware.js";
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  createInfoPage,
  getInfoPages,
  getInfoPageById,
  updateInfoPage,
  deleteInfoPage,
  createPage,
  getPages,
  getPageById,
  updatePage,
  deletePage,
  createMultiImagePage,
  getMultiImagePages,
  getMultiImagePageById,
  updateMultiImagePage,
  deleteMultiImagePage,
  createNewPage,
  getNewPages,
  getNewPageById,
  updateNewPage,
  deleteNewPage
} from "../controller/service.controller.js";

const router = express.Router();

// ================= MULTER CONFIG =================
//const storage = multer.diskStorage({});
//const upload = multer({ storage });

// ================= SERVICE ROUTES =================
router.post("/services", upload.single("image"),protectAdmin, createService);
router.get("/services", getServices);
router.get("/services/:id", getServiceById);
router.put("/services/:id", upload.single("image"),protectAdmin, updateService);
router.delete("/services/:id",protectAdmin, deleteService);

// ================= INFO PAGE ROUTES =================
router.post("/info-pages",protectAdmin, createInfoPage);
router.get("/info-pages", getInfoPages);
router.get("/info-pages/:id", getInfoPageById);
router.put("/info-pages/:id",protectAdmin, updateInfoPage);
router.delete("/info-pages/:id",protectAdmin, deleteInfoPage);

// ================= SINGLE IMAGE PAGE ROUTES =================
router.post("/pages", upload.single("image"),protectAdmin, createPage);
router.get("/pages", getPages);
router.get("/pages/:id", getPageById);
router.put("/pages/:id", upload.single("image"),protectAdmin, updatePage);
router.delete("/pages/:id",protectAdmin, deletePage);

// ================= MULTI IMAGE PAGE ROUTES =================
router.post("/multi-pages", upload.array("images", 4),protectAdmin, createMultiImagePage);
router.get("/multi-pages", getMultiImagePages);
router.get("/multi-pages/:id", getMultiImagePageById);
router.put("/multi-pages/:id",protectAdmin, updateMultiImagePage); // Only title & description
router.delete("/multi-pages/:id",protectAdmin, deleteMultiImagePage);

// ================= NEW PAGE ROUTES =================
router.post("/new-pages", upload.single("image"),protectAdmin, createNewPage);
router.get("/new-pages", getNewPages);
router.get("/new-pages/:id", getNewPageById);
router.put("/new-pages/:id", upload.single("image"),protectAdmin, updateNewPage);
router.delete("/new-pages/:id",protectAdmin, deleteNewPage);

export default router;