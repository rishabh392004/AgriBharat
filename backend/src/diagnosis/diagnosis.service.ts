import { AppError } from "../common/AppError.js";
import { db } from "../prisma/db.js";
import { getDiagnosisProvider } from "./diagnosis.provider.js";
import type { DiagnosisResult } from "./diagnosis.types.js";

async function setScanStatus(
  scanId: number,
  status: "PROCESSING" | "COMPLETED" | "FAILED"
) {
  await db.orm.public.Scan.where({ id: scanId }).update({
    status,
  });
}

export async function diagnoseScan(
  scanId: number,
  userId: number
 ): Promise<DiagnosisResult> {
  const scan = await db.orm.public.Scan.where({ id: scanId }).first();

  if (!scan) {
    throw new AppError("Scan not found", 404);
  }

  if (scan.status === "PROCESSING") {
  throw new AppError("Diagnosis already in progress", 409);
  }

  if (scan.status === "COMPLETED") {
  throw new AppError("Diagnosis already completed", 409);
  } 

  await setScanStatus(scanId, "PROCESSING");

  const provider = getDiagnosisProvider();

  try {
    const result = await provider.diagnose({
      scanId: scan.id,
      imageUrl: scan.imageUrl,
    });

    await setScanStatus(scanId, "COMPLETED");

    return result;
  } catch (error) {
    await setScanStatus(scanId, "FAILED");

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Diagnosis failed", 502);
  }
}
