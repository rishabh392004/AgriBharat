import { z } from "zod";

export const emailOrPhoneSchema = z
  .string()
  .trim()
  .refine(
    (val) => {
      if (val.includes("@")) {
        return z.string().email().safeParse(val).success;
      }
      const digits = val.replace(/\D/g, "");
      return digits.length >= 10;
    },
    {
      message: "Must be a valid email or at least 10-digit phone number",
    }
  )
  .transform((val) => {
    if (val.includes("@")) {
      return val.toLowerCase();
    }
    const digits = val.replace(/\D/g, "");
    return `${digits}@agribharat.com`;
  });

export const passwordSchema = z
  .string()
  .min(4, "Password must be at least 4 characters")
  .max(72);

export const registerSchema = z.object({
  email: emailOrPhoneSchema,
  password: passwordSchema,
  name: z.string().trim().min(1).max(100).optional(),
});

export const loginSchema = z.object({
  email: emailOrPhoneSchema,
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;