-- AgriBharat Database Setup
-- Run this in psql or pgAdmin to create all tables

-- Create schema (usually exists by default)
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
  "imageUrl"  TEXT NOT NULL,
  "status"    TEXT NOT NULL DEFAULT 'PENDING',
  "farmId"    INT4 NOT NULL REFERENCES public."farm"("id"),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "scan_farmId_idx_786bd89b" ON public."scan" ("farmId");

-- 4. Officer Profile table
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

-- 5. Disease result table
CREATE TABLE IF NOT EXISTS public."diseaseResult" (
  "id"          SERIAL PRIMARY KEY,
  "scanId"      INT4 NOT NULL UNIQUE REFERENCES public."scan"("id"),
  "disease"     TEXT NOT NULL,
  "confidence"  FLOAT8 NOT NULL,
  "severity"    TEXT NOT NULL,
  "actions"     TEXT NOT NULL,
  "precautions" TEXT NOT NULL,
  "provider"    TEXT NOT NULL,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Message table
CREATE TABLE IF NOT EXISTS public."message" (
  "id"         SERIAL PRIMARY KEY,
  "fromUserId" INT4 NOT NULL REFERENCES public."user"("id"),
  "toUserId"   INT4 NOT NULL REFERENCES public."user"("id"),
  "content"    TEXT NOT NULL,
  "isRead"     BOOLEAN NOT NULL DEFAULT false,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "message_fromUserId_idx" ON public."message" ("fromUserId");
CREATE INDEX IF NOT EXISTS "message_toUserId_idx" ON public."message" ("toUserId");
