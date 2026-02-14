import { AuthService } from "../services/auth.service";
import { Request, Response } from "express";


export class AuthController {
  static async register(req: Request, res: Response) {
    const user = await AuthService.register(
      req.body.name,
      req.body.email,
      req.body.username,
      req.body.password,
      req.body.role
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  }

  static async login(req: Request, res: Response) {
    const token = await AuthService.login(
      req.body.email,
      req.body.password
    );

    res.status(200).json({
      message: "Login successful",
      token,
    });
  }

  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    await AuthService.sendResetPasswordEmail(email);
    res.status(200).json({ message: "Password reset link sent to your email" });
  }

  static async resetPassword(req: Request, res: Response) {
    const { token, newPassword } = req.body;
    await AuthService.resetPassword(token, newPassword);
    res.status(200).json({ message: "Password reset successful" });
  }
}
