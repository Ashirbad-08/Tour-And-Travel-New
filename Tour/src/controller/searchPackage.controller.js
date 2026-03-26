import Package from "../model/package.model.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const searchPackages = asyncHandler(async (req, res) => {

  const { keyword } = req.query;

  // If no keyword provided
  if (!keyword) {
    return res.status(400).json({
      success: false,
      message: "Search keyword is required",
      data: null
    });
  }

  // Search in title and location (case-insensitive)
  const packages = await Package.find({
    $or: [
      { title: { $regex: keyword, $options: "i" } },
      { location: { $regex: keyword, $options: "i" } }
    ]
  });

  res.status(200).json({
    success: true,
    message: "Search results fetched successfully",
    total: packages.length,
    data: packages
  });

});
//http://localhost:5000/api/search?keyword=safari


// TOP 5 CHEAPEST PACKAGES
export const getTop5CheapestPackages = asyncHandler(async (req, res) => {

  const packages = await Package.find()
    .sort({ price: 1 })   // 1 = ascending (lowest first)
    .limit(5);            // only 5 results

  res.status(200).json({
    success: true,
    message: "Top 5 cheapest packages fetched successfully",
    total: packages.length,
    data: packages
  });

});