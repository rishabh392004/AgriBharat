import "dotenv/config";
import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "./contract.d";
import contractJson from "./contract.json" with { type: "json" };
import { env } from "../config/env.js";

const databaseUrl = env.DATABASE_URL || process.env["DATABASE_URL"] || "postgresql://postgres:392004@localhost:5432/postgres";

if (!process.env["DATABASE_URL"]) {
  console.warn(
    "[Database] WARNING: DATABASE_URL is not set in environment variables! Please configure your PostgreSQL connection string in the Render dashboard."
  );
}

export const db = postgres<Contract>({
  contractJson,
  url: databaseUrl,
});