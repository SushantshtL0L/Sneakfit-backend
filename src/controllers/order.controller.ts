import { Request, Response } from "express";
import { Order } from "../models/order.model";
import { Product } from "../models/product.model";
import { Notification } from "../models/notification.model";
import { Review } from "../models/review.model";

export class OrderController {
  static createOrder = async (req: Request, res: Response) => {
    try {
      const { items, totalAmount, paymentMethod, shippingAddress } = req.body;
      const userId = (req as any).user.id;

      if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: "No items in order" });
      }

      const order = await Order.create({
        user: userId,
        items,
        totalAmount,
        paymentMethod,
        shippingAddress,
      });

      res.status(201).json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
  };

  static getUserOrders = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { page, limit } = req.query;
      
      const query = { user: userId };

      if (page || limit) {
        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 10;
        const skip = (pageNum - 1) * limitNum;

        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum);

        return res.status(200).json({
          success: true,
          data: orders,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum),
          },
        });
      }

      const orders = await Order.find(query).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
  };

  static getAllOrders = async (req: Request, res: Response) => {
    try {
      const { page, limit, status } = req.query;
      const requestingUser = (req as any).user;
      const query: any = {};

      if (status && status !== "all") {
        query.status = status;
      }

      // Role-based filtering
      if (requestingUser.role !== "admin") {
        const sellerId = requestingUser.id;
        // Get all products belonging to this seller
        const sellerProducts = await Product.find({ seller: sellerId }).select("_id");
        const sellerProductIds = sellerProducts.map((p) => p._id);
        
        // Filter orders that contain at least one of these products
        query["items.product"] = { $in: sellerProductIds };
      }

      // Get counts for summary cards based on the same visibility query
      const baseVisibilityQuery = requestingUser.role === "admin" ? {} : query["items.product"] ? { "items.product": query["items.product"] } : {};
      
      const revenueResult = await Order.aggregate([
        { $match: { ...baseVisibilityQuery, status: "delivered" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]);

      const stats: Record<string, number> = {
        all: await Order.countDocuments(baseVisibilityQuery),
        pending: await Order.countDocuments({ ...baseVisibilityQuery, status: "pending" }),
        processing: await Order.countDocuments({ ...baseVisibilityQuery, status: "processing" }),
        shipped: await Order.countDocuments({ ...baseVisibilityQuery, status: "shipped" }),
        delivered: await Order.countDocuments({ ...baseVisibilityQuery, status: "delivered" }),
        cancelled: await Order.countDocuments({ ...baseVisibilityQuery, status: "cancelled" }),
        revenue: revenueResult[0]?.total || 0,
      };

      if (page || limit) {
        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 10;
        const skip = (pageNum - 1) * limitNum;

        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
          .populate("user", "name email")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum);

        return res.status(200).json({
          success: true,
          data: orders,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum),
          },
          stats,
        });
      }

      const orders = await Order.find(query)
        .populate("user", "name email")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: orders,
        stats,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
  };

  static cancelOrder = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      // Admins can cancel any order, buyers can only cancel their own
      const query = user.role === "admin" ? { _id: id } : { _id: id, user: user.id };
      const order = await Order.findOne(query);

      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      if (order.status !== "processing" && order.status !== "pending") {
        return res.status(400).json({ 
          success: false, 
          message: `Cannot cancel an order that is already ${order.status}` 
        });
      }

      order.status = "cancelled";
      await order.save();

      // Create notification for the user
      await Notification.create({
        user: order.user,
        title: "Order Cancelled",
        message: `Your order #${order._id.toString().slice(-6).toUpperCase()} has been cancelled.`,
        type: "order",
      });

      res.status(200).json({
        success: true,
        message: "Order cancelled successfully",
        data: order,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
  };

  static deleteOrder = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      if (user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Only admins can delete orders" });
      }

      const result = await Order.findByIdAndDelete(id);

      if (!result) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      res.status(200).json({
        success: true,
        message: "Order deleted successfully",
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
  };

  static updateOrderStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const requestingUser = (req as any).user;

      const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status value" });
      }

      const order = await Order.findById(id).populate("items.product");
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      // If not admin, verify the seller owns at least one product in this order
      if (requestingUser.role !== "admin") {
        const sellerId = requestingUser.id;
        const sellerProducts = await Product.find({ seller: sellerId }).select("_id");
        const sellerProductIds = sellerProducts.map((p: any) => p._id.toString());
        
        const hasProduct = order.items.some((item: any) => {
          if (!item.product) return false;
          // product can be an object (populated) or an ID (unpopulated)
          const prodId = (item.product as any)._id 
            ? (item.product as any)._id.toString() 
            : item.product.toString();
          return sellerProductIds.includes(prodId);
        });

        if (!hasProduct) {
          return res.status(403).json({ success: false, message: "Not authorized to update this order" });
        }
      }

      order.status = status;
      await order.save();

      // Create notification for the user
      const statusTitles: Record<string, string> = {
        shipped: "Order Shipped 🚚",
        delivered: "Order Delivered 🎉",
        processing: "Order Processing",
        cancelled: "Order Cancelled",
      };

      await Notification.create({
        user: order.user,
        title: statusTitles[status] || "Order Status Updated",
        message: `Your order #${order._id.toString().slice(-6).toUpperCase()} status is now: ${status}.`,
        type: "order",
      });

      res.status(200).json({
        success: true,
        message: `Order status updated to ${status}`,
        data: order,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
  };

  static getStats = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const orderQuery: any = {};
      const productQuery: any = {};
      const reviewQuery: any = {};

      if (user.role !== "admin") {
        const sellerId = user.id;
        const sellerProducts = await Product.find({ seller: sellerId }).select("_id");
        const sellerProductIds = sellerProducts.map((p) => p._id);
        orderQuery["items.product"] = { $in: sellerProductIds };
        productQuery.seller = sellerId;
        reviewQuery.product = { $in: sellerProductIds };
      }

      const [totalOrders, pendingOrders, shippedOrders, deliveredOrders, totalProducts, totalReviews, revenueResult] =
        await Promise.all([
          Order.countDocuments(orderQuery),
          Order.countDocuments({ ...orderQuery, status: "pending" }),
          Order.countDocuments({ ...orderQuery, status: "shipped" }),
          Order.countDocuments({ ...orderQuery, status: "delivered" }),
          Product.countDocuments(productQuery),
          Review.countDocuments(reviewQuery),
          Order.aggregate([
            { $match: { ...orderQuery, status: "delivered" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
          ]),
        ]);

      res.status(200).json({
        success: true,
        data: {
          totalOrders,
          pendingOrders,
          shippedOrders,
          deliveredOrders,
          totalProducts,
          totalReviews,
          totalRevenue: revenueResult[0]?.total || 0,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
  };

  static getChartData = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const query: any = {};

      if (user.role !== "admin") {
        const sellerId = user.id;
        const sellerProducts = await Product.find({ seller: sellerId }).select("_id");
        const sellerProductIds = sellerProducts.map((p) => p._id);
        query["items.product"] = { $in: sellerProductIds };
      }

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const chartData = await Order.aggregate([
        { 
          $match: { 
            ...query, 
            createdAt: { $gte: sevenDaysAgo } 
          } 
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        
        const existingData = chartData.find(item => item._id === dateStr);
        last7Days.push({
          name: dayName,
          date: dateStr,
          revenue: existingData ? existingData.revenue : 0,
          orders: existingData ? existingData.orders : 0
        });
      }

      res.status(200).json({ success: true, data: last7Days });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
