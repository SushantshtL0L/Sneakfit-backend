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
}
