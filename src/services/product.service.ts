import { Product, IProduct } from "../models/product.model";

export class ProductService {
  static async createProduct(data: Partial<IProduct>) {
    const product = new Product(data);
    return await product.save();
  }

  static async getAllProducts() {
    return await Product.find().sort({ createdAt: -1 });
  }
}
