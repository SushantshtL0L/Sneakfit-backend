import { Request, Response } from "express";
import { UserRepository } from "../repositories/user.repository";

export class UserController {
  static async getMe(req: any, res: Response) {
    try {
      const user = await UserRepository.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async updateProfile(req: any, res: Response) {
    try {
      const { name } = req.body;
      const updateData: any = {};
      if (name) updateData.name = name;
      if (req.file) {
        updateData.image = `/user_photos/${req.file.filename}`;
      }

      const user = await UserRepository.update(req.user.id, updateData);
      res.status(200).json({
        message: "Profile updated successfully",
        user,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
