import { db } from "../prisma/db.js";
import { AppError } from "../common/AppError.js";

/**
 * Creates a new scan record in the database.
 *
 * The scan is stored with status PENDING immediately.
 * To run ML inference, the client must call POST /api/v1/scans/:id/diagnosis
 * after receiving the scan ID from this endpoint.
 */
export async function createScan(
  userId: number,
  farmId: number,
  imageUrl: string,
  cropName?: string,
  latitude?: number,
  longitude?: number
) {
  // Verify the farm exists and belongs to the authenticated user
  const farm = await db.orm.public.Farm
    .where({
      id: farmId,
      userId,
    })
    .first();

  if (!farm) {
    throw new AppError("Farm not found", 404);
  }

  // Create the scan record — status starts as PENDING
  const scan = await db.orm.public.Scan.create({
    farmId,
    imageUrl,
    cropName: cropName ?? "Auto",
    ...(latitude !== undefined && { latitude }),
    ...(longitude !== undefined && { longitude }),
  });

  return {
    id: scan.id,
    farmId: scan.farmId,
    imageUrl: scan.imageUrl,
    cropName: scan.cropName,
    latitude: scan.latitude,
    longitude: scan.longitude,
    status: scan.status,
    createdAt: scan.createdAt,
  };
}

export async function getScanById(
  scanId: number,
  userId: number
) {
  const scan = await db.orm.public.Scan
    .where({ id: scanId })
    .first();

  if (!scan) {
    throw new AppError("Scan not found", 404);
  }

  // Authorization: verify the scan belongs to a farm owned by the requesting user
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
    cropName: scan.cropName,
    latitude: scan.latitude,
    longitude: scan.longitude,
    status: scan.status,
    createdAt: scan.createdAt,
  };
}

export async function getScansByUser(userId: number) {
  const farms = await db.orm.public.Farm
    .where({ userId })
    .all();

  const scans: NonNullable<Awaited<ReturnType<typeof db.orm.public.Scan.first>>>[] = [];

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
    cropName: scan.cropName,
    latitude: scan.latitude,
    longitude: scan.longitude,
    status: scan.status,
    createdAt: scan.createdAt,
  }));
}
