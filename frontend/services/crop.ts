import type { Prediction } from '@/types'

const predictions: Record<string, Prediction> = {
  Wheat: { scanId: 'SCAN123', crop: 'Wheat', disease: 'Leaf Rust', confidence: 94, severity: 'Moderate', riskLevel: 'High', symptoms: ['Orange/brown spots on leaves', 'Leaf discoloration', 'Rust-like lesions'], recommendations: ['Remove severely infected leaves.', 'Monitor nearby plants daily.', 'Follow treatment guidance from a local agriculture expert.', 'Re-scan the crop after treatment.'] },
  Rice: { scanId: 'SCAN-RICE', crop: 'Rice', disease: 'Brown Spot', confidence: 91, severity: 'Moderate', riskLevel: 'Medium', symptoms: ['Oval brown lesions', 'Dry leaf tips'], recommendations: ['Improve field drainage.', 'Use balanced fertilizer.', 'Ask a local expert before applying treatment.'] },
  Tomato: { scanId: 'SCAN-TOMATO', crop: 'Tomato', disease: 'Early Blight', confidence: 93, severity: 'Moderate', riskLevel: 'High', symptoms: ['Concentric leaf spots', 'Lower leaf yellowing'], recommendations: ['Remove affected leaves.', 'Keep foliage dry and improve airflow.', 'Re-scan after treatment.'] },
  Cotton: { scanId: 'SCAN-COTTON', crop: 'Cotton', disease: 'Bacterial Blight', confidence: 89, severity: 'Mild', riskLevel: 'Medium', symptoms: ['Angular water-soaked spots', 'Leaf edge browning'], recommendations: ['Isolate affected plants.', 'Avoid overhead irrigation.', 'Contact an agriculture expert.'] },
}

export async function predictCrop(_image: File | Blob, crop = 'Wheat') {
  await new Promise((resolve) => setTimeout(resolve, 1400))
  return predictions[crop] ?? predictions.Wheat
}
