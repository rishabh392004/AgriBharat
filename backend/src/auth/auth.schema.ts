import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
  name: z.string().trim().min(2).max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["USER", "OFFICER", "ADMIN"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;