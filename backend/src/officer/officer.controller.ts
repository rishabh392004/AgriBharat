import type { Response } from "express";

import type { AuthenticatedRequest } from "../auth/auth.middleware.js";

import { AppError } from "../common/AppError.js";

import {
  createOfficerProfileSchema,
  updateOfficerProfileSchema,
} from "./officer.schema.js";

import {
  createOfficerProfile,
  getMyOfficerProfile,
  getOfficerProfileByUserId,
  updateOfficerProfile,
} from "./officer.service.js";

// POST /api/officer/profile
export async function createOfficerProfileController(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const result = createOfficerProfileSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
    return;
  }

  const profile = await createOfficerProfile(req.user.userId, result.data);

  res.status(201).json({
    message: "Officer profile created",
    profile,
  });
}

// GET /api/officer/profile/me
export async function getMyProfileController(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const profile = await getMyOfficerProfile(req.user.userId);

  res.status(200).json({ profile });
}

// GET /api/officer/profile/:userId
export async function getOfficerProfileController(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const userIdParam = req.params.userId;

  if (!userIdParam || Array.isArray(userIdParam)) {
    res.status(400).json({
      message: "Invalid user ID",
    });
    return;
  }

  const targetUserId = Number.parseInt(userIdParam, 10);

  if (Number.isNaN(targetUserId)) {
    res.status(400).json({
      message: "Invalid user ID",
    });
    return;
  }

  const profile = await getOfficerProfileByUserId(targetUserId);

  res.status(200).json({ profile });
}

// PATCH /api/officer/profile/me
export async function updateOfficerProfileController(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const result = updateOfficerProfileSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
    return;
  }

  const profile = await updateOfficerProfile(req.user.userId, result.data);

  res.status(200).json({
    message: "Officer profile updated",
    profile,
  });
}