import { AppError } from "../common/AppError.js";
import type {
  DiagnosisProvider,
  DiagnosisRequest,
  DiagnosisResult,
} from "./diagnosis.types.js";

const MOCK_PROVIDER_NAME = "mock";

/** Image URLs containing this token make the mock provider fail deterministically. */
export const MOCK_DIAGNOSIS_FAILURE_TOKEN = "__diagnosis_fail";

function deterministicConfidence(imageUrl: string): number {
  let hash = 0;

  for (let i = 0; i < imageUrl.length; i += 1) {
    hash = (hash * 31 + imageUrl.charCodeAt(i)) >>> 0;
  }

  return Number((0.7 + (hash % 25) / 100).toFixed(2));
}

export const mockDiagnosisProvider: DiagnosisProvider = {
  async diagnose(input: DiagnosisRequest): Promise<DiagnosisResult> {
    if (input.imageUrl.includes(MOCK_DIAGNOSIS_FAILURE_TOKEN)) {
      throw new AppError("Diagnosis provider failed", 502);
    }

    return {
      scanId: input.scanId,
      imageUrl: input.imageUrl,
      disease: "Healthy",
      confidence: deterministicConfidence(input.imageUrl),
      recommendation: "No treatment required. Continue regular crop monitoring.",
      provider: MOCK_PROVIDER_NAME,
    };
  },
};

export function getDiagnosisProvider(): DiagnosisProvider {
  return mockDiagnosisProvider;
}
