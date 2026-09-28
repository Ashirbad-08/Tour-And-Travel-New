import ContactMessage from "../model/contact.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { sendEmail } from "../config/email.js";

/**
 * @desc User Submit Contact Form
 * @route POST /api/contact
 */
export const submitContactForm = asyncHandler(async (req, res, next) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    const err = new Error("Name, email and message are required");
    err.statusCode = 400;
    return next(err);
  }

  // Check message limit
  const messageCount = await ContactMessage.countDocuments({
    $or: [{ email }, phone ? { phone } : null].filter(Boolean),
  });

  if (messageCount >= 5) {
    const err = new Error("You have reached the maximum limit of 5 messages.");
    err.statusCode = 400;
    return next(err);
  }

  const newMessage = await ContactMessage.create({
    name,
    email,
    phone,
    subject,
    message,
  });

  // ✅ Send response immediately (NO WAIT)
  res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: newMessage,
  });

  // ✅ Send email in background (non-blocking)
  sendEmail(
    process.env.EMAIL_USER,
    `New Contact Message - ${subject || "General Inquiry"}`,
    `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px;">
        <div style="background-color: #0d6efd; padding: 20px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0;">New Contact Message</h2>
        </div>
        <div style="padding: 25px;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || "N/A"}</p>
          <p><strong>Subject:</strong> ${subject || "General Inquiry"}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        </div>
      </div>
    </div>
    `
  ).catch((err) => {
    console.error("Email sending failed:", err.message);
  });
});


export const getAllMessages = asyncHandler(async (req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: messages,
  });
});



export const getSingleMessage = asyncHandler(async (req, res, next) => {
  const message = await ContactMessage.findById(req.params.id);

  if (!message) {
    const err = new Error("Message not found");
    err.statusCode = 404;
    return next(err);
  }

  // Auto mark as read
  if (!message.isRead) {
    message.isRead = true;
    message.status = "Read";
    await message.save();
  }

  res.status(200).json({
    success: true,
    data: message,
  });
});



export const replyToMessage = asyncHandler(async (req, res, next) => {
  const { replyMessage } = req.body;

  if (!replyMessage) {
    const err = new Error("Reply message is required");
    err.statusCode = 400;
    return next(err);
  }

  const message = await ContactMessage.findById(req.params.id);

  if (!message) {
    const err = new Error("Message not found");
    err.statusCode = 404;
    return next(err);
  }

  // Update message status first
  message.status = "Replied";
  await message.save();

  // Send response immediately (DO NOT wait for email)
  res.status(200).json({
    success: true,
    message: "Reply sent successfully",
  });

  // Send email in background (non-blocking)
  sendEmail(
    message.email,
    `Reply: ${message.subject || "Your Inquiry"}`,
    `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">

        <div style="background-color: #198754; padding: 20px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0;">Response to Your Inquiry</h2>
        </div>

        <div style="padding: 25px; color: #333333; font-size: 14px; line-height: 1.6;">
          <p>Dear <strong>${message.name}</strong>,</p>

          <p>Thank you for contacting us. We appreciate you reaching out.</p>

          <div style="margin: 20px 0;">
            <div style="background: #f8f9fa; padding: 18px; border-radius: 6px; border-left: 4px solid #198754;">
              ${replyMessage}
            </div>
          </div>

          <p>If you need further assistance, feel free to reply.</p>

          <p style="margin-top: 25px;">
            Kind regards,<br/>
            <strong>Support Team</strong>
          </p>
        </div>

        <div style="background: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #777;">
          Official response to your contact request.
        </div>

      </div>
    </div>
    `
  ).catch((error) => {
    console.error("Email sending failed:", error.message);
  });
});