import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const protectAdmin = async (req, res, next) => {
  try {
    // Check cookie first, then Authorization header
    let token = req.cookies.adminToken;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const adminCollection = mongoose.connection.collection("admins");

    // ✅ FIX: support both string & ObjectId admins
    const admin = await adminCollection.findOne({
      $or: [
        { _id: decoded.id },
        { _id: new mongoose.Types.ObjectId(decoded.id) }
      ]
    });

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    if (admin.role !== "admin" && admin.role !== "main_admin") {
      return res.status(403).json({
        message: "Access denied: Only admin or main_admin allowed",
      });
    }

    req.admin = admin;
    next();

  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
