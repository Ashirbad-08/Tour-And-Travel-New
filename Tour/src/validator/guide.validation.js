export const validateCreateGuide = (req, res, next) => {
  const {
    name,
    email,
    phone,
    title,
    experienceYears,
  } = req.body;

  if (!name || !email || !phone || !title || !experienceYears) {
    return res.status(400).json({
      message: "Required fields missing",
    });
  }

  next();
};
