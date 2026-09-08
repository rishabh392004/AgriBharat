import { AppError } from "../common/AppError.js";
import { getRecommendation } from "../recommendation/recommendation.service.js";
import type {
  DiagnosisProvider,
  DiagnosisRequest,
  DiagnosisResult,
  Severity,
} from "./diagnosis.types.js";

const MOCK_PROVIDER_NAME = "mock";
const ML_PROVIDER_NAME = "resnet34-fastapi";
const ML_SERVICE_URL = process.env.ML_SERVICE_URL ?? "http://localhost:8000";

const MOCK_DISEASES = ["Leaf Rust", "Powdery Mildew", "Early Blight", "Stem Borer", "Healthy"] as const;

function deterministicHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash;
}

function mockDiagnosis(imageUrl: string): DiagnosisResult {
  const hash = deterministicHash(imageUrl);
  const disease = MOCK_DISEASES[hash % MOCK_DISEASES.length]!;
  const confidence = Number((0.70 + (hash % 26) / 100).toFixed(2));
  const severity: Severity = confidence >= 0.9 ? "severe" : confidence >= 0.8 ? "moderate" : "mild";
  return {
    scanId: 0,
    imageUrl,
    disease,
    confidence,
    severity,
    recommendation: getRecommendation(disease),
    provider: MOCK_PROVIDER_NAME,
  };
}

interface MlResponse {
  status: "success";
  predicted_disease: string;
  confidence: number;
  severity_analysis: {
    affected_leaf_area_percent?: number;
    foliar_damage_percent?: number;
    infection_stage?: string;
    recommended_urgency?: string;
  };
  flag_officer_review: boolean;
  top_3_predictions: Array<{ class: string; confidence: number }>;
}

function toSeverity(ml: MlResponse): Severity {
  const damage = ml.severity_analysis.foliar_damage_percent ?? ml.severity_analysis.affected_leaf_area_percent ?? 0;
  if (damage >= 50 || ml.severity_analysis.recommended_urgency === "CRITICAL") return "severe";
  if (damage >= 25) return "moderate";
  if (damage > 0) return "mild";
  return "none";
}

function isValidMlResponse(value: unknown): value is MlResponse {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return v.status === "success" && typeof v.predicted_disease === "string" &&
    typeof v.confidence === "number" && Number.isFinite(v.confidence) &&
    v.confidence >= 0 && v.confidence <= 1 && typeof v.severity_analysis === "object" &&
    Array.isArray(v.top_3_predictions) && typeof v.flag_officer_review === "boolean";
}

async function realMlProvider(input: DiagnosisRequest): Promise<DiagnosisResult> {
  let imageResponse: Response;
  try {
    imageResponse = await fetch(input.imageUrl, { signal: AbortSignal.timeout(10_000) });
  } catch {
    throw new AppError("Unable to download scan image", 502);
  }

  if (!imageResponse.ok || !imageResponse.body) throw new AppError("Unable to download scan image", 502);

  const contentType = imageResponse.headers.get("content-type")?.split(";", 1)[0] ?? "";
  if (!contentType.startsWith("image/")) throw new AppError("Scan image URL is not an image", 400);

  const bytes = new Uint8Array(await imageResponse.arrayBuffer());
  if (bytes.byteLength === 0 || bytes.byteLength > 10 * 1024 * 1024) {
    throw new AppError("Scan image must be between 1 byte and 10 MB", 400);
  }

  const form = new FormData();
  form.append("image", new Blob([bytes.buffer as ArrayBuffer], { type: contentType }), "scan-image");

  let mlResponse: Response;
  try {
    mlResponse = await fetch(`${ML_SERVICE_URL.replace(/\/$/, "")}/predict`, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    throw new AppError("ML service unavailable", 502);
  }

  if (!mlResponse.ok) throw new AppError("ML service returned an error", 502);

  let payload: unknown;
  try {
    payload = await mlResponse.json();
  } catch {
    throw new AppError("ML service returned invalid JSON", 502);
  }
  if (!isValidMlResponse(payload)) throw new AppError("ML service returned an invalid diagnosis", 502);

  return {
    scanId: input.scanId,
    imageUrl: input.imageUrl,
    disease: payload.predicted_disease,
    confidence: payload.confidence,
    severity: toSeverity(payload),
    recommendation: getRecommendation(payload.predicted_disease),
    provider: ML_PROVIDER_NAME,
  };
}

export async function diagnoseWithProvider(input: DiagnosisRequest): Promise<DiagnosisResult> {
  if (process.env.ML_SERVICE_URL) return realMlProvider(input);
  const result = mockDiagnosis(input.imageUrl);
  return { ...result, scanId: input.scanId };
}

export function getDiagnosisProvider(): DiagnosisProvider {
  return { diagnose: diagnoseWithProvider };
}
