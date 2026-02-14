import { Product, IProduct } from "../models/product.model";

export class ProductService {
  static async createProduct(data: Partial<IProduct>) {
    const product = new Product(data);
    return await product.save();
  }

  static async getAllProducts() {
    return await Product.find().sort({ createdAt: -1 });
  }

  static async getPaginatedProducts(page: number = 1, limit: number = 10, query: any = {}) {
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getProductById(id: string) {
    return await Product.findById(id);
  }

  static async updateProduct(id: string, data: Partial<IProduct>) {
    return await Product.findByIdAndUpdate(id, data, { new: true });
  }

  static async deleteProduct(id: string) {
    return await Product.findByIdAndDelete(id);
  }
}
