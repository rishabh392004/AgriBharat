import type { Response } from "express";

import {
  createScanSchema,
  scanIdSchema,
  updateScanStatusSchema,
} from "./scan.schema.js";

import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { AppError } from "../common/AppError.js";

import {
  createScan,
  getScanById,
  getScansByUser,
  updateScanStatus,
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

export async function updateScanStatusController(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const idResult = scanIdSchema.safeParse(req.params);

  if (!idResult.success) {
    res.status(400).json({
      message: "Invalid scan ID",
    });
    return;
  }

  const statusResult = updateScanStatusSchema.safeParse(req.body);

  if (!statusResult.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: statusResult.error.flatten().fieldErrors,
    });
    return;
  }

  const scan = await updateScanStatus(
    idResult.data.id,
    statusResult.data.status
  );

  res.status(200).json({
    message: "Scan status updated successfully",
    scan,
  });
}