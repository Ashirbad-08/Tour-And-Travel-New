import express from "express";
const Router = express.Router();

import { addToWishlist,removeFromWishlist,getWishlist } from "../controller/wishlist.controller.js";
import { userAuth } from "../middleware/userAuthMiddleware.js";

Router.post("/",userAuth, addToWishlist);
Router.delete("/:packageId",userAuth, removeFromWishlist);
Router.get("/get", getWishlist);
export default Router;