import Wishlist from "../model/wishlist.model.js";
import Package from "../model/package.model.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import User from "../model/user.model.js";
import mongoose from "mongoose";
/**
 * ADD TO WISHLIST
 */
export const addToWishlist = asyncHandler(async (req, res) => {
  

  const { packageId } = req.body;

  // 🔹 Get logged-in user ID from middleware
  const userId = req.user.id;

  // 🔹 Validate packageId
  if (!packageId) {
    return res.status(400).json({
      success: false,
      message: "Package ID is required"
    });
  }

  if (!mongoose.Types.ObjectId.isValid(packageId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid package ID"
    });
  }

  // 🔹 Check if package exists
  const packageExists = await Package.findById(packageId);

  if (!packageExists) {
    return res.status(404).json({
      success: false,
      message: "Package not found"
    });
  }

  // 🔹 Check if already in wishlist for this user
  const existing = await Wishlist.findOne({
    user: userId,
    package: packageId
  });

  if (existing) {
    return res.status(409).json({
      success: false,
      message: "Package already in wishlist"
    });
  }

  // 🔹 Create wishlist entry
  const wishlistItem = await Wishlist.create({
    user: userId,
    package: packageId
  });

  // 🔹 Push wishlist ID into user document
  await User.findByIdAndUpdate(
    userId,
    { $push: { wishlist: wishlistItem._id } }
  );

  res.status(201).json({
    success: true,
    message: "Added to wishlist successfully",
    data: wishlistItem
  });

});

export const removeFromWishlist = asyncHandler(async (req, res) => {

  const { packageId } = req.params;

  const deleted = await Wishlist.findOneAndDelete({
    package: packageId
  });

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: "Wishlist item not found",
      data: null
    });
  }

  res.status(200).json({
    success: true,
    message: "Removed from wishlist",
    data: null
  });

});

export const getWishlist = asyncHandler(async (req, res) => {

  const wishlist = await Wishlist.find()
    .populate("package");   // get full package details

  res.status(200).json({
    success: true,
    total: wishlist.length,
    data: wishlist
  });
});
