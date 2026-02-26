import { Request, Response } from "express";
import { Category } from "../models/category.model";

export class CategoryController {
  static async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await Category.find().sort({ name: 1 });
      res.status(200).json({ success: true, data: categories });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createCategory(req: Request, res: Response) {
    try {
      const { name, description, image } = req.body;
      const slug = name.toLowerCase().replace(/ /g, "-");
      
      const category = await Category.create({ name, slug, description, image });
      res.status(201).json({ success: true, data: category });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async seedCategories(req: Request, res: Response) {
    try {
      const defaultCategories = [
        { name: "New Arrivals", slug: "new", description: "Fresh kicks straight from the box." },
        { name: "Thrift Store", slug: "thrift", description: "Pre-loved sneakers with character." }
      ];

      for (const cat of defaultCategories) {
        await Category.findOneAndUpdate(
          { slug: cat.slug },
          cat,
          { upsert: true, new: true }
        );
      }

      res.status(200).json({ success: true, message: "Categories seeded successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
