import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";
import { sendEmail } from "../config/email";

export class AuthService {
  static async register(name: string, email: string, username: string, password: string, role?: string) {
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new HttpError(409, "Email already exists");
    }

    const existingUsername = await UserRepository.findByUsername(username);
    if (existingUsername) {
      throw new HttpError(409, "Username already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserRepository.create({
      name,
      email,
      username,
      password: hashedPassword,
      role: role as any,
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

  static async sendResetPasswordEmail(email: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new HttpError(404, "User not found with this email");
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 12px;">
        <h2 style="color: #000;">Password Reset Request</h2>
        <p>You requested to reset your password for your <strong>SneakFit</strong> account.</p>
        <p>Please click the button below to set a new password. This link is valid for <strong>1 hour</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 13px; color: #666;">If the button doesn't work, copy and paste this link: <br/> ${resetLink}</p>
        <p style="margin-top: 30px; font-size: 12px; color: #888; border-top: 1px solid #eee; pt: 20px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `;

    await sendEmail(user.email, "Reset your SneakFit Password", html);
    return true;
  }

  static async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await UserRepository.update(decoded.id, { password: hashedPassword });
      return true;
    } catch (error) {
      throw new HttpError(401, "Invalid or expired reset token");
    }
  }
}
