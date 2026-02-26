import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { asyncHandler } from "../middlewares/async-handler";

const router = Router();

// Publicly available to authenticated users
router.get("/", authMiddleware, asyncHandler(NotificationController.getNotifications));
router.patch("/mark-read", authMiddleware, asyncHandler(NotificationController.markAllRead));

// Admin and Seller routes
router.post("/", authMiddleware, asyncHandler(NotificationController.createNotification));
router.delete("/:id", authMiddleware, asyncHandler(NotificationController.deleteNotification));

export default router;
