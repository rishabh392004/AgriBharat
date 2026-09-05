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

  await db.orm.public.Farm
    .where({ id: farm.id })
    .delete();

  return farm;
}