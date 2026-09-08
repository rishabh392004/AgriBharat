import { db } from "../prisma/db.js";
import { AppError } from "../common/AppError.js";
import type { z } from "zod";

import type {
  createOfficerProfileSchema,
  updateOfficerProfileSchema,
} from "./officer.schema.js";

type CreateInput = z.infer<typeof createOfficerProfileSchema>;
type UpdateInput = z.infer<typeof updateOfficerProfileSchema>;

type OfficerProfile = NonNullable<
  Awaited<ReturnType<typeof db.orm.public.OfficerProfile.create>>
>;

// ── Helpers ────────────────────────────────────────────────────────────────

function formatProfile(profile: OfficerProfile) {
  return {
    id: profile.id,
    userId: profile.userId,
    badgeNumber: profile.badgeNumber,
    designation: profile.designation,
    department: profile.department,
    jurisdiction: profile.jurisdiction,
    district: profile.district,
    state: profile.state,
    phone: profile.phone,
    officeAddress: profile.officeAddress,
    isActive: profile.isActive,
    flaggedScansCount: profile.flaggedScansCount,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

// ── Service Functions ──────────────────────────────────────────────────────

/**
 * Create an officer profile for the authenticated user.
 * The authenticated user must have the OFFICER role.
 */
export async function createOfficerProfile(
  userId: number,
  input: CreateInput
) {
  const user = await db.orm.public.User
    .where({ id: userId })
    .first();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role !== "OFFICER") {
    throw new AppError(
      "Only officers can create an officer profile",
      403
    );
  }

  const existing = await db.orm.public.OfficerProfile
    .where({ userId })
    .first();

  if (existing) {
    throw new AppError(
      "Officer profile already exists",
      409
    );
  }

  const profile = await db.orm.public.OfficerProfile.create({
    userId,
    badgeNumber: input.badgeNumber,
    designation: input.designation,
    department: input.department,
    jurisdiction: input.jurisdiction,
    district: input.district,
    state: input.state,
    phone: input.phone ?? null,
    officeAddress: input.officeAddress ?? null,
  });

  return formatProfile(profile);
}

/**
 * Get the officer profile of the authenticated officer.
 */
export async function getMyOfficerProfile(userId: number) {
  const profile = await db.orm.public.OfficerProfile
    .where({ userId })
    .first();

  if (!profile) {
    throw new AppError(
      "Officer profile not found",
      404
    );
  }

  return formatProfile(profile);
}

/**
 * Get any officer profile by their userId.
 */
export async function getOfficerProfileByUserId(
  targetUserId: number
) {
  const profile = await db.orm.public.OfficerProfile
    .where({ userId: targetUserId })
    .first();

  if (!profile) {
    throw new AppError(
      "Officer profile not found",
      404
    );
  }

  return formatProfile(profile);
}

/**
 * Update the officer's own profile.
 */
export async function updateOfficerProfile(
  userId: number,
  input: UpdateInput
) {
  const profile = await db.orm.public.OfficerProfile
    .where({ userId })
    .first();

  if (!profile) {
    throw new AppError(
      "Officer profile not found",
      404
    );
  }

  const updated = await db.orm.public.OfficerProfile
    .where({ userId })
    .update({
      ...(input.badgeNumber && {
        badgeNumber: input.badgeNumber,
      }),

      ...(input.designation && {
        designation: input.designation,
      }),

      ...(input.department && {
        department: input.department,
      }),

      ...(input.jurisdiction && {
        jurisdiction: input.jurisdiction,
      }),

      ...(input.district && {
        district: input.district,
      }),

      ...(input.state && {
        state: input.state,
      }),

      ...(input.phone !== undefined && {
        phone: input.phone ?? null,
      }),

      ...(input.officeAddress !== undefined && {
        officeAddress: input.officeAddress ?? null,
      }),
    });

  if (!updated) {
    throw new AppError(
      "Officer profile not found",
      404
    );
  }

  return formatProfile(updated);
}

/**
 * Increment the flaggedScansCount when an officer
 * reviews a flagged scan.
 */
export async function incrementFlaggedCount(
  userId: number
) {
  const profile = await db.orm.public.OfficerProfile
    .where({ userId })
    .first();

  if (!profile) {
    throw new AppError(
      "Officer profile not found",
      404
    );
  }

  const updated = await db.orm.public.OfficerProfile
    .where({ userId })
    .update({
      flaggedScansCount:
        profile.flaggedScansCount + 1,
    });

  if (!updated) {
    throw new AppError(
      "Officer profile not found",
      404
    );
  }

  return formatProfile(updated);
}