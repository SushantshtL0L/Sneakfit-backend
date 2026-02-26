import { Request, Response } from "express";
import { Blog } from "../models/blog.model";

export class BlogController {
  // Get all blogs
  static async getAllBlogs(req: Request, res: Response) {
    try {
      const blogs = await Blog.find()
        .populate("author", "username firstName lastName")
        .sort({ createdAt: -1 });
      
      res.status(200).json({
        success: true,
        data: blogs,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get blog by ID
  static async getBlogById(req: Request, res: Response) {
    try {
      const blog = await Blog.findById(req.params.id).populate("author", "username firstName lastName");
      if (!blog) {
        return res.status(404).json({ success: false, message: "Blog not found" });
      }
      res.status(200).json({
        success: true,
        data: blog,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Create a new blog (Admin only)
  static async createBlog(req: Request, res: Response) {
    try {
      const { title, content, image, tags, category } = req.body;
      const author = (req as any).user.id;

      const blog = await Blog.create({
        title,
        content,
        author,
        image,
        tags,
        category,
      });

      res.status(201).json({
        success: true,
        data: blog,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Update blog (Admin only)
  static async updateBlog(req: Request, res: Response) {
    try {
      const { title, content, image, tags, category } = req.body;
      const blog = await Blog.findByIdAndUpdate(
        req.params.id,
        { title, content, image, tags, category },
        { new: true }
      );

      if (!blog) {
        return res.status(404).json({ success: false, message: "Blog not found" });
      }

      res.status(200).json({
        success: true,
        data: blog,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Delete blog (Admin only)
  static async deleteBlog(req: Request, res: Response) {
    try {
      const blog = await Blog.findByIdAndDelete(req.params.id);
      if (!blog) {
        return res.status(404).json({ success: false, message: "Blog not found" });
      }
      res.status(200).json({
        success: true,
        message: "Blog deleted successfully",
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
