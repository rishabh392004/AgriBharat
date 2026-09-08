import type { RecommendationResult } from "../recommendation/recommendation.types.js";

export type Severity = "none" | "mild" | "moderate" | "severe";

export interface DiagnosisRequest {
  scanId: number;
  imageUrl: string;
  cropName?: string | undefined;
  latitude?: number | undefined;
  longitude?: number | undefined;
}

export interface DiagnosisResult {
  scanId: number;
  imageUrl: string;
  disease: string;
  confidence: number;
  severity: Severity;
  recommendation: RecommendationResult;
  provider: string;
  foliarDamagePercent?: number | undefined;
  economicThresholdStatus?: string | undefined;
  etlBadgeColor?: string | undefined;
  explainability?: {
    method?: string | undefined;
    target_layer?: string | undefined;
    heatmap_base64?: string | undefined;
  } | undefined;
  pestOutbreakRisk?: string | undefined;
}

export interface DiagnosisProvider {
  diagnose(input: DiagnosisRequest): Promise<DiagnosisResult>;
}
