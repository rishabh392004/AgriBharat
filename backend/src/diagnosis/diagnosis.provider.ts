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
  return MOCK_DISEASES[deterministicHash(imageUrl) % MOCK_DISEASES.length];
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

export function getDiagnosisProvider(): DiagnosisProvider {
  // When the ML team provides a real endpoint, set ML_API_URL in .env to activate it.
  if (process.env.ML_API_URL) {
    // TODO: return realMlProvider when ML team is ready
    console.warn("ML_API_URL set but real provider not yet implemented — using mock.");
  }
  return mockDiagnosisProvider;
}
