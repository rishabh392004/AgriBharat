import { db } from "../prisma/db.js";
import { AppError } from "../common/AppError.js";

export async function createScan(
  userId: number,
  farmId: number,
  imageUrl: string
) {
  // Farm ownership will be verified once the Farm model is merged.
  // For now, create the scan against the supplied farmId.

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

export async function updateScanStatus(
  scanId: number,
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
) {
  const scan = await db.orm.public.Scan
    .where({ id: scanId })
    .first();

  if (!scan) {
    throw new AppError("Scan not found", 404);
  }

  await db.orm.public.Scan
    .where({ id: scanId })
    .update({
      status,
      updatedAt: new Date().toISOString(),
    });

  const updatedScan = await db.orm.public.Scan
    .where({ id: scanId })
    .first();

  return {
    id: updatedScan!.id,
    farmId: updatedScan!.farmId,
    imageUrl: updatedScan!.imageUrl,
    status: updatedScan!.status,
    createdAt: updatedScan!.createdAt,
  };
}
export async function getScansByUser(_userId: number) {
  // User → Farm → Scan ownership filtering will be added
  // when the Farm model is merged.
  return [];
}

