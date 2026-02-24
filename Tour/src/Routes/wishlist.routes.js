import express from "express";
const Router = express.Router();

import { addToWishlist,removeFromWishlist,getWishlist } from "../controller/wishlist.controller.js";

Router.post("/", addToWishlist);
Router.delete("/:packageId", removeFromWishlist);
Router.get("/get", getWishlist);
export default Router;