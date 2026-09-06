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
