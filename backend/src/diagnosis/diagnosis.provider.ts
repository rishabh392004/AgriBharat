import { z } from "zod";
import { FormData, Blob } from "formdata-node";

import { AppError } from "../common/AppError.js";
import { env } from "../config/env.js";
import { getRecommendation } from "../recommendation/recommendation.service.js";
import type {
  DiagnosisProvider,
  DiagnosisRequest,
  DiagnosisResult,
  Severity,
  WeatherContext,
} from "./diagnosis.types.js";

// ── Mock Provider (kept for unit tests) ──────────────────────────────────────

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

function deterministicDisease(imageUrl: string): string {
  return MOCK_DISEASES[deterministicHash(imageUrl) % MOCK_DISEASES.length] ?? "Healthy";
}

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
      flagOfficerReview: false,
      foliarDamagePercent: 0,
      urgency: "LOW",
      etlStatus: "",
      top3Predictions: [{ class: disease, confidence }],
      weatherContext: {
        temperature_celsius: 29,
        humidity_percent: 78,
        pest_outbreak_risk: "LOW_MONITORING_RISK",
        climate_pest_forecast: "Mock data — no real weather context.",
      },
    };
  },
};

// ── Real ML Provider ──────────────────────────────────────────────────────────

/**
 * Zod schema for the actual FastAPI /predict response.
 * All fields validated so we never trust arbitrary ML output blindly.
 */
const mlSeverityAnalysisSchema = z.object({
  foliar_damage_percent: z.number().default(0),
  affected_leaf_area_percent: z.number().default(0),
  economic_threshold_status: z.string().default(""),
  etl_badge_color: z.string().default("Green"),
  recommended_urgency: z.string().default("LOW"),
  action_plan: z.string().default(""),
});

const mlWeatherContextSchema = z.object({
  temperature_celsius: z.number().default(29),
  humidity_percent: z.number().default(78),
  pest_outbreak_risk: z.string().default("LOW_MONITORING_RISK"),
  climate_pest_forecast: z.string().default(""),
});

const mlPredictionEntrySchema = z.object({
  class: z.string(),
  confidence: z.number(),
});

const mlRecommendedSolutionSchema = z
  .object({
    vernacular_name: z.string().optional(),
    pest_vector: z.string().optional(),
    biological_control: z.string().optional(),
    chemical_control: z.string().optional(),
    mechanical_control: z.string().optional(),
  })
  .passthrough()
  .optional();

const mlResponseSchema = z.object({
  status: z.string(),
  predicted_disease: z.string(),
  confidence: z.number().min(0).max(1),
  foliar_damage_percent: z.number().default(0),
  economic_threshold_status: z.string().default(""),
  etl_badge_color: z.string().default("Green"),
  pest_outbreak_risk: z.string().default("LOW_MONITORING_RISK"),
  severity_analysis: mlSeverityAnalysisSchema,
  weather_context: mlWeatherContextSchema,
  top_predictions: z.array(mlPredictionEntrySchema).default([]),
  explainability: z
    .object({
      method: z.string().optional(),
      target_layer: z.string().optional(),
      heatmap_base64: z.string().optional(),
    })
    .optional(),
  recommended_solution: mlRecommendedSolutionSchema,
  pest_vector_profile: mlRecommendedSolutionSchema,
});

type MlResponse = z.infer<typeof mlResponseSchema>;

/**
 * Maps ML recommended_urgency/etl to our Severity type.
 * "CRITICAL" → "severe", "MEDIUM" → "moderate", "LOW" → "mild"
 */
function urgencyToSeverity(urgency: string): Severity {
  const u = urgency.toUpperCase();
  if (u === "CRITICAL") return "severe";
  if (u === "MEDIUM") return "moderate";
  if (u === "LOW") return "mild";
  return "none";
}

/**
 * Determines officer-review flag from ML response.
 * Flag is set when confidence < 0.78 OR urgency is CRITICAL OR
 * etl_badge_color is Red — because these conditions warrant human oversight.
 */
function shouldFlagOfficerReview(ml: MlResponse): boolean {
  if (ml.confidence < 0.78) return true;
  if (ml.severity_analysis.recommended_urgency === "CRITICAL") return true;
  if (ml.severity_analysis.etl_badge_color === "Red") return true;
  return false;
}

/**
 * Builds structured Recommendation from ML advisory output.
 * Falls back to knowledge-base recommendation if ML advisory is missing.
 */
function buildRecommendation(
  predictedDisease: string,
  mlRecommendation?: MlResponse["recommended_solution"]
) {
  if (mlRecommendation) {
    const actions: string[] = [];
    const precautions: string[] = [];

    if (mlRecommendation.biological_control) {
      actions.push(`Biological control: ${mlRecommendation.biological_control}`);
    }
    if (mlRecommendation.chemical_control) {
      actions.push(`Chemical control: ${mlRecommendation.chemical_control}`);
    }
    if (mlRecommendation.mechanical_control) {
      precautions.push(`Mechanical/cultural: ${mlRecommendation.mechanical_control}`);
    }
    if (mlRecommendation.pest_vector) {
      precautions.push(`Primary pest vector: ${mlRecommendation.pest_vector}`);
    }

    if (actions.length > 0 || precautions.length > 0) {
      return { actions, precautions };
    }
  }

  // Fallback to static knowledge base
  return getRecommendation(predictedDisease);
}

export const realMlProvider: DiagnosisProvider = {
  async diagnose(input: DiagnosisRequest): Promise<DiagnosisResult> {
    const mlUrl = env.ML_SERVICE_URL;
    const timeoutMs = env.ML_TIMEOUT_MS;

    // --- Step 1: Download the image from its URL ---
    let imageBuffer: ArrayBuffer;
    try {
      const controller = new AbortController();
      const downloadTimer = setTimeout(() => controller.abort(), timeoutMs);

      const imageRes = await fetch(input.imageUrl, {
        signal: controller.signal,
      });
      clearTimeout(downloadTimer);

      if (!imageRes.ok) {
        throw new AppError(
          `Image download failed (HTTP ${imageRes.status}): ${input.imageUrl}`,
          502
        );
      }
      imageBuffer = await imageRes.arrayBuffer();
    } catch (err) {
      if (err instanceof AppError) throw err;
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[ML Provider] Image download error:", msg);
      throw new AppError("Could not download image for ML analysis", 502);
    }

    // --- Step 2: Build multipart form and POST to ML service ---
    const form = new FormData();
    form.set(
      "image",
      new Blob([imageBuffer], { type: "image/jpeg" }),
      "scan.jpg"
    );
    form.set("crop_name", input.cropName ?? "Auto");
    form.set("latitude", String(input.latitude ?? 19.9975));
    form.set("longitude", String(input.longitude ?? 73.7898));

    const controller = new AbortController();
    const mlTimer = setTimeout(() => controller.abort(), timeoutMs);

    let rawJson: unknown;
    try {
      const mlRes = await fetch(`${mlUrl}/predict`, {
        method: "POST",
        body: form as unknown as BodyInit,
        signal: controller.signal,
      });
      clearTimeout(mlTimer);

      if (!mlRes.ok) {
        let detail = "";
        try {
          const body = (await mlRes.json()) as { detail?: string };
          detail = body.detail ?? "";
        } catch {
          // ignore parse error on error body
        }
        console.error(`[ML Provider] FastAPI returned HTTP ${mlRes.status}: ${detail}`);
        throw new AppError(
          `ML service returned an error (HTTP ${mlRes.status})`,
          502
        );
      }

      rawJson = await mlRes.json();
    } catch (err) {
      clearTimeout(mlTimer);
      if (err instanceof AppError) throw err;

      const isAbort =
        err instanceof Error && err.name === "AbortError";
      if (isAbort) {
        console.error("[ML Provider] Request timed out after", timeoutMs, "ms");
        throw new AppError("ML service timed out", 504);
      }

      const msg = err instanceof Error ? err.message : String(err);
      console.error("[ML Provider] ML service call failed:", msg);
      throw new AppError("ML service is unavailable", 502);
    }

    // --- Step 3: Validate ML response with Zod ---
    const parseResult = mlResponseSchema.safeParse(rawJson);
    if (!parseResult.success) {
      console.error(
        "[ML Provider] Unexpected ML response structure:",
        parseResult.error.flatten()
      );
      throw new AppError("ML service returned an unexpected response format", 502);
    }

    const ml = parseResult.data;

    // Reject responses where ML itself flagged an error
    if (ml.status !== "success") {
      console.error("[ML Provider] ML response status is not 'success':", ml.status);
      throw new AppError("ML inference did not complete successfully", 502);
    }

    // --- Step 4: Map ML response to DiagnosisResult ---
    const severity = urgencyToSeverity(ml.severity_analysis.recommended_urgency);
    const flagOfficerReview = shouldFlagOfficerReview(ml);
    const recommendation = buildRecommendation(
      ml.predicted_disease,
      ml.recommended_solution ?? ml.pest_vector_profile
    );

    const weatherContext: WeatherContext = {
      temperature_celsius: ml.weather_context.temperature_celsius,
      humidity_percent: ml.weather_context.humidity_percent,
      pest_outbreak_risk: ml.weather_context.pest_outbreak_risk,
      climate_pest_forecast: ml.weather_context.climate_pest_forecast,
    };

    const gradCamBase64 = ml.explainability?.heatmap_base64;

    console.info(
      `[ML Provider] Scan ${input.scanId}: disease="${ml.predicted_disease}" ` +
        `confidence=${ml.confidence.toFixed(3)} urgency=${ml.severity_analysis.recommended_urgency} ` +
        `flag_officer=${flagOfficerReview}`
    );

    return {
      scanId: input.scanId,
      imageUrl: input.imageUrl,
      disease: ml.predicted_disease,
      confidence: ml.confidence,
      severity,
      recommendation,
      provider: "ResNet34-FastAPI",
      flagOfficerReview,
      foliarDamagePercent: ml.severity_analysis.foliar_damage_percent,
      urgency: ml.severity_analysis.recommended_urgency,
      etlStatus: ml.severity_analysis.economic_threshold_status,
      top3Predictions: ml.top_predictions,
      weatherContext,
      // exactOptionalPropertyTypes: only spread when defined
      ...(gradCamBase64 !== undefined && { gradCamBase64 }),
    };
  },
};

// ── Provider Selection ────────────────────────────────────────────────────────

/**
 * Returns the appropriate diagnosis provider based on environment.
 * The real provider is always used when ML_SERVICE_URL is configured.
 * Tests override this via vi.mock("./diagnosis.provider.js").
 */
export function getDiagnosisProvider(): DiagnosisProvider {
  return realMlProvider;
}
