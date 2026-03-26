import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../middleware/asyncHandler.js";
import  logger  from "../utils/logger.js";
import { sendEmail } from "../config/email.js";
import Booking from "../model/bookings.js"

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

/* Generate 6 digit OTP */
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* Email Template */
const otpTemplate = (name, otp) => `
  <div style="font-family:Arial;padding:30px;background:#f4f6f8">
    <div style="max-width:500px;margin:auto;background:#fff;padding:20px;border-radius:8px">
      <h2 style="color:#333">Hello ${name},</h2>
      <p>Your One-Time Password (OTP) is:</p>
      <h1 style="color:#4CAF50;letter-spacing:4px">${otp}</h1>
      <p>This OTP is valid for 10 minutes.</p>
      <p>If you didn’t request this, please ignore this email.</p>
      <br/>
      <p style="font-size:12px;color:#777">Auth System Team</p>
    </div>
  </div>
`;

export const register = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    contact,
    email,
    password,
    confirmPassword,
  } = req.body;

  const errors = {};

  // Required fields
  if (!firstName) errors.firstName = "First name is required";
  if (!lastName) errors.lastName = "Last name is required";
  if (!contact) errors.contact = "Contact is required";
  if (!email) errors.email = "Email is required";
  if (!password) errors.password = "Password is required";
  if (!confirmPassword)
    errors.confirmPassword = "Confirm password is required";

  // Contact validation
  if (contact && !/^\d{10}$/.test(contact)) {
    errors.contact = "Contact must be 10 digits";
  }

  // Email validation
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Invalid email format";
  }

  // Password validation
  if (
    password &&
    !/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/.test(password)
  ) {
    errors.password =
      "Password must contain 1 capital, 1 number & 1 special character";
  }

  // Confirm password check
  if (password && confirmPassword && password !== confirmPassword) {
    errors.confirmPassword =
      "Password and Confirm Password do not match";
  }

  // If any error exists → send to error handler
  if (Object.keys(errors).length > 0) {
    return next({
      statusCode: 400,
      message: "Validation Failed",
      errors,
    });
  }

  const exist = await User.findOne({ email });
  if (exist) {
    return next({
      statusCode: 400,
      message: "Email already exists",
    });
  }

  const hashed = await bcrypt.hash(password, 10);
  const otp = generateOTP();

  await User.create({
    firstName,
    lastName,
    contact,
    email,
    password: hashed,
    role: "user",
    emailOTP: otp,
    emailOTPExpire: Date.now() + 10 * 60 * 1000,
  });

  await sendEmail(
    email,
    "Verify Your Email",
    otpTemplate(firstName, otp)
  );

  logger.info(`User Registered: ${email}`);

  res.status(201).json({
    message: "Registered successfully. Please verify your email.",
  });
});



/* ================= VERIFY EMAIL ================= */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.emailOTP !== otp || user.emailOTPExpire < Date.now())
    return res.status(400).json({ message: "Invalid or expired OTP" });

  user.isVerified = true;
  user.emailOTP = null;
  user.emailOTPExpire = null;

  await user.save();

  logger.info(`Email Verified: ${email}`);

  res.json({ message: "Email verified successfully" });
});


/* ================= RESEND OTP ================= */
export const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = generateOTP();

  user.emailOTP = otp;
  user.emailOTPExpire = Date.now() + 10 * 60 * 1000;
  await user.save();

  await sendEmail(email, "Resend OTP", otpTemplate(user.firstName, otp));

  res.json({ message: "OTP resent successfully" });
});


/* ================= LOGIN ================= */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ message: "User not found" });

  // 🔥 If user is not verified → resend OTP
  if (!user.isVerified) {
    const otp = generateOTP();

    user.emailOTP = otp;
    user.emailOTPExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail(
      user.email,
      "Verify Your Email",
      otpTemplate(user.firstName, otp)
    );

    return res.status(403).json({
      message:
        `Email not verified. A new OTP has been sent to ${email}. Please verify first.`,
    });
  }

  // ✅ Check password
  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(400).json({ message: "Invalid credentials" });

  // ✅ Generate Token
  const token = generateToken(user._id);

res.clearCookie("userToken");

res.cookie("userToken", token, {
  httpOnly: true,
  secure: false,   // true in production
  sameSite: "lax"
});

  logger.info(`User Logged In: ${email}`);

  res.json({ message: "Login successful" });
});


/* ================= FORGOT PASSWORD ================= */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return res.status(404).json({ message: "User not found" });

  // If email NOT verified → Send verification OTP
  if (!user.isVerified) {
    const verificationOTP = generateOTP();

    user.emailOTP = verificationOTP;
    user.emailOTPExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendEmail(
      user.email,
      "Verify Your Email",
      otpTemplate(user.firstName, verificationOTP)
    );

    // res.json({message:`Verification OTP sent from forgot password: ${email}`});

    return res.status(403).json({
      message:
        "Your email is not verified. Verification OTP has been sent to your email. Please verify first.",
      type: "email_verification_required",
    });
  }

  // 🟢 If email verified → Send RESET OTP
  const resetOTP = generateOTP();

  user.resetOTP = resetOTP;
  user.resetOTPExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  await sendEmail(
    user.email,
    "Reset Password OTP",
    otpTemplate(user.firstName, resetOTP)
  );

   res.json({message:`Reset OTP sent: ${email}`});

  res.json({
    message: "Reset password OTP sent to your email.",
    type: "reset_password",
  });
});



/* ================= VERIFY RESET OTP ================= */
export const verifyResetOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.resetOTP !== otp || user.resetOTPExpire < Date.now())
    return res.status(400).json({ message: "Invalid or expired OTP" });

  res.json({ message: "OTP verified successfully" });
});


/* ================= RESET PASSWORD ================= */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (password !== confirmPassword)
    return res.status(400).json({
      message: "Password and Confirm Password do not match",
    });

  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ message: "User not found" });

  const hashed = await bcrypt.hash(password, 10);

  user.password = hashed;
  user.resetOTP = null;
  user.resetOTPExpire = null;

  await user.save();

  logger.info(`Password Reset Successful: ${email}`);


  res.json({ message: "Password reset successful" });
});



/* ================= LOGOUT ================= */
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("userToken");
  res.json({ message: "Logged out successfully" });
});

export const getMyProfile = asyncHandler(async (req, res,next) => {

  const user = await User.findById(req.user.id).select("-password");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, contact } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (contact && !/^\d{10}$/.test(contact)) {
    return res.status(400).json({
      success: false,
      message: "Contact must be 10 digits",
    });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }
  }

  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  user.email = email || user.email;
  user.contact = contact || user.contact;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
  });
});

export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;

  await user.save();

  logger.info(`Password changed: ${user.email}`);

  return res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

export const deactivateAccount = asyncHandler(async (req, res, next) => {

  const user = await User.findById(req.user.id);

  if (!user) {
    return next({
      statusCode: 404,
      message: "User not found"
    });
  }

  await User.findByIdAndDelete(req.user.id);


  res.clearCookie("token");

  res.status(200).json({
    success: true,
    message: "Account permanently deleted successfully"
  });

});

export const getUserBookings = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user.role === "user" && req.user.id !== id) {

    return res.status(403).json({
      success: false,
      message: "You can only access your own booking history",
    });
  }

  const bookings = await Booking.find({ user: id }).sort({
    createdAt: -1,
  });

  logger.info("Booking history fetched successfully");

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});
