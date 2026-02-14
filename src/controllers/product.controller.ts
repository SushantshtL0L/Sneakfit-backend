import { Request, Response } from "express";
import { ProductService } from "../services/product.service";

export class ProductController {
  static async createProduct(req: Request, res: Response) {
    try {
      const { name, description, condition, price, brand } = req.body;
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
        price: price ? Number(price) : undefined,
        brand,
        image,
        seller: (req as any).user.id,
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
      const { page, limit } = req.query;

      if (page || limit) {
        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 10;
        const result = await ProductService.getPaginatedProducts(pageNum, limitNum);
        return res.status(200).json(result);
      }

      const products = await ProductService.getAllProducts();
      res.status(200).json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(200).json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const user = (req as any).user;
      const isOwner = product.seller.toString() === user.id;
      const isAdmin = user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "You are not authorized to update this product" });
      }

      const updatedProduct = await ProductService.updateProduct(id, req.body);
      res.status(200).json(updatedProduct);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const user = (req as any).user;
      const isOwner = product.seller.toString() === user.id;
      const isAdmin = user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "You are not authorized to delete this product" });
      }

      await ProductService.deleteProduct(id);

      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
