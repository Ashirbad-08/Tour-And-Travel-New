import Guide from "../model/guide.model.js";
import cloudinary from "../config/cloudinary.config.js";
import logger from "../utils/logger.js";
import { asyncHandler } from "../middleware/asyncHandler.js";


// ================= CREATE GUIDE =================
export const createGuide = asyncHandler(async (req, res, next) => {
  const {
    name,
    email,
    phone,
    title,
    experienceYears,
    level,
    jobType,
    status,
    skills,
    // experiences,
  } = req.body;

  let avatarData = {};

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "guides",
    });

    avatarData = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  const guide = await Guide.create({
    name,
    email,
    phone,
    title,
    experienceYears,
    level,
    jobType,
    status,
    skills: skills ? JSON.parse(skills) : [],
    avatar: avatarData,
  });

  logger.info(`Guide created: ${guide.email}`);

  res.status(201).json({
    success: true,
    guide,
  });
});


// ================= GET GUIDES =================
export const getGuides = asyncHandler(async (req, res, next) => {
  const {
    search,
    level,
    status,
    skills,
    minExp,
    page = 1,
    limit = 10,
  } = req.query;

  let query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { title: { $regex: search, $options: "i" } },
    ];
  }

  if (level) query.level = level;
  if (status) query.status = status;
  if (skills) query.skills = { $in: [skills] };
  if (minExp) query.experienceYears = { $gte: Number(minExp) };

  const skip = (page - 1) * limit;

  const guides = await Guide.find(query)
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Guide.countDocuments(query);

  res.json({
    total,
    page: Number(page),
    limit: Number(limit),
    results: guides.length,
    guides,
  });
});


// ================= GET SINGLE =================
export const getGuideById = asyncHandler(async (req, res, next) => {
  const guide = await Guide.findById(req.params.id);

  if (!guide) {
    return res.status(404).json({
      message: "Guide not found",
    });
  }

  res.json(guide);
});


// ================= UPDATE GUIDE =================
export const updateGuide = asyncHandler(async (req, res, next) => {
  const guide = await Guide.findById(req.params.id);

  if (!guide) {
    return res.status(404).json({
      message: "Guide not found",
    });
  }

  if (req.file) {
    if (guide.avatar?.public_id) {
      await cloudinary.uploader.destroy(guide.avatar.public_id);
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "guides",
    });

    guide.avatar = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  Object.assign(guide, {
    ...req.body,
    skills: req.body.skills ? JSON.parse(req.body.skills) : guide.skills,
    experiences: req.body.experiences
      ? JSON.parse(req.body.experiences)
      : guide.experiences,
  });

  await guide.save();

  logger.info(`Guide updated: ${guide.email}`);

  res.json({
    success: true,
    guide,
  });
});


// ================= DELETE GUIDE =================
export const deleteGuide = asyncHandler(async (req, res, next) => {
  const guide = await Guide.findById(req.params.id);

  if (!guide) {
    return res.status(404).json({
      message: "Guide not found",
    });
  }

  if (guide.avatar?.public_id) {
    await cloudinary.uploader.destroy(guide.avatar.public_id);
  }

  await guide.deleteOne();

  res.json({
    message: "Guide deleted",
  });
});
