import { AppError } from "../common/AppError.js";
import { db } from "../prisma/db.js";
import type {
  CreateFarmInput,
  UpdateFarmInput,
} from "./farm.schema.js";

export async function createFarm(
  userId: number,
  data: CreateFarmInput
) {
  const farm = await db.orm.public.Farm.create({
    userId,
    name: data.name,
    location: data.location,
    cropType: data.cropType,
    area: data.area,
  });

  return farm;
}

export async function getFarmsByUserId(userId: number) {
  return db.orm.public.Farm
    .where({ userId })
    .all();
}

export async function getFarmById(
  farmId: number,
  userId: number
) {
  const farm = await db.orm.public.Farm
    .where({
      id: farmId,
      userId,
    })
    .first();

  if (!farm) {
    throw new AppError("Farm not found", 404);
  }

  return farm;
}

export async function updateFarm(
  farmId: number,
  userId: number,
  data: UpdateFarmInput
) {
  const farm = await getFarmById(farmId, userId);

  const updatedFarm = await db.orm.public.Farm
  .where({ id: farm.id })
  .update({
    ...(data.name !== undefined && { name: data.name }),
    ...(data.location !== undefined && { location: data.location }),
    ...(data.cropType !== undefined && { cropType: data.cropType }),
    ...(data.area !== undefined && { area: data.area }),
  });
  return updatedFarm;
}

export async function deleteFarm(
  farmId: number,
  userId: number
) {
  const farm = await getFarmById(farmId, userId);

  // M2: Guard against foreign key violation when deleting farm with existing scans
  const existingScans = await db.orm.public.Scan
    .where({ farmId: farm.id })
    .all();

  if (existingScans.length > 0) {
    throw new AppError(
      `Cannot delete farm: ${existingScans.length} scan(s) are associated with this farm. Delete or reassign scans first.`,
      409
    );
  }

  try {
    await db.orm.public.Farm
      .where({ id: farm.id })
      .delete();
  } catch (err) {
    if (err instanceof AppError) throw err;
    const msg = err instanceof Error ? err.message : String(err);
    if (
      msg.includes("foreign key") ||
      msg.includes("violates foreign key constraint") ||
      (err as { code?: string })?.code === "23503"
    ) {
      throw new AppError("Cannot delete farm because dependent records exist", 409);
    }
    throw new AppError("Failed to delete farm", 500);
  }

  return farm;
}