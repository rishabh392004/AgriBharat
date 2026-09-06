import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./auth/auth.routes.js";
import { errorMiddleware } from "./common/error.middleware.js";
import { env } from "./config/env.js";
import scanRoutes from "./scan/scan.routes.js";
import farmRoutes from "./farm/farm.routes.js";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/scans", scanRoutes);
app.use("/api/v1/farms", farmRoutes);

app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    service: "AgriBharat Backend",
  });
});

app.use(errorMiddleware);

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`AgriBharat backend running on port ${PORT}`);
});