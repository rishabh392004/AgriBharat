import { db } from "../prisma/db.js";
import { AppError } from "../common/AppError.js";


export async function createScan(
  userId: number,
  farmId: number,
  imageUrl: string
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

  const scan = await db.orm.public.Scan.create({
    farmId,
    imageUrl,
  });

  return {
    id: scan.id,
    farmId: scan.farmId,
    imageUrl: scan.imageUrl,
    status: scan.status,
    createdAt: scan.createdAt,
  };
}

export async function getScanById(
  scanId: number,
  userId: number
){
  const scan = await db.orm.public.Scan
  .where({ id: scanId })
  .first();

if (!scan) {
  throw new AppError("Scan not found", 404);
}

const farm = await db.orm.public.Farm
  .where({
    id: scan.farmId,
    userId,
  })
  .first();

   if (!farm) {
    throw new AppError("Scan not found", 404);
   }

  return {
    id: scan.id,
    farmId: scan.farmId,
    imageUrl: scan.imageUrl,
    status: scan.status,
    createdAt: scan.createdAt,
  };
}

export async function getScansByUser(userId: number) {
  const farms = await db.orm.public.Farm
    .where({ userId })
    .all();

  // BUG FIX: explicit type to avoid `never[]` inference
  const scans: Awaited<ReturnType<typeof db.orm.public.Scan.where>>["0"][] = [];

  for (const farm of farms) {
    const farmScans = await db.orm.public.Scan
      .where({ farmId: farm.id })
      .all();

    scans.push(...farmScans);
  }

  return scans.map((scan) => ({
    id: scan.id,
    farmId: scan.farmId,
    imageUrl: scan.imageUrl,
    status: scan.status,
    createdAt: scan.createdAt,
  }));
}

