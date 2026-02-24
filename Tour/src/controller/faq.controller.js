import FAQ from "../model/faq.model.js";

/* ===============================
   CREATE FAQ (ADMIN)
================================= */
export const createFaq = async (req, res) => {
  try {
    const faq = await FAQ.create(req.body);

    res.status(201).json({
      success: true,
      message: "FAQ created successfully",
      data: faq,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===============================
   GET ALL FAQS (ADMIN)
   - search
   - filter by category
   - pagination
================================= */
export const getAllFaqs = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;

    const query = {};

    if (category) query.category = category;

    if (search) {
      query.question = { $regex: search, $options: "i" };
    }

    const faqs = await FAQ.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await FAQ.countDocuments(query);

    res.json({
      success: true,
      total,
      page: Number(page),
      data: faqs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===============================
   GET ACTIVE FAQS (USER SIDE)
================================= */
export const getActiveFaqs = async (req, res) => {
  try {
    const { category } = req.query;

    const query = { isActive: true };

    if (category) query.category = category;

    const faqs = await FAQ.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: faqs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===============================
   UPDATE FAQ
================================= */
export const updateFaq = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    res.json({
      success: true,
      message: "FAQ updated successfully",
      data: faq,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===============================
   DELETE FAQ
================================= */
export const deleteFaq = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    res.json({
      success: true,
      message: "FAQ deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===============================
   TOGGLE ACTIVE STATUS
================================= */
export const toggleFaqStatus = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    faq.isActive = !faq.isActive;
    await faq.save();

    res.json({
      success: true,
      message: "FAQ status updated",
      data: faq,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};