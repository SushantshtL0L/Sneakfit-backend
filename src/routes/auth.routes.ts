import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { RegisterDto, LoginDto } from "../dtos/auth.dto";
import { z } from "zod";

// ... existing imports
import { authMiddleware } from "../middlewares/auth.middleware";
import { UserController } from "../controllers/user.controller";


const router = Router();

const validate =
  (schema: z.ZodSchema) =>
  (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err: any) {
      return res.status(400).json(err);
    }
  };

router.post("/register", validate(RegisterDto), AuthController.register);
router.post("/login", validate(LoginDto), AuthController.login);
router.get("/whoami", authMiddleware, UserController.getMe);


export default router;
