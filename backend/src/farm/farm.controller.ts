import type { Response } from "express";
import { AppError } from "../common/AppError.js";
import type { FarmRequest } from "./farm.types.js";
import {
  createFarmSchema,
  updateFarmSchema,
} from "./farm.schema.js";
import {
  createFarm as createFarmService,
  getFarmsByUserId,
  getFarmById,
  updateFarm as updateFarmService,
  deleteFarm as deleteFarmService,
} from "./farm.service.js";

export async function createFarm(
  req: FarmRequest,
  res: Response
) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const result = createFarmSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
    return;
  }

  const farm = await createFarmService(
    req.user.userId,
    result.data
  );

  res.status(201).json({
    message: "Farm created successfully",
    farm,
  });
}

export async function getFarms(
  req: FarmRequest,
  res: Response
) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const farms = await getFarmsByUserId(req.user.userId);

  res.status(200).json({
    farms,
  });
}

export async function getFarm(
  req: FarmRequest,
  res: Response
) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const farmId = Number(req.params.id);

  if (!Number.isInteger(farmId) || farmId <= 0) {
    throw new AppError("Invalid farm ID", 400);
  }

  const farm = await getFarmById(
    farmId,
    req.user.userId
  );

  res.status(200).json({
    farm,
  });
}

export async function updateFarm(
  req: FarmRequest,
  res: Response
) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const farmId = Number(req.params.id);

  if (!Number.isInteger(farmId) || farmId <= 0) {
    throw new AppError("Invalid farm ID", 400);
  }

  const result = updateFarmSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
    return;
  }

  const farm = await updateFarmService(
    farmId,
    req.user.userId,
    result.data
  );

  res.status(200).json({
    message: "Farm updated successfully",
    farm,
  });
}

export async function deleteFarm(
  req: FarmRequest,
  res: Response
) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const farmId = Number(req.params.id);

  if (!Number.isInteger(farmId) || farmId <= 0) {
    throw new AppError("Invalid farm ID", 400);
  }

  const farm = await deleteFarmService(
    farmId,
    req.user.userId
  );

  res.status(200).json({
    message: "Farm deleted successfully",
    farm,
  });
}