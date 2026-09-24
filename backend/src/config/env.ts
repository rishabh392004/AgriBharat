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

  // Python Gemini FAQ chatbot service URL
  CHATBOT_SERVICE_URL: z.string().url().default("http://localhost:8001"),

  // Timeout for Chatbot service requests in milliseconds (default 15 seconds)
  CHATBOT_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
});

export const env = envSchema.parse(process.env);

// Warn if external service URLs are still defaulting to localhost in production
if (process.env.NODE_ENV === "production") {
  if (env.ML_SERVICE_URL.includes("localhost") || env.ML_SERVICE_URL.includes("127.0.0.1")) {
    console.warn("[Config] WARNING: ML_SERVICE_URL is set to localhost. Ensure the ML service is reachable at this address.");
  }
  if (env.CHATBOT_SERVICE_URL.includes("localhost") || env.CHATBOT_SERVICE_URL.includes("127.0.0.1")) {
    console.warn("[Config] WARNING: CHATBOT_SERVICE_URL is set to localhost. Ensure the chatbot service is reachable at this address.");
  }
}