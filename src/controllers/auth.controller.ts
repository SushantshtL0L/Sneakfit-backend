import { AuthService } from "../services/auth.service";
import { Request, Response } from "express";


export class AuthController {
  static async register(req: Request, res: Response) {
    const user = await AuthService.register(
      req.body.name,
<<<<<<< HEAD
      req.body.username,
=======
>>>>>>> sprint-2
      req.body.email,
      req.body.username,
      req.body.password
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
}
