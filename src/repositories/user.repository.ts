import { User } from "../models/user.model";

export class UserRepository {
  static findByEmail(email: string) {
    return User.findOne({ email });
  }

  static create(data: any) {
    return User.create(data);
  }
}
