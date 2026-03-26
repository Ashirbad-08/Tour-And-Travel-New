import Notification from "../model/notification.model.js";

export const createNotification = async ({
  type,
  title,
  message,
  referenceId
}) => {
  try {
    await Notification.create({
      type,
      title,
      message,
      referenceId
    });
  } catch (error) {
    console.error("Notification error:", error.message);
  }
};