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

    // 1. Generate JWT Token (for Web)
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    // 2. Generate 6-digit OTP (for Mobile)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // 3. Save OTP to user
    await UserRepository.update(user._id as any, { 
      resetPasswordOTP: otp,
      resetPasswordOTPExpiry: otpExpiry
    });

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 12px; background-color: #f9f9f9;">
        <h2 style="color: #000; text-align: center;">Password Reset Request</h2>
        <p>You requested to reset your password for your <strong>SneakFit</strong> account.</p>
        
        <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #ddd; margin: 20px 0;">
          <h3 style="margin-top: 0; font-size: 16px;">Option 1: For Web Users</h3>
          <p>Click the button below to set a new password on your browser:</p>
          <div style="text-align: center; margin: 15px 0;">
            <a href="${resetLink}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
        </div>

        <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #ddd; margin: 20px 0;">
          <h3 style="margin-top: 0; font-size: 16px;">Option 2: For Mobile App</h3>
          <p>Please enter the following 6-digit verification code in your mobile app:</p>
          <div style="text-align: center; margin: 15px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #23D19D;">${otp}</span>
          </div>
          <p style="font-size: 11px; color: #888; text-align: center;">This code is valid for 10 minutes.</p>
        </div>

        <p style="font-size: 12px; color: #888; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `;

    await sendEmail(user.email, "Reset your SneakFit Password", html);
    return true;
  }

  static async resetPassword(token: string, newPassword: string) {
    try {
      let userId: string;

      // Check if it's a 6-digit OTP (Mobile flow)
      if (token.length === 6 && /^\d+$/.test(token)) {
        const user = await UserRepository.findUserByOTP(token);
        if (!user || !user.resetPasswordOTPExpiry || user.resetPasswordOTPExpiry < new Date()) {
          throw new HttpError(401, "Invalid or expired OTP code");
        }
        userId = (user._id as any).toString();

        // Clear OTP after success
        await UserRepository.update(userId as any, { 
          resetPasswordOTP: undefined, 
          resetPasswordOTPExpiry: undefined 
        });
      } else {
        // Fallback to JWT Token (Web flow)
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        userId = decoded.id;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await UserRepository.update(userId as any, { password: hashedPassword });
      return true;
    } catch (error: any) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(401, "Invalid or expired reset token");
    }
  }
}
