// src/controllers/travels.controller.js
import Travels from "../model/Travels.js";

/* ================= CREATE ================= */
export const createTravels = async (req, res) => {
  try {
    const {
      travelName,
      phoneNumber,
      address,
      jobField,
      packages,
      memberCategory,
    } = req.body;

    // Validate all required fields
    if (
      !travelName ||
      !phoneNumber ||
      !address ||
      !jobField ||
      !packages ||
      !memberCategory
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate uploaded file
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    // Create new travel document
    const travels = await Travels.create({
      travelName,
      phoneNumber,
      address,
      jobField,
      packages,
      memberCategory,
      image: {
        url: req.file.path, // Cloudinary URL
        public_id: req.file.filename || "", // Safe fallback
      },
    });

    res.status(201).json(travels);
  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET ALL ================= */
export const getTravels = async (req, res) => {
  try {
    const travels = await Travels.find().sort({ createdAt: -1 });
    res.status(200).json(travels);
  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET SINGLE ================= */
export const getSingleTravels = async (req, res) => {
  try {
    const travel = await Travels.findById(req.params.id);
    if (!travel) return res.status(404).json({ error: "Travel not found" });

    res.status(200).json(travel);
  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: error.message });
  }
};

/* ================= DELETE ================= */
export const deleteTravels = async (req, res) => {
  try {
    const travel = await Travels.findById(req.params.id);
    if (!travel) return res.status(404).json({ error: "Travel not found" });

    // Optional: delete image from Cloudinary
    // await cloudinary.uploader.destroy(travel.image.public_id);

    await travel.deleteOne();
    res.status(200).json({ message: "Travel deleted successfully" });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: error.message });
  }
};
