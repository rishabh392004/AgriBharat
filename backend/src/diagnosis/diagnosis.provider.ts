import { AppError } from "../common/AppError.js";
import { getRecommendation } from "../recommendation/recommendation.service.js";
import type {
  DiagnosisProvider,
  DiagnosisRequest,
  DiagnosisResult,
  Severity,
} from "./diagnosis.types.js";

const MOCK_PROVIDER_NAME = "mock";

/** Image URLs containing this token make the mock provider fail deterministically. */
export const MOCK_DIAGNOSIS_FAILURE_TOKEN = "__diagnosis_fail";

/** All diseases the mock provider can return — covers the full knowledge base. */
const MOCK_DISEASES = [
  "Leaf Rust",
  "Powdery Mildew",
  "Early Blight",
  "Stem Borer",
  "Healthy",
] as const;

function deterministicHash(imageUrl: string): number {
  let hash = 0;
  for (let i = 0; i < imageUrl.length; i += 1) {
    hash = (hash * 31 + imageUrl.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Pick a disease deterministically from the image URL — same URL always gives same disease. */
function deterministicDisease(imageUrl: string): string {
  return MOCK_DISEASES[deterministicHash(imageUrl) % MOCK_DISEASES.length] ?? "Healthy";
}

/** Range: 0.70 – 0.95 (realistic confidence band). */
function deterministicConfidence(imageUrl: string): number {
  return Number((0.70 + (deterministicHash(imageUrl) % 26) / 100).toFixed(2));
}

function confidenceToSeverity(confidence: number): Severity {
  if (confidence >= 0.9) return "severe";
  if (confidence >= 0.8) return "moderate";
  if (confidence >= 0.7) return "mild";
  return "none";
}

export const mockDiagnosisProvider: DiagnosisProvider = {
  async diagnose(input: DiagnosisRequest): Promise<DiagnosisResult> {
    if (input.imageUrl.includes(MOCK_DIAGNOSIS_FAILURE_TOKEN)) {
      throw new AppError("Diagnosis provider failed", 502);
    }

    // Simulate realistic ML processing time
    await new Promise((resolve) => setTimeout(resolve, 800));

    const disease = deterministicDisease(input.imageUrl);
    const confidence = deterministicConfidence(input.imageUrl);
    const severity = confidenceToSeverity(confidence);
    const recommendation = getRecommendation(disease);

    return {
      scanId: input.scanId,
      imageUrl: input.imageUrl,
      disease,
      confidence,
      severity,
      recommendation,
      provider: MOCK_PROVIDER_NAME,
    };
  },
};

/**
 * Real ML Diagnosis Provider that calls the Python FastAPI ResNet-34 service
 * at ML_SERVICE_URL (or ML_API_URL) /predict with multipart image data.
 * Gracefully falls back to mockDiagnosisProvider if the Python service is offline.
 */
export const realMlDiagnosisProvider: DiagnosisProvider = {
  async diagnose(input: DiagnosisRequest): Promise<DiagnosisResult> {
    if (input.imageUrl.includes(MOCK_DIAGNOSIS_FAILURE_TOKEN)) {
      throw new AppError("Diagnosis provider failed", 502);
    }

    const mlBaseUrl =
      process.env.ML_SERVICE_URL ||
      process.env.ML_API_URL ||
      "http://localhost:8000";

    try {
      // 1. Obtain image blob / buffer
      let imageBlob: Blob;

      if (input.imageUrl.startsWith("data:")) {
        // Base64 Data URL
        const commaIdx = input.imageUrl.indexOf(",");
        const base64Data = input.imageUrl.slice(commaIdx + 1);
        const mimeMatch = input.imageUrl.match(/data:([^;]+);/);
        const mime: string = (mimeMatch && mimeMatch[1]) ? mimeMatch[1] : "image/jpeg";
        const buffer = Buffer.from(base64Data, "base64");
        imageBlob = new Blob([buffer], { type: mime });
      } else if (
        input.imageUrl.startsWith("http://") ||
        input.imageUrl.startsWith("https://")
      ) {
        // Remote image URL
        const imgRes = await fetch(input.imageUrl, {
          signal: AbortSignal.timeout(6000),
        });
        if (!imgRes.ok) {
          throw new Error(`Failed to fetch scan image from ${input.imageUrl}: status ${imgRes.status}`);
        }
        const arrayBuffer = await imgRes.arrayBuffer();
        imageBlob = new Blob([arrayBuffer], {
          type: imgRes.headers.get("content-type") || "image/jpeg",
        });
      } else {
        // Mock token or relative path — create a tiny valid 1x1 JPEG blob
        const dummyJpeg = Buffer.from(
          "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=",
          "base64"
        );
        imageBlob = new Blob([dummyJpeg], { type: "image/jpeg" });
      }

      // 2. Build multipart form data
      const formData = new FormData();
      formData.append("image", imageBlob, "scan.jpg");
      formData.append("crop_name", input.cropName || "Auto");
      formData.append("latitude", String(input.latitude ?? 19.9975));
      formData.append("longitude", String(input.longitude ?? 73.7898));

      // 3. Post to ML inference service
      const res = await fetch(`${mlBaseUrl}/predict`, {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(12000),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        throw new Error(
          `ML inference service returned HTTP ${res.status}: ${errorText}`
        );
      }

      const data = (await res.json()) as {
        status?: string;
        predicted_disease?: string;
        confidence?: number;
        economic_threshold_status?: string;
        etl_badge_color?: string;
        foliar_damage_percent?: number;
        pest_outbreak_risk?: string;
        explainability?: {
          method?: string;
          target_layer?: string;
          heatmap_base64?: string;
        };
        recommended_solution?: {
          chemical_control?: string;
          biological_control?: string;
          mechanical_control?: string;
          pest_vector?: string;
        };
      };

      const rawDisease = data.predicted_disease || "Healthy";
      const cleanDisease = rawDisease.replace(/___/g, " - ").replace(/_/g, " ");
      const confidence =
        typeof data.confidence === "number" ? data.confidence : 0.85;

      let severity: Severity = "moderate";
      if (
        confidence >= 0.9 ||
        data.economic_threshold_status?.includes("Breached")
      ) {
        severity = "severe";
      } else if (
        confidence >= 0.8 ||
        data.economic_threshold_status?.includes("Approaching")
      ) {
        severity = "moderate";
      } else if (confidence >= 0.6) {
        severity = "mild";
      } else {
        severity = "none";
      }

      const sol = data.recommended_solution || {};
      const actions = [
        sol.chemical_control,
        sol.biological_control,
        sol.mechanical_control,
      ].filter(Boolean) as string[];

      const rec =
        actions.length > 0
          ? {
              actions,
              precautions: [
                sol.pest_vector || "Inspect leaf undersides every 4 days.",
                "Maintain optimal field drainage and sanitize pruning shears.",
              ],
            }
          : getRecommendation(cleanDisease);

      return {
        scanId: input.scanId,
        imageUrl: input.imageUrl,
        disease: cleanDisease,
        confidence,
        severity,
        recommendation: rec,
        provider: "resnet34-fastapi",
        foliarDamagePercent: data.foliar_damage_percent,
        economicThresholdStatus: data.economic_threshold_status,
        etlBadgeColor: data.etl_badge_color,
        explainability: data.explainability,
        pestOutbreakRisk: data.pest_outbreak_risk,
      };
    } catch (err: any) {
      console.warn(
        `[DiagnosisProvider] Real ML service call to ${mlBaseUrl}/predict failed (${err?.message}). Falling back to mock provider.`
      );
      return mockDiagnosisProvider.diagnose(input);
    }
  },
};

export function getDiagnosisProvider(): DiagnosisProvider {
  // Always use mock provider in unit tests for deterministic testing
  if (process.env.NODE_ENV === "test") {
    return mockDiagnosisProvider;
  }

  // Support both ML_SERVICE_URL (current standard) and legacy ML_API_URL
  const mlServiceUrl =
    process.env.ML_SERVICE_URL || process.env.ML_API_URL;

  if (mlServiceUrl) {
    return realMlDiagnosisProvider;
  }

  return mockDiagnosisProvider;
}

