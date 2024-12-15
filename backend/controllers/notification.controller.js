import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImg",
    });
    await Notification.updateMany({ to: userId }, { read: true });
    res.status(200).json(notifications);
  } catch (error) {
    console.log("Error getting notifications", error.message);
    res.status(500).json({ error: "Error getting notifications" });
  }
};

export const deleteNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    await Notification.deleteMany({ to: userId });
    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.log("Error deleting notifications", error.message);
    res.status(500).json({ error: "Error deleting notifications" });
  }
};
