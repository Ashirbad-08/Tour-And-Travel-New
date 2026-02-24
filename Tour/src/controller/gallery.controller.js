import Gallery from "../model/gallery.model.js";
import { galleryValidation } from "../validator/gallery.validation.js";

// CREATE GALLERY ITEM
/*export const createGallery = async (req, res) => {
//console.log(req.body);

  console.log("BODY:", req.body);
  

  //res.json({ message: "Request received" });


  try {
    const { error } = galleryValidation(req.body);
    if (error) {
     
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, location, description } = req.body;

    const newGallery = await Gallery.create({
      title,
      location,
      description,
      imageUrl: req.files?.path || "",
    });

    res.status(201).json({
      success: true,
      data: newGallery,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};*/
export const createGallery = async (req, res) => {
  //console.log("FILES:", req.files);

  try {
    const { error } = galleryValidation(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, location, description } = req.body;

    // Get all uploaded image paths
    const imageUrls = req.files
      ? req.files.map((file) => file.path)
      : [];

    if (imageUrls.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    const newGallery = await Gallery.create({
      title,
      location,
      description,
      imageUrls,
    });

    res.status(201).json({
      success: true,
      data: newGallery,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// GET ALL GALLERY (Pagination + Search)
export const getAllGallery = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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


