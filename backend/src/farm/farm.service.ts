import { AppError } from "../common/AppError.js";
import type {
  CreateFarmInput,
  UpdateFarmInput,
} from "./farm.schema.js";

type Farm = {
  id: number;
  userId: number;
  name: string;
  location: string;
  cropType: string;
  area: number;
  createdAt: Date;
  updatedAt: Date;
};

const farms: Farm[] = [];
let nextFarmId = 1;

export async function createFarm(
  userId: number,
  data: CreateFarmInput
) {
  const now = new Date();

  const farm: Farm = {
    id: nextFarmId++,
    userId,
    name: data.name,
    location: data.location,
    cropType: data.cropType,
    area: data.area,
    createdAt: now,
    updatedAt: now,
  };

  farms.push(farm);

  return farm;
}

export async function getFarmsByUserId(userId: number) {
  return farms.filter((farm) => farm.userId === userId);
}

export async function getFarmById(
  farmId: number,
  userId: number
) {
  const farm = farms.find(
    (farm) => farm.id === farmId && farm.userId === userId
  );

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

  Object.assign(farm, data);
  farm.updatedAt = new Date();

  return farm;
}

export async function deleteFarm(
  farmId: number,
  userId: number
) {
  const farm = await getFarmById(farmId, userId);

  const index = farms.findIndex((item) => item.id === farm.id);

  farms.splice(index, 1);

  return farm;
}