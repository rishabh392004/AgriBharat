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


import { getDiagnosisProvider } from "../diagnosis/diagnosis.provider.js";

export async function createScan(
  userId: number,
  farmId: number | undefined,
  imageUrl: string,
  cropName?: string
) {
  let targetFarmId = farmId;
  if (!targetFarmId) {
    const existing = await db.orm.public.Farm.where({ userId }).first();
    if (existing) {
      targetFarmId = existing.id;
    } else {
      const newFarm = await db.orm.public.Farm.create({
        userId,
        name: "Main Farm",
        location: "Nashik, Maharashtra",
        cropType: cropName || "Wheat",
        area: 2.5,
      });
      targetFarmId = newFarm.id;
    }
  }

  const farm = await db.orm.public.Farm
    .where({
      id: targetFarmId,
      userId,
    })
    .first();

  if (!farm) {
    throw new AppError("Farm not found", 404);
  }

  // 1. Save the scan record first
  const scan = await db.orm.public.Scan.create({
    farmId: targetFarmId,
    imageUrl,
  });

  // 2. Call ML service asynchronously — don't block the response
  callMlModel(imageUrl).then(async (prediction) => {
    if (!prediction) return;

    // 3. Store the ML diagnosis result linked to this scan
    await db.orm.public.DiseaseResult.create({
      scanId: scan.id,
      disease: prediction.predicted_disease,
      confidence: prediction.confidence,
      severity: prediction.severity_analysis.infection_stage || "moderate",
      actions: JSON.stringify([prediction.severity_analysis.action_plan]),
      precautions: JSON.stringify([]),
      provider: "ML-Local-ResNet34",
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

export async function analyzeScanService(params: {
  imageUrl: string;
  cropName?: string | undefined;
  latitude?: number | undefined;
  longitude?: number | undefined;
  userId?: number | undefined;
  farmId?: number | undefined;
}) {
  let scanRecordId = Math.floor(10000 + Math.random() * 90000);
  let persisted = false;

  if (params.userId) {
    try {
      let targetFarmId = params.farmId;
      if (!targetFarmId) {
        const existingFarm = await db.orm.public.Farm.where({ userId: params.userId }).first();
        if (existingFarm) {
          targetFarmId = existingFarm.id;
        } else {
          const newFarm = await db.orm.public.Farm.create({
            userId: params.userId,
            name: "Main Farm",
            location: "Nashik, Maharashtra",
            cropType: params.cropName || "Wheat",
            area: 2.0,
          });
          targetFarmId = newFarm.id;
        }
      }

      if (targetFarmId) {
        const scan = await db.orm.public.Scan.create({
          farmId: targetFarmId,
          imageUrl: params.imageUrl.length > 300 ? params.imageUrl.slice(0, 300) : params.imageUrl,
          status: "PROCESSING",
        });
        scanRecordId = scan.id;
        persisted = true;
      }
    } catch (dbErr) {
      console.warn("[ScanService] Could not persist scan record in PostgreSQL:", dbErr);
    }
  }

  const provider = getDiagnosisProvider();
  const diagnosis = await provider.diagnose({
    scanId: scanRecordId,
    imageUrl: params.imageUrl,
    cropName: params.cropName,
    latitude: params.latitude,
    longitude: params.longitude,
  });

  if (persisted) {
    try {
      await db.orm.public.Scan.where({ id: scanRecordId }).update({
        status: "COMPLETED",
      });
      await db.orm.public.DiseaseResult.create({
        scanId: scanRecordId,
        disease: diagnosis.disease,
        confidence: diagnosis.confidence,
        severity: diagnosis.severity,
        actions: JSON.stringify(diagnosis.recommendation?.actions || []),
        precautions: JSON.stringify(diagnosis.recommendation?.precautions || []),
        provider: diagnosis.provider,
      });
    } catch (saveErr) {
      console.warn("[ScanService] Could not save disease result in DB:", saveErr);
    }
  }

  return diagnosis;
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

export async function getScansByUser(userId: number, role?: string) {
  if (role?.toUpperCase() === "OFFICER") {
    const allScans = await db.orm.public.Scan.all();
    return allScans.map((scan) => ({
      id: scan.id,
      farmId: scan.farmId,
      imageUrl: scan.imageUrl,
      status: scan.status,
      createdAt: scan.createdAt,
    }));
  }

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
    status: scan.status,
    createdAt: scan.createdAt,
  }));
}

