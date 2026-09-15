import type { RecommendationResult } from "../recommendation/recommendation.types.js";

export type Severity = "none" | "mild" | "moderate" | "severe";

export interface DiagnosisRequest {
  scanId: number;
  imageUrl: string;
  cropName?: string;
  latitude?: number;
  longitude?: number;
}

/** Structured weather context returned by ML service */
export interface WeatherContext {
  temperature_celsius: number;
  humidity_percent: number;
  pest_outbreak_risk: string;
  climate_pest_forecast: string;
}

/** Full diagnosis result — maps both mock and real ML provider output */
export interface DiagnosisResult {
  scanId: number;
  imageUrl: string;
  disease: string;
  confidence: number;
  severity: Severity;
  recommendation: RecommendationResult;
  provider: string;

  // Extended ML fields (populated by the real provider; defaults for mock)
  flagOfficerReview: boolean;
  foliarDamagePercent: number;
  urgency: string;
  etlStatus: string;
  top3Predictions: { class: string; confidence: number }[];
  weatherContext: WeatherContext;

  /**
   * Grad-CAM heatmap as a base64-encoded data URI.
   * Transient — returned to the client but NOT stored in PostgreSQL
   * (too large for a DB column; use object storage for persistence).
   */
  gradCamBase64?: string;
}

export interface DiagnosisProvider {
  diagnose(input: DiagnosisRequest): Promise<DiagnosisResult>;
}
