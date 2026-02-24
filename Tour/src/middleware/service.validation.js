// middlewares/validation.middleware.js
export const validateMultiImagePage = (req, res, next) => {
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

  next(); // everything is ok, continue to controller
};

export default validateMultiImagePage;