export interface DiagnosisRequest {
  scanId: number;
  imageUrl: string;
}

export interface DiagnosisResult {
  scanId: number;
  imageUrl: string;
  disease: string;
  confidence: number;
  recommendation: string;
  provider: string;
}

export interface DiagnosisProvider {
  diagnose(input: DiagnosisRequest): Promise<DiagnosisResult>;
}
