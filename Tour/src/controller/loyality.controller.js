import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js"
import User from "../model/user.model.js";
import Package from "../model/package.model.js";
// update the loyalty points of a user
// export const addLoyaltyPoints = asyncHandler(async (req, res) => {

//   const { userId, packageId, points } = req.body;

//   const numericPoints = Number(points);

//   // Basic validation
//   if (!userId || !packageId || !numericPoints || numericPoints <= 0) {
//     return res.status(400).json({
//       success: false,
//       message: "userId, packageId and valid points are required"
//     });
//   }

//   // Validate ObjectIds
//   if (
//     !mongoose.Types.ObjectId.isValid(userId) ||
//     !mongoose.Types.ObjectId.isValid(packageId)
//   ) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid userId or packageId"
//     });
//   }

//   //  Check if package exists
//   const packageExists = await Package.findById(packageId);

//   if (!packageExists) {
//     return res.status(404).json({
//       success: false,
//       message: "Package not found"
//     });
//   }

//   //  Check if user exists
//   const userExists = await User.findById(userId);

//   if (!userExists) {
//     return res.status(404).json({
//       success: false,
//       message: "User not found"
//     });
//   }

//   //  Add loyalty points
//   userExists.loyaltyPoints += numericPoints;
//   await userExists.save();

//   res.status(200).json({
//     success: true,
//     message: "Loyalty points added successfully",
//     data: {
//       userId: userExists._id,
//       packageId,
//       totalPoints: userExists.loyaltyPoints
//     }
//   });

// });



export const addLoyaltyPoints = asyncHandler(async (req, res) => {

  const { userId, packageId } = req.body;

  // 1️⃣ Basic validation
  if (!userId || !packageId) {
    return res.status(400).json({
      success: false,
      message: "userId and packageId are required"
    });
  }

  // 2️⃣ Validate ObjectIds
  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(packageId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid userId or packageId"
    });
  }

  // 3️⃣ Check if package exists
  const packageExists = await Package.findById(packageId);

  if (!packageExists) {
    return res.status(404).json({
      success: false,
      message: "Package not found"
    });
  }

  // 4️⃣ Check if user exists
  const userExists = await User.findById(userId);

  if (!userExists) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  // 5️⃣ Calculate reward automatically (10% of package price)
  const rewardPoints = Math.floor(packageExists.price * 0.1);

  // 6️⃣ Add loyalty points
  userExists.loyaltyPoints += rewardPoints;
  await userExists.save();

  res.status(200).json({
    success: true,
    message: "Loyalty points added successfully",
    data: {
      userId: userExists._id,
      packageId,
      rewardPoints,
      totalPoints: userExists.loyaltyPoints
    }
  });

});

// Get loyalty points of a user
export const getRewardPoints = asyncHandler(async (req, res) => {

  const { userId } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
      data: null
    });
  }

  // Find user
  const user = await User.findById(userId).select("loyaltyPoints");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
      data: null
    });
  }

  res.status(200).json({
    success: true,
    message: "Reward points fetched successfully",
    data: {
      userId: user._id,
      loyaltyPoints: user.loyaltyPoints
    }
  });

});


// const rewardPoints = Math.floor(packageExists.price * 0.1);