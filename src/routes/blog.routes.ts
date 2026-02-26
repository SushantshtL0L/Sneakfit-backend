import { Router } from "express";
import { BlogController } from "../controllers/blog.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { asyncHandler } from "../middlewares/async-handler";

const router = Router();

// Public routes
router.get("/", asyncHandler(BlogController.getAllBlogs));
router.get("/:id", asyncHandler(BlogController.getBlogById));

// Admin only routes
router.post("/", authMiddleware, adminMiddleware, asyncHandler(BlogController.createBlog));
router.put("/:id", authMiddleware, adminMiddleware, asyncHandler(BlogController.updateBlog));
router.delete("/:id", authMiddleware, adminMiddleware, asyncHandler(BlogController.deleteBlog));

export default router;
