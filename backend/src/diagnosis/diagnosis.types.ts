import type { RecommendationResult } from "../recommendation/recommendation.types.js";

export type Severity = "none" | "mild" | "moderate" | "severe";

export interface DiagnosisRequest {
  scanId: number;
  imageUrl: string;
}

export interface DiagnosisResult {
  scanId: number;
  imageUrl: string;
  disease: string;
  confidence: number;
  severity: Severity;
  recommendation: RecommendationResult;
  provider: string;
}

export interface DiagnosisProvider {
  diagnose(input: DiagnosisRequest): Promise<DiagnosisResult>;
}
