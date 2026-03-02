import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/async-handler";

const router = Router();

router.use((req, res, next) => {
  console.log(`Order Route Hit: ${req.method} ${req.url}`);
  next();
});

router.post("/", authMiddleware, asyncHandler(OrderController.createOrder));
router.get("/my-orders", authMiddleware, asyncHandler(OrderController.getUserOrders));
router.get("/all", authMiddleware, asyncHandler(OrderController.getAllOrders)); // Admin + Seller can use this
router.get("/stats", authMiddleware, asyncHandler(OrderController.getStats)); // Shop analytics for Admin + Seller
router.get("/chart", authMiddleware, asyncHandler(OrderController.getChartData));
router.put("/cancel/:id", authMiddleware, asyncHandler(OrderController.cancelOrder));
router.put("/:id/status", authMiddleware, asyncHandler(OrderController.updateOrderStatus)); // Seller/Admin update status
router.delete("/:id", authMiddleware, asyncHandler(OrderController.deleteOrder));

export default router;
