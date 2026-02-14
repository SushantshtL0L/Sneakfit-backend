import { User } from "../models/user.model";

export class UserRepository {
  static findByEmail(email: string) {
    return User.findOne({ email });
  }

  static findByUsername(username: string) {
    return User.findOne({ username });
  }

  static create(data: any) {
    return User.create(data);
  }

  static findById(id: string) {
    return User.findById(id);
  }

  static update(id: string, data: any) {
    return User.findByIdAndUpdate(id, data, { new: true });
  }

  static findAll(query: any = {}) {
    return User.find(query).sort({ createdAt: -1 });
  }

  static async findPaginated(query: any = {}, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static deleteById(id: string) {
    return User.findByIdAndDelete(id);
  }
}
