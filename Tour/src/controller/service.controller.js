import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.config.js";
import { Service, InfoPage, Page, MultiImagePage, NewPage } from "../model/service.model.js";


// ================= CREATE =================
export const createService = async (req, res) => {
    // console.log(req.body)
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "services",
    });

    const service = await Service.create({
      title,
      description,
      image: result.secure_url,
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ================= GET ALL =================
export const getServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ================= GET SINGLE =================
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ================= UPDATE =================
export const updateService = async (req, res) => {
  try {
    const { title, description } = req.body;

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "services",
      });
      service.image = result.secure_url;
    }

    service.title = title || service.title;
    service.description = description || service.description;

    await service.save();

    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ================= DELETE =================
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    await service.deleteOne();

    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= CREATE INFO PAGE =================
export const createInfoPage = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const info = await InfoPage.create({
      title,
      description,
    });

    res.status(201).json(info);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ================= GET ALL INFO PAGES =================
export const getInfoPages = async (req, res) => {
  try {
    const pages = await InfoPage.find().sort({ createdAt: -1 });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ================= GET SINGLE INFO PAGE =================
export const getInfoPageById = async (req, res) => {
  try {
    const page = await InfoPage.findById(req.params.id);

    if (!page) {
      return res.status(404).json({ error: "Page not found" });
    }

    res.json(page);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ================= UPDATE INFO PAGE =================
export const updateInfoPage = async (req, res) => {
  try {
    const { title, description } = req.body;

    const page = await InfoPage.findById(req.params.id);

    if (!page) {
      return res.status(404).json({ error: "Page not found" });
    }

    page.title = title || page.title;
    page.description = description || page.description;

    await page.save();

    res.json(page);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ================= DELETE INFO PAGE =================
export const deleteInfoPage = async (req, res) => {
  try {
    const page = await InfoPage.findById(req.params.id);

    if (!page) {
      return res.status(404).json({ error: "Page not found" });
    }

    await page.deleteOne();

    res.json({ message: "Info Page deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// ================= CREATE PAGE =================
export const createPage = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description || !req.file) {
      return res.status(400).json({ error: "All fields and image are required" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "pages",
    });

    const page = await Page.create({
      title,
      description,
      image: result.secure_url,
    });

    res.status(201).json(page);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= GET ALL PAGES =================
export const getPages = async (req, res) => {
  try {
    const pages = await Page.find().sort({ createdAt: -1 });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= GET SINGLE PAGE =================
export const getPageById = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ error: "Page not found" });
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= UPDATE PAGE =================
export const updatePage = async (req, res) => {
  try {
    const { title, description } = req.body;
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ error: "Page not found" });

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "pages",
      });
      page.image = result.secure_url;
    }

    page.title = title || page.title;
    page.description = description || page.description;

    await page.save();
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= DELETE PAGE =================
export const deletePage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ error: "Page not found" });

    await page.deleteOne();
    res.json({ message: "Page deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ================= CREATE =================
export const createMultiImagePage = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "At least 1 image is required" });
    }

    if (req.files.length > 4) {
      return res.status(400).json({ error: "Maximum 4 images allowed" });
    }

    // Upload all images to Cloudinary
    const uploadedImages = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "multi_image_pages",
      });
      uploadedImages.push(result.secure_url);
    }

    const page = await MultiImagePage.create({
      title,
      description,
      images: uploadedImages,
    });

    res.status(201).json(page);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= GET ALL =================
export const getMultiImagePages = async (req, res) => {
  try {
    const pages = await MultiImagePage.find().sort({ createdAt: -1 });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= GET SINGLE =================
export const getMultiImagePageById = async (req, res) => {
  try {
    const page = await MultiImagePage.findById(req.params.id);
    if (!page) return res.status(404).json({ error: "Page not found" });
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= UPDATE =================
// Only title & description update
export const updateMultiImagePage = async (req, res) => {
  try {
    const { title, description } = req.body;

    const page = await MultiImagePage.findById(req.params.id);
    if (!page) return res.status(404).json({ error: "Page not found" });

    page.title = title || page.title;
    page.description = description || page.description;

    await page.save();
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= DELETE =================
export const deleteMultiImagePage = async (req, res) => {
  try {
    const page = await MultiImagePage.findById(req.params.id);
    if (!page) return res.status(404).json({ error: "Page not found" });

    await page.deleteOne();
    res.json({ message: "MultiImagePage deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// ================= CREATE NEW PAGE =================
export const createNewPage = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description || !req.file) {
      return res.status(400).json({ error: "Title, description, and image are required" });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, { folder: "new_pages" });

    const page = await NewPage.create({
      title,
      description,
      image: result.secure_url,
    });

    res.status(201).json(page);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= GET ALL NEW PAGES =================
export const getNewPages = async (req, res) => {
  try {
    const pages = await NewPage.find().sort({ createdAt: -1 });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= GET SINGLE NEW PAGE =================
export const getNewPageById = async (req, res) => {
  try {
    const page = await NewPage.findById(req.params.id);
    if (!page) return res.status(404).json({ error: "Page not found" });
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= UPDATE NEW PAGE =================
export const updateNewPage = async (req, res) => {
  try {
    const { title, description } = req.body;
    const page = await NewPage.findById(req.params.id);
    if (!page) return res.status(404).json({ error: "Page not found" });

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "new_pages" });
      page.image = result.secure_url;
    }

    page.title = title || page.title;
    page.description = description || page.description;

    await page.save();
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= DELETE NEW PAGE =================
export const deleteNewPage = async (req, res) => {
  try {
    const page = await NewPage.findById(req.params.id);
    if (!page) return res.status(404).json({ error: "Page not found" });

    await page.deleteOne();
    res.json({ message: "New Page deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};