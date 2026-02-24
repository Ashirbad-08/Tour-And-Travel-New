import express from "express";
import {
  getPackageReviews,
  createReview,
  getAllReviewsAdmin,
  getPendingReviews,
  updateReviewStatus,
  deleteReview
} from "../controller/review.controller.js";

import { protectAdmin } from "../middleware/authMiddleware.js";

import { userAuth } from "../middleware/userAuthMiddleware.js";

const router = express.Router();

//public 
router.get( "/packages/:packageId", getPackageReviews );

//user can create review for a package, but only one review per package
router.post( "/packages/:packageId", userAuth , createReview );

//admin can get all reviews, including pending ones, and update their status (approve/reject)

router.get( "/", protectAdmin, getAllReviewsAdmin );


router.get( "/pending", protectAdmin, getPendingReviews );

router.patch( "/:id", protectAdmin, updateReviewStatus );

//admin can delete any review, user can delete their own review
router.delete( "/:id",
  (req, res, next) => {
    if (req.cookies?.adminToken) {
      return protectAdmin(req, res, next);
    }
    return userAuth(req, res, next);
  },
  deleteReview
);

export default router;
