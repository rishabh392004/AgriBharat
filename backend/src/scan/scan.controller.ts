import type { Response } from "express";

import {
  createScanSchema,
  scanIdSchema
} from "./scan.schema.js";

import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { AppError } from "../common/AppError.js";

import {
  createScan,
  getScanById,
  getScansByUser
} from "./scan.service.js";

export async function createScanController(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const result = createScanSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
    return;
  }

  const { farmId, imageUrl } = result.data;

  const scan = await createScan(
    req.user.userId,
    farmId,
    imageUrl
  );

  res.status(201).json({
    message: "Scan created successfully",
    scan,
  });
}

export async function getScanController(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const result = scanIdSchema.safeParse(req.params);

  if (!result.success) {
    res.status(400).json({
      message: "Invalid scan ID",
    });
    return;
  }

  const scan = await getScanById(result.data.id);

  res.status(200).json({
    scan,
  });
}

export async function getScansController(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const scans = await getScansByUser(req.user.userId);

  res.status(200).json({
    scans,
  });
}
