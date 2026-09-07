import { db } from "../prisma/db.js";
import { AppError } from "../common/AppError.js";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL ?? "http://localhost:8000";

/**
 * Calls the Python FastAPI ML service with an image URL.
 * Downloads the image and posts it as multipart/form-data to /predict.
 */
async function callMlModel(imageUrl: string): Promise<{
  predicted_disease: string;
  confidence: number;
  severity_analysis: {
    affected_leaf_area_percent: number;
    infection_stage: string;
    recommended_urgency: string;
    action_plan: string;
  };
  top_3_predictions: { class: string; confidence: number }[];
  flag_officer_review: boolean;
} | null> {
  try {
    // Download the image from its URL (e.g. from cloud storage)
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) return null;
    const imageBuffer = await imageRes.arrayBuffer();

    // Build multipart form with the image file
    const { FormData, Blob } = await import("formdata-node");
    const form = new FormData();
    form.set("image", new Blob([imageBuffer], { type: "image/jpeg" }), "scan.jpg");

    const mlRes = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: "POST",
      body: form as unknown as BodyInit,
    });

    if (!mlRes.ok) return null;
    return await mlRes.json();
  } catch {
    // ML service unavailable — fail gracefully, scan still saved
    return null;
  }
}


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

  // 1. Save the scan record first
  const scan = await db.orm.public.Scan.create({
    farmId,
    imageUrl,
  });

  // 2. Call ML service asynchronously — don't block the response
  callMlModel(imageUrl).then(async (prediction) => {
    if (!prediction) return;

    // 3. Store the ML diagnosis result linked to this scan
    await db.orm.public.Diagnosis.create({
      scanId: scan.id,
      disease: prediction.predicted_disease,
      confidence: prediction.confidence,
      severityPercent: prediction.severity_analysis.affected_leaf_area_percent,
      infectionStage: prediction.severity_analysis.infection_stage,
      urgency: prediction.severity_analysis.recommended_urgency,
      actionPlan: prediction.severity_analysis.action_plan,
      top3Predictions: JSON.stringify(prediction.top_3_predictions),
      flagReview: prediction.flag_officer_review,
    });
  }).catch(() => { /* silently ignore ML errors */ });

  return {
    id: scan.id,
    farmId: scan.farmId,
    imageUrl: scan.imageUrl,
    status: scan.status,
    createdAt: scan.createdAt,
    mlStatus: "processing", // frontend can poll for diagnosis
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

