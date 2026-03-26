import Pakage from "../model/package.model.js";
import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js"
// ADD TRAVEL PLAN TO A PACKAGE
export const addTravelPlan = asyncHandler(async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const { dayNumber, date, title, description } = req.body;

    if (!dayNumber || !date || !title || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        data: null
      });
    }


    const packageData = await Pakage.findById(packageId);

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
        data: null
      });
    }

    packageData.travelPlans.push({
      dayNumber,
      date,
      title,
      description
    });

    await packageData.save();

    res.status(201).json({
      success: true,
      message: "Travel plan added successfully",
      data: packageData
    });

  } catch (error) {
    next(error);
  }
});

// UDATE TRAVEL PLAN (ADMIN)
export const updateTravelPlan = asyncHandler(async (req, res, next) => {
  try {
    const { packageId, planId } = req.params;

    const packageData = await Pakage.findById(packageId);

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
        data: null
      });
    }

    const plan = packageData.travelPlans.id(planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Travel plan not found",
        data: null
      });
    }

    const { dayNumber, date, title, description } = req.body;

    plan.dayNumber = dayNumber ?? plan.dayNumber;
    plan.date = date ?? plan.date;
    plan.title = title ?? plan.title;
    plan.description = description ?? plan.description;

    await packageData.save();

    res.status(200).json({
      success: true,
      message: "Travel plan updated successfully",
      data: packageData
    });

  } catch (error) {
    next(error);
  }
});

// DELETE TRAVEL PLAN (ADMIN)
export const deleteTravelPlan = asyncHandler(async (req, res, next) => {
  try {
    const { packageId, planId } = req.params;

    const packageData = await Pakage.findById(packageId);

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
        data: null
      });
    }

    const plan = packageData.travelPlans.id(planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Travel plan not found",
        data: null
      });
    }

    plan.deleteOne();

    await packageData.save();

    res.status(200).json({
      success: true,
      message: "Travel plan deleted successfully",
      data: packageData
    });

  } catch (error) {
    next(error);
  }
});

// GET TRAVEL PLAN (ADMIN)
export const getTravelPlans = asyncHandler(async (req, res, next) => {
  try {
    const { packageId } = req.params;

    const packageData = await Pakage.findById(packageId);

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: "Travel plans fetched successfully",
      data: packageData.travelPlans
    });

  } catch (error) {
    next(error);
  }
});
