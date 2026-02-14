import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from "../dtos/auth.dto";
import { z } from "zod";

import { authMiddleware } from "../middlewares/auth.middleware";
import { UserController } from "../controllers/user.controller";
import { asyncHandler } from "../middlewares/async-handler";


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

router.post("/register", validate(RegisterDto), asyncHandler(AuthController.register));
router.post("/login", validate(LoginDto), asyncHandler(AuthController.login));
router.post("/forgot-password", validate(ForgotPasswordDto), asyncHandler(AuthController.forgotPassword));
router.post("/reset-password", validate(ResetPasswordDto), asyncHandler(AuthController.resetPassword));
router.get("/whoami", authMiddleware, asyncHandler(UserController.getMe));


export default router;
