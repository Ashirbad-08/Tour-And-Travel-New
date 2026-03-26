import Gallery from "../model/gallery.model.js";
import { galleryValidation } from "../validator/gallery.validation.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// CREATE GALLERY ITEM
export const createGallery = asyncHandler(async (req, res) => {
  const { error } = galleryValidation(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map(err => ({
        field: err.path[0],
        message: err.message
      }))
    });
  }

  const { title, location, description, category } = req.body;

  // Get all uploaded image paths
  const imageUrls = req.files ? req.files.map((file) => file.path) : [];

  if (imageUrls.length === 0) {
    return res.status(400).json({ success: false, message: "At least one image is required" });
  }

  const newGallery = await Gallery.create({
    title,
    location,
    description,
    category: category || "All",
    imageUrls,
  });

  res.status(201).json({
    success: true,
    data: newGallery,
  });
});


// GET ALL GALLERY (Pagination + Search)
export const getAllGallery = asyncHandler(async (req, res) => {
  const { page = 1, limit = 8, search = "" } = req.query;

  const query = {
    title: { $regex: search, $options: "i" },
  };

  const gallery = await Gallery.find(query)
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await Gallery.countDocuments(query);

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    data: gallery,
  });
});

// DELETE GALLERY
export const deleteGallery = async (req, res) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Gallery item deleted",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// UPDATE GALLERY (Replace images + update fields)
export const updateGallery = asyncHandler(async (req, res) => {
  const gallery = await Gallery.findById(req.params.id);

  if (!gallery) {
    return res.status(404).json({
      success: false,
      message: "Gallery item not found",
    });
  }

  const { title, location, description, category } = req.body;

  // Update text fields if provided
  if (title) gallery.title = title;
  if (location) gallery.location = location;
  if (description) gallery.description = description;
  if (category) gallery.category = category;

  // If new images uploaded → replace old images
  if (req.files && req.files.length > 0) {
    const imageUrls = req.files.map(file => file.path);
    gallery.imageUrls = imageUrls;
  }

  await gallery.save();

  res.status(200).json({
    success: true,
    message: "Gallery updated successfully",
    data: gallery,
  });
});
// REORDER GALLERY IMAGES
export const reorderGalleryImages = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }

    const { imageUrls } = req.body;

    if (!Array.isArray(imageUrls)) {
      return res.status(400).json({
        success: false,
        message: "imageUrls must be an array",
      });
    }

    // Validate that reordered array matches existing images
    const existing = [...gallery.imageUrls].sort();
    const incoming = [...imageUrls].sort();

    if (JSON.stringify(existing) !== JSON.stringify(incoming)) {
      return res.status(400).json({
        success: false,
        message: "Image list does not match existing images",
      });
    }

    gallery.imageUrls = imageUrls;

    await gallery.save();

    res.status(200).json({
      success: true,
      message: "Gallery images reordered successfully",
      data: gallery,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
