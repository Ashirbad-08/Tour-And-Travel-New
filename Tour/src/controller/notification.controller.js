import Notification from "../model/notification.model.js";

export const getAdminNotifications = async (req, res) => {
  const notifications = await Notification.find()
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({
    success: true,
    count: notifications.length,
    data: notifications
  });
};

export const markNotificationRead = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, {
    isRead: true
  });

  res.json({
    success: true,
    message: "Notification marked as read"
  });
};