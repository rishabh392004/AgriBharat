import "dotenv/config";
import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "./contract.d";
import contractJson from "./contract.json" with { type: "json" };
import { env } from "../config/env.js";

function getSanitizedDbUrl(): string {
  let raw = (process.env["DATABASE_URL"] || env.DATABASE_URL || "").trim();

  // Strip leading variable assignment if user pasted "DATABASE_URL=..."
  if (raw.startsWith("DATABASE_URL=")) {
    raw = raw.slice("DATABASE_URL=".length).trim();
  }
  // Strip psql prefix if user pasted "psql '...'"
  if (raw.startsWith("psql ")) {
    raw = raw.slice(5).trim();
  }
  // Strip surrounding quotes
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    raw = raw.slice(1, -1).trim();
  }

  // Detect placeholder brackets
  if (raw.includes("[") && raw.includes("]")) {
    console.error(
      "[Database] CRITICAL: DATABASE_URL contains placeholder brackets '[...]'. Please replace '[password]' with your real database password in the Render dashboard."
    );
  }

  // Validate format with URL constructor
  try {
    const parsed = new URL(raw);
    if (parsed.protocol === "postgres:" || parsed.protocol === "postgresql:") {
      return raw;
    }
    console.error(
      `[Database] ERROR: DATABASE_URL scheme must be postgres:// or postgresql:// (received: ${parsed.protocol})`
    );
  } catch {
    console.error(
      `[Database] CRITICAL: DATABASE_URL is not a valid Postgres URL (unparseable). Using fallback so server process does not crash. Please fix DATABASE_URL in Render.`
    );
  }

  return "postgresql://postgres:fallback@localhost:5432/postgres";
}

const databaseUrl = getSanitizedDbUrl();

export const db = postgres<Contract>({
  contractJson,
  url: databaseUrl,
});