import Wishlist from "../model/wishlist.model.js";
import Package from "../model/package.model.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

/**
 * ADD TO WISHLIST
 */
export const addToWishlist = asyncHandler(async (req, res) => {

  const { packageId } = req.body;

  if (!packageId) {
    return res.status(400).json({
      success: false,
      message: "Package ID is required",
      data: null
    });
  }

  // Check if package exists
  const packageExists = await Package.findById(packageId);

  if (!packageExists) {
    return res.status(404).json({
      success: false,
      message: "Package not found",
      data: null
    });
  }

  // Check if already in wishlist
  const existing = await Wishlist.findOne({ package: packageId });

  if (existing) {
    return res.status(409).json({
      success: false,
      message: "Package already in wishlist",
      data: null
    });
  }

  const wishlistItem = await Wishlist.create({
    package: packageId
  });

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
