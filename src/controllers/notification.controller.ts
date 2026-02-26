import { Request, Response } from "express";
import { Notification } from "../models/notification.model";

export class NotificationController {
  // Get all notifications for the user
  static async getNotifications(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = user.id;
      
      // All users see broadcast notifications (user: null)
      // and their specific notifications
      const notifications = await Notification.find({
        $or: [
          { user: userId }, 
          { user: { $exists: false } }, 
          { user: null }
        ],
      })
        .sort({ createdAt: -1 })
        .limit(30);

      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Create a new notification (Admin only)
  static async createNotification(req: Request, res: Response) {
    try {
      const { title, message, type } = req.body;
      const notification = await Notification.create({
        title,
        message,
        type,
      });

      res.status(201).json({
        success: true,
        data: notification,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Mark all notifications as read for the user
  static async markAllRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      await Notification.updateMany(
        { $or: [{ user: userId }, { user: null }, { user: { $exists: false } }] },
        { $set: { isRead: true } }
      );
      res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Delete a notification (Admin only)
  static async deleteNotification(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      const notification = await Notification.findById(id);
      if (!notification) {
        return res.status(404).json({ success: false, message: "Notification not found" });
      }

      // Allow deletion if:
      // 1. User is an Admin
      // 2. User is the owner of the notification (for targeted notifications)
      // 3. (Optional) User is a Seller and it's a broadcast (if we want sellers to clean up their view)
      if (user.role === "admin" || (notification.user && notification.user.toString() === user.id)) {
        await Notification.findByIdAndDelete(id);
        return res.status(200).json({
          success: true,
          message: "Notification deleted",
        });
      }

      // If it's a seller wanting to "remove" a broadcast, we might need a separate model for "readReceipts/hiddenNotifications"
      // For now, let's allow Sellers/Admins to delete any notification they can see if it's their own or they are admin.
      return res.status(403).json({ success: false, message: "Not authorized to delete this notification" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
