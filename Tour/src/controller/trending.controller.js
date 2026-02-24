import Package from "../model/package.model.js";

/**
 * Top 5 selling packages
 */
export const getTrendingPackages = async (req, res) => {
  try {
    const packages = await Package.find()
      .sort({ totalBookings: -1 }) // MOST SOLD FIRST
      .limit(5);

    res.json({
      success: true,
      data: packages
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
