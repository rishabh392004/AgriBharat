import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

// Load from current working directory
dotenv.config();

// Also load from backend directory if started from workspace root
try {
  dotenv.config({ path: path.resolve(import.meta.dirname, "../../.env") });
  dotenv.config({ path: path.resolve(import.meta.dirname, "../.env") });
} catch {
  // Ignore path resolve errors
}

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).default("postgresql://postgres:392004@localhost:5432/postgres"),
  FRONTEND_URL: z.string().url("FRONTEND_URL must be a valid URL").default("http://localhost:3000"),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters")
    .default("agribharat-super-secret-jwt-key-minimum-32chars"),

  JWT_EXPIRES_IN: z.string().min(1, "JWT_EXPIRES_IN is required").default("7d"),

  PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(5000),
});

export const env = envSchema.parse(process.env);