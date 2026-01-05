import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";

export class AuthService {
  static async register(email: string, password: string) {
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new HttpError(409, "Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserRepository.create({
      email,
      password: hashedPassword,
    });

    return user;
  }

  static async login(email: string, password: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new HttpError(401, "Invalid credentials");
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    return token;
  }
}
