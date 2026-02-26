import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import userRoutes from "./routes/user.routes";
import adminRoutes from "./routes/admin.routes";
import orderRoutes from "./routes/order.routes";
import reviewRoutes from "./routes/review.routes";
import categoryRoutes from "./routes/category.routes";
import notificationRoutes from "./routes/notification.routes";
import blogRoutes from "./routes/blog.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();


const corsOptions = {
  origin: true, // Allow all origins (needed for mobile app development)
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from public directory
app.use("/item_photos", express.static(path.join(process.cwd(), "public/item_photos")));
app.use("/user_photos", express.static(path.join(process.cwd(), "public/user_photos")));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/users", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/blogs", blogRoutes);

// Global Error Handler (Must be after all routes)
app.use(errorMiddleware);

export default app;
