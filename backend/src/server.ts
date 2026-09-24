import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./auth/auth.routes.js";
import { errorMiddleware } from "./common/error.middleware.js";
import { env } from "./config/env.js";
import { db } from "./prisma/db.js";
import scanRoutes from "./scan/scan.routes.js";
import farmRoutes from "./farm/farm.routes.js";
import messageRoutes from "./message/message.routes.js";
import officerRoutes from "./officer/officer.routes.js";
import chatbotRoutes from "./chatbot/chatbot.routes.js";
import whatsappRoutes from "./whatsapp/whatsapp.routes.js";

const app = express();

// Trust reverse proxy hops (e.g. Nginx, Render, Railway, AWS ALB) for correct client IP detection in rate limiters
app.set("trust proxy", 1);

// Restrict CORS: allow localhost only in development / test
const allowedOrigins: string[] = [env.FRONTEND_URL];
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:3000", "http://127.0.0.1:3000");
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/scans", scanRoutes);
app.use("/api/v1/farms", farmRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/officer", officerRoutes);
app.use("/api/v1/chatbot", chatbotRoutes);
app.use("/api/v1/whatsapp", whatsappRoutes);

/** Liveness probe — fast check for orchestrator process liveness */
app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    service: "AgriBharat Backend",
    timestamp: new Date().toISOString(),
  });
});

/** Readiness probe — active check verifying database connectivity */
app.get("/ready", async (_req, res) => {
  try {
    await db.orm.public.User.where({ id: -1 }).first();
    res.json({
      status: "READY",
      service: "AgriBharat Backend",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(503).json({
      status: "NOT_READY",
      service: "AgriBharat Backend",
      database: "disconnected",
      error: errorMsg,
      timestamp: new Date().toISOString(),
    });
  }
});

app.use(errorMiddleware);

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`AgriBharat backend running on port ${PORT}`);
});

// Graceful shutdown on SIGTERM / SIGINT
function gracefulShutdown(signal: string) {
  console.info(`[Server] ${signal} signal received: closing HTTP server...`);
  server.close(() => {
    console.info("[Server] HTTP server closed cleanly.");
    process.exit(0);
  });

  // Force close after 10s timeout
  setTimeout(() => {
    console.error("[Server] Forcefully shutting down after timeout.");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export { app, server };