import { Request, Response } from "express";
import { UserRepository } from "../repositories/user.repository";
import { AuthService } from "../services/auth.service";

export class AdminUserController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      const { role, page, limit } = req.query;
      const query: any = {};
      
      if (role && role !== 'all') {
        query.role = role;
      }

      // Backward compatibility 
      // Otherwise, return the original raw array (for Flutter).
      if (page || limit) {
        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 10;
        const result = await UserRepository.findPaginated(query, pageNum, limitNum);
        return res.status(200).json(result);
      }

      const users = await UserRepository.findAll(query);
      res.status(200).json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const user = await UserRepository.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async createUser(req: Request, res: Response) {
    try {
      const { name, email, username, password, role } = req.body;
      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "Email already exists" });
      }

      const updateData: any = { name, email, username, password, role };
      if (req.file) {
        updateData.image = `/user_photos/${req.file.filename}`;
      }

     
      const user = await AuthService.register(name, email, username, password);
      
      
      if (role || req.file) {
          await UserRepository.update(user._id as unknown as string, { 
              ...(role && { role }), 
              ...(req.file && { image: updateData.image }) 
          });
      }

      const updatedUser = await UserRepository.findById(user._id as unknown as string);

      res.status(201).json({
        message: "User created successfully by admin",
        user: updatedUser
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const { name, email, username, role } = req.body;
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (username) updateData.username = username;
      if (role) updateData.role = role;
      if (req.file) {
        updateData.image = `/user_photos/${req.file.filename}`;
      }

      const user = await UserRepository.update(req.params.id, updateData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({
        message: "User updated successfully by admin",
        user,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const user = await UserRepository.deleteById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
