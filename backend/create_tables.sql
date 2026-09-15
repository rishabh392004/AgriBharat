-- AgriBharat Complete Database Schema — REFERENCE ONLY
-- !! THIS FILE IS NOT USED FOR DATABASE PROVISIONING !!
-- The canonical provisioning path is: 'npx prisma db init'
-- which applies all tracked forward migrations in migrations/app/.
-- This file exists as a human-readable snapshot of the current schema.

CREATE SCHEMA IF NOT EXISTS public;

-- 1. User table
CREATE TABLE IF NOT EXISTS public."user" (
  "id"           SERIAL PRIMARY KEY,
  "email"        TEXT NOT NULL UNIQUE,
  "name"         TEXT,
  "passwordHash" TEXT NOT NULL,
  "role"         TEXT NOT NULL DEFAULT 'USER',
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Farm table
CREATE TABLE IF NOT EXISTS public."farm" (
  "id"        SERIAL PRIMARY KEY,
  "name"      TEXT NOT NULL,
  "location"  TEXT NOT NULL,
  "area"      FLOAT8 NOT NULL,
  "cropType"  TEXT NOT NULL,
  "userId"    INT4 NOT NULL REFERENCES public."user"("id"),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "farm_userId_idx_a489d58a" ON public."farm" ("userId");

-- 3. Scan table
CREATE TABLE IF NOT EXISTS public."scan" (
  "id"        SERIAL PRIMARY KEY,
  "farmId"    INT4 NOT NULL REFERENCES public."farm"("id"),
  "imageUrl"  TEXT NOT NULL,
  "cropName"  TEXT NOT NULL DEFAULT 'Auto',
  "latitude"  FLOAT8,
  "longitude" FLOAT8,
  "status"    TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "scan_farmId_idx_786bd89b" ON public."scan" ("farmId");

-- 4. Disease Result table
CREATE TABLE IF NOT EXISTS public."diseaseResult" (
  "id"                  SERIAL PRIMARY KEY,
  "scanId"              INT4 NOT NULL UNIQUE REFERENCES public."scan"("id"),
  "disease"             TEXT NOT NULL,
  "confidence"          FLOAT8 NOT NULL,
  "severity"            TEXT NOT NULL,
  "actions"             TEXT NOT NULL,
  "precautions"         TEXT NOT NULL,
  "provider"            TEXT NOT NULL,
  "flagOfficerReview"   BOOLEAN NOT NULL DEFAULT false,
  "foliarDamagePercent" FLOAT8 NOT NULL DEFAULT 0,
  "urgency"             TEXT NOT NULL DEFAULT 'LOW',
  "etlStatus"           TEXT NOT NULL DEFAULT '',
  "top3Predictions"     TEXT NOT NULL DEFAULT '[]',
  "weatherContext"      TEXT NOT NULL DEFAULT '{}',
  "createdAt"           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Message table
CREATE TABLE IF NOT EXISTS public."message" (
  "id"         SERIAL PRIMARY KEY,
  "fromUserId" INT4 NOT NULL REFERENCES public."user"("id"),
  "toUserId"   INT4 NOT NULL REFERENCES public."user"("id"),
  "content"    TEXT NOT NULL,
  "isRead"     BOOLEAN NOT NULL DEFAULT false,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "message_fromUserId_idx_9c2ca0ee" ON public."message" ("fromUserId");
CREATE INDEX IF NOT EXISTS "message_toUserId_idx_397e108f" ON public."message" ("toUserId");

-- 6. Officer Profile table
CREATE TABLE IF NOT EXISTS public."officerProfile" (
  "id"                SERIAL PRIMARY KEY,
  "userId"            INT4 NOT NULL UNIQUE REFERENCES public."user"("id"),
  "badgeNumber"       TEXT NOT NULL UNIQUE,
  "designation"       TEXT NOT NULL,
  "department"        TEXT NOT NULL,
  "jurisdiction"      TEXT NOT NULL,
  "district"          TEXT NOT NULL,
  "state"             TEXT NOT NULL,
  "phone"             TEXT,
  "officeAddress"     TEXT,
  "isActive"          BOOLEAN NOT NULL DEFAULT true,
  "flaggedScansCount" INT4 NOT NULL DEFAULT 0,
  "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "officerProfile_userId_idx" ON public."officerProfile" ("userId");
