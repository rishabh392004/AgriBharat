import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  FRONTEND_URL: z.string().url("FRONTEND_URL must be a valid URL"),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters"),

  JWT_EXPIRES_IN: z.string().min(1, "JWT_EXPIRES_IN is required").default("1h"),

  PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(5000),

  // Python FastAPI ML inference service URL
  ML_SERVICE_URL: z.string().url().default("http://localhost:8000"),

  // Timeout for ML service requests in milliseconds (default 30 seconds)
  ML_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
});

export const env = envSchema.parse(process.env);