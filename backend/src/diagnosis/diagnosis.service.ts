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

  // BUG FIX 1: Ownership check MUST come before status checks.
  // Otherwise a user could probe another user's scan status via 409 error codes.
  const farm = await db.orm.public.Farm
    .where({
      id: scan.farmId,
      userId,
    })
    .first();

  if (!farm) {
    throw new AppError("Scan not found", 404);
  }

  if (scan.status === "PROCESSING") {
    throw new AppError("Diagnosis already in progress", 409);
  }

  if (scan.status === "COMPLETED") {
    throw new AppError("Diagnosis already completed", 409);
  }

  if (scan.status === "FAILED") {
    throw new AppError("Previous diagnosis failed. Create a new scan to try again.", 409);
  }

  await setScanStatus(scanId, "PROCESSING");

  const provider = getDiagnosisProvider();

  try {
    const result = await provider.diagnose({
      scanId: scan.id,
      imageUrl: scan.imageUrl,
    });

    // Persist the result to DB
    await db.orm.public.DiseaseResult.create({
      scanId: result.scanId,
      disease: result.disease,
      confidence: result.confidence,
      severity: result.severity,
      actions: JSON.stringify(result.recommendation.actions),
      precautions: JSON.stringify(result.recommendation.precautions),
      provider: result.provider,
    });

    await setScanStatus(scanId, "COMPLETED");

    return result;
  } catch (error) {
    // BUG FIX 2: Only set FAILED if the error came from the provider/DB.
    // AppErrors thrown BEFORE setScanStatus(PROCESSING) should NOT set FAILED
    // (but those are thrown before the try block, so this is actually safe).
    // Re-throw AppError as-is so the real message reaches the client.
    await setScanStatus(scanId, "FAILED");

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Diagnosis failed", 502);
  }
}

export async function getDiagnosis(
  scanId: number,
  userId: number
): Promise<DiagnosisResult> {
  const scan = await db.orm.public.Scan.where({ id: scanId }).first();

  if (!scan) {
    throw new AppError("Scan not found", 404);
  }

  // Ownership check — verify the scan belongs to the requesting user
  const farm = await db.orm.public.Farm
    .where({
      id: scan.farmId,
      userId,
    })
    .first();

  if (!farm) {
    throw new AppError("Scan not found", 404);
  }

  const stored = await db.orm.public.DiseaseResult
    .where({ scanId })
    .first();

  if (!stored) {
    throw new AppError("No diagnosis result found for this scan. Run POST /:id/diagnosis first.", 404);
  }

  return {
    scanId: stored.scanId,
    imageUrl: scan.imageUrl,
    disease: stored.disease,
    confidence: stored.confidence,
    severity: stored.severity as DiagnosisResult["severity"],
    recommendation: {
      actions: JSON.parse(stored.actions),
      precautions: JSON.parse(stored.precautions),
    },
    provider: stored.provider,
  };
}
