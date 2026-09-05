import { db } from "../prisma/db.js";
import { AppError } from "../common/AppError.js";

export async function createScan(
  userId: number,
  farmId: number,
  imageUrl: string
) {

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

export async function getScanById(scanId: number) {
  const scan = await db.orm.public.Scan
    .where({ id: scanId })
    .first();

  if (!scan) {
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

export async function getScansByUser(_userId: number) {
  // User → Farm → Scan ownership filtering will be added
  // when the Farm model is merged.
  return [];
}

