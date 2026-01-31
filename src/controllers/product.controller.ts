import { Request, Response } from "express";
import { ProductService } from "../services/product.service";

export class ProductController {
  static async createProduct(req: Request, res: Response) {
    try {
      const { name, description, condition } = req.body;
      const image = req.file ? `/item_photos/${req.file.filename}` : "";

      if (!image) {
        return res.status(400).json({ 
          message: "Image is required. Please ensure the key in Postman is set to 'image' and the type is set to 'File'." 
        });
      }

      const product = await ProductService.createProduct({
        name,
        description,
        condition,
        image,
      });

      res.status(201).json({
        message: "Product created successfully",
        product,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getAllProducts(req: Request, res: Response) {
    try {
      const products = await ProductService.getAllProducts();
      res.status(200).json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
