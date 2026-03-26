import jwt from "jsonwebtoken";
import User from "../model/user.model.js";

export const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.userToken; // ✅ USER TOKEN ONLY

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "User not logged in",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid user token",
    });
  }
};
