import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../middleware/asyncHandler.js";


export const adminLogin = asyncHandler(async (req, res, next) => {
  console.log("--- Login Attempt ---");
  console.log("Request Body:", req.body);
  const { email, password } = req.body;

  const adminCollection = mongoose.connection.collection("admins");

  const admin = await adminCollection.findOne({ email });

  console.log(`Login attempt for email: ${email}`);

  if (!admin) {
    console.log(`Admin not found for email: ${email}`);
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    console.log(`Password mismatch for admin: ${email}`);
    return res.status(400).json({ message: "Invalid credentials" });
  }

  console.log(`Login successful for: ${email}`);

  const token = jwt.sign(
    {
      id: admin._id,
      email: admin.email,
      role: admin.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.status(200).json({
    message: "Admin login successful",
    token,
    admin: {
      id: admin._id,
      email: admin.email,
      role: admin.role,
      firstName: admin.firstName,
      lastName: admin.lastName
    }
  });
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


export const updateAdminProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone } = req.body;

  const adminCollection = mongoose.connection.collection("admins");

  const updateData = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (phone) updateData.phone = phone;

  if (email && email !== req.admin.email) {
    const existing = await adminCollection.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }
    updateData.email = email;
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ success: false, message: "No fields to update" });
  }

  await adminCollection.updateOne(
    { _id: req.admin._id },
    { $set: updateData }
  );

  const updatedAdmin = await adminCollection.findOne({ _id: req.admin._id });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    admin: {
      id: updatedAdmin._id,
      firstName: updatedAdmin.firstName,
      lastName: updatedAdmin.lastName,
      email: updatedAdmin.email,
      phone: updatedAdmin.phone,
      role: updatedAdmin.role,
    }
  });
});

export const changeAdminPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "Both current and new password are required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
  }

  const adminCollection = mongoose.connection.collection("admins");
  const admin = await adminCollection.findOne({ _id: req.admin._id });

  const isMatch = await bcrypt.compare(currentPassword, admin.password);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: "Current password is incorrect" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await adminCollection.updateOne(
    { _id: req.admin._id },
    { $set: { password: hashedPassword } }
  );

  res.status(200).json({ success: true, message: "Password updated successfully" });
});

export const adminLogout = (req, res) => {
  res.clearCookie("adminToken");
  return res.status(200).json({
    success: true,
    message: "Admin logged out successfully"
  });
};
