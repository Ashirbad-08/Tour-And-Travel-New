import express from "express";
const Router = express.Router();

import { searchPackages } from "../controller/searchPackage.controller.js";
import { getTop5CheapestPackages } from "../controller/searchPackage.controller.js";

Router.get("/cheapest", getTop5CheapestPackages);

Router.get("/", searchPackages);

export default Router;