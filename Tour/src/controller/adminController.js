import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../middleware/asyncHandler.js";


export const adminLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const adminCollection = mongoose.connection.collection("admins");

  const admin = await adminCollection.findOne({ email });

  if (!admin) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

const token = jwt.sign(
  {
    id: admin._id,
    email: admin.email,
    role: admin.role,
  },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

res.clearCookie("adminToken");

res.cookie("adminToken", token, {
  httpOnly: true,
  secure: false,   // true in production
  sameSite: "lax",
});

res.status(200).json({ message: "Admin login successful" });
});

export const adminProfile = asyncHandler(async (req, res, next) => {
  const adminCollection = mongoose.connection.collection("admins");

  const admin = await adminCollection.findOne({
    email: req.admin.email,
  });

  res.status(200).json({
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
    phone: admin.phone,
  });
});


export const adminLogout = (req, res) => {
  res.clearCookie("adminToken");
  return res.status(200).json({
    success: true,
    message: "Admin logged out successfully"
  });
};