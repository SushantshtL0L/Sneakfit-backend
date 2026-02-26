import { Request, Response } from "express";
import { Types } from "mongoose";
import { Review } from "../models/review.model";

export class ReviewController {
  static createReview = async (req: Request, res: Response) => {
    const { product, rating, comment } = req.body;
    const userId = (req as any).user.id;

    if (!product || !rating || !comment) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const review = await Review.create({
      user: userId,
      product,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  };

  static getProductReviews = async (req: Request, res: Response) => {
    const { productId } = req.params;
    const reviews = await Review.find({ product: new Types.ObjectId(productId) as any })
      .populate("user", "name image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  };

  static deleteReview = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // Check if user is admin OR the owner of the review
    if (userRole !== "admin" && review.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this review" });
    }

    await Review.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  };
}
