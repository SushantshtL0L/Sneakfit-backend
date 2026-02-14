import { z } from "zod";

export const RegisterDto = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
});

export const LoginDto = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const ForgotPasswordDto = z.object({
  email: z.string().email(),
});

export const ResetPasswordDto = z.object({
  token: z.string(),
  newPassword: z.string().min(6),
});

