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

// Auto-sanitize common copy-paste issues in DATABASE_URL
if (process.env.DATABASE_URL) {
  let url = process.env.DATABASE_URL.trim();
  if (url.startsWith("DATABASE_URL=")) {
    url = url.slice("DATABASE_URL=".length).trim();
  }
  if (url.startsWith("psql ")) {
    url = url.slice(5).trim();
  }
  if (
    (url.startsWith('"') && url.endsWith('"')) ||
    (url.startsWith("'") && url.endsWith("'"))
  ) {
    url = url.slice(1, -1).trim();
  }
  process.env.DATABASE_URL = url;
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

  // Python FastAPI ML disease-detection service (crop-disease/main.py → port 8000)
  ML_SERVICE_URL: z.string().url().default("http://localhost:8000"),

  // Python Gemini FAQ chatbot service (crop-disease/faq_bot.py → port 8001)
  CHATBOT_SERVICE_URL: z.string().url().default("http://localhost:8001"),

  // ── Twilio WhatsApp Webhook (optional — leave blank to disable) ──────────
  // Set these to activate the real WhatsApp bot endpoint.
  // Get credentials at: https://www.twilio.com/console
  TWILIO_ACCOUNT_SID:    z.string().optional(),
  TWILIO_AUTH_TOKEN:     z.string().optional(),
  // Your Twilio WhatsApp sender — sandbox default: whatsapp:+14155238886
  TWILIO_WHATSAPP_FROM:  z.string().optional(),
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