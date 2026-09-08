import type { Response } from "express";

import {
  createScanSchema,
  analyzeScanSchema,
  scanIdSchema
} from "./scan.schema.js";

import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { AppError } from "../common/AppError.js";

import {
  createScan,
  analyzeScanService,
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

  const { farmId, imageUrl, cropName } = result.data;

  const scan = await createScan(
    req.user.userId,
    farmId,
    imageUrl,
    cropName
  );

  res.status(201).json({
    message: "Scan created successfully",
    scan,
  });
}

export async function analyzeScanController(
  req: AuthenticatedRequest,
  res: Response
) {
  const result = analyzeScanSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
    return;
  }

  const { imageUrl, cropName, latitude, longitude, farmId } = result.data;

  const diagnosis = await analyzeScanService({
    imageUrl,
    cropName,
    latitude,
    longitude,
    userId: req.user?.userId,
    farmId,
  });

  res.status(200).json({
    status: "success",
    diagnosis,
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
  const scan = await getScanById(
  result.data.id,
  req.user.userId
  );

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

  const scans = await getScansByUser(req.user.userId, req.user.role);

  res.status(200).json({
    scans,
  });
}
