import { z } from "zod";

export const RegisterDto = z
  .object({
    name: z.string().min(2),
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const LoginDto = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
