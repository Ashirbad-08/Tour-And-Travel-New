import Package from "../model/package.model.js";
import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js"
import { createNotification } from "../utils/createNotification.js";
// CREATE PACKAGE (ADMIN)
export const createPackage = asyncHandler(async (req, res) => {

  // 1️⃣ Extract data from request body
  const {
    title,
    description,
    destination,
    price,
    durationDays,
    durationNights,
    maxPerson,
    thumbnailImage,
    category,
    includes,
    excludes
  } = req.body;

  // 2️⃣ Basic validation
  if (
    !title ||
    !description ||
    !destination ||
    !price ||
    !maxPerson ||
    !durationDays ||
    !durationNights ||
    !thumbnailImage ||
    !category ||
    !includes ||
    !excludes
  ) {
    return res.status(400).json({
      success: false,
      message: "All required fields must be provided",
      data: null
    });
  }

  // 3️⃣ Create slug
  const slug = title
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");

  // 4️⃣ Check if package already exists
  const existingPackage = await Package.findOne({ slug });

  if (existingPackage) {
    return res.status(409).json({
      success: false,
      message: "Package with this title already exists",
      data: null
    });
  }

  // 5️⃣ Create new package
  const newPackage = await Package.create({
    title,
    slug,
    description,
    destination,
    price,
    durationDays,
    durationNights,
    maxPerson,
    category,
    thumbnailImage,
    includes,
    excludes,

  });

  await createNotification({
    type: "package",
    title: "New Package Added",
    message: `Package "${newPackage.title}" added`,
    referenceId: newPackage._id
  });
  // 6️⃣ Send success response
  res.status(201).json({
    success: true,
    message: "Travel package created successfully",
    data: newPackage
  });

});

// UPDATE PACKAGE (ADMIN)
export const updatePackage = asyncHandler(async (req, res) => {

  const { id } = req.params;

  // 1️⃣ Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid package ID",
      data: null
    });
  }

  // 2️⃣ Check if package exists
  const existingPackage = await Package.findById(id);

  if (!existingPackage) {
    return res.status(404).json({
      success: false,
      message: "Package not found",
      data: null
    });
  }

  // 3️⃣ Extract fields from body
  const {
    title,
    description,
    destination,
    price,
    durationDays,
    durationNights,
    maxPerson,
    category,
    thumbnailImage,
    includes,
    excludes
  } = req.body;

  // 4️⃣ Basic Validation
  if (title && typeof title !== "string") {
    return res.status(400).json({
      success: false,
      message: "Title must be a string",
      data: null
    });
  }

  if (price && price <= 0) {
    return res.status(400).json({
      success: false,
      message: "Price must be greater than 0",
      data: null
    });
  }

  // 5️⃣ Regenerate slug if title updated
  let slug = existingPackage.slug;

  if (title) {
    slug = title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

    // Check duplicate slug
    const duplicate = await Package.findOne({
      slug,
      _id: { $ne: id }
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Another package with this title already exists",
        data: null
      });
    }
  }

  // 6️⃣ Update fields safely
  existingPackage.title = title ?? existingPackage.title;
  existingPackage.slug = slug;
  existingPackage.description = description ?? existingPackage.description;
  existingPackage.destination = destination ?? existingPackage.destination;
  existingPackage.price = price ?? existingPackage.price;
  existingPackage.durationDays = durationDays ?? existingPackage.durationDays;
  existingPackage.durationNights = durationNights ?? existingPackage.durationNights;
  existingPackage.maxPerson = maxPerson ?? existingPackage.maxPerson;
  existingPackage.category = category ?? existingPackage.category;
  existingPackage.thumbnailImage = thumbnailImage ?? existingPackage.thumbnailImage;
  existingPackage.includes = includes ?? existingPackage.includes;
  existingPackage.excludes = excludes ?? existingPackage.excludes;

  // 7️⃣ Save updated package
  const updatedPackage = await existingPackage.save();

  await createNotification({
    type: "package",
    title: "Package Updated",
    message: `Package "${existingPackage.title}" updated`,
    referenceId: existingPackage._id
  });

  res.status(200).json({
    success: true,
    message: "Package updated successfully",
    data: updatedPackage
  });

});

// DELETE PACKAGE (ADMIN)
export const deletePackage = asyncHandler(async (req, res) => {

  const { id } = req.params;

  // 1️⃣ Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid package ID",
      data: null
    });
  }

  // 2️⃣ Check if package exists
  const existingPackage = await Package.findById(id);

  if (!existingPackage) {
    return res.status(404).json({
      success: false,
      message: "Package not found",
      data: null
    });
  }

  // 3️⃣ Delete the package
  await Package.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Package deleted successfully",
    data: null
  });

});


// GET PACKAGE BY ID (ADMIN & USER)
export const getPackageById = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid package ID",
        data: null
      });
    }

    // Fetch package
    const packageData = await Package.findById(id);

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: "Package fetched successfully",
      data: packageData
    });

  } catch (error) {
    next(error);
  }
});

// GET ALL PACKAGES (ADMIN & USER) - Optional for future implementation
export const getAllPackages = asyncHandler(async (req, res) => {

  const packages = await Package.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    total: packages.length,
    data: packages
  });

});
