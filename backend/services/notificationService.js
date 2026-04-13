const Notification = require("../models/Notification");

exports.createNotification = async (data) => {
  return await Notification.create(data);
};

exports.getUnreadNotifications = async () => {
  return await Notification.find({ isRead: false }).sort({ createdAt: -1 }).limit(50);
};

exports.markAsRead = async (id) => {
  return await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
};

exports.markAllAsRead = async () => {
  await Notification.updateMany({ isRead: false }, { isRead: true });
};
