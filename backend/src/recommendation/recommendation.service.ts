import type { RecommendationResult } from "./recommendation.types.js";

/**
 * Static knowledge base mapping disease names to structured recommendations.
 * Isolated from scan/diagnosis logic so a real AI/ML service can replace this later.
 */
const diseaseKnowledge: Record<string, RecommendationResult> = {
  "Leaf Rust": {
    actions: [
      "Remove and destroy severely infected leaves immediately.",
      "Apply a registered fungicide (e.g., propiconazole or tebuconazole).",
      "Re-scan the crop 7–10 days after treatment.",
    ],
    precautions: [
      "Avoid overhead irrigation — water at the base of the plant.",
      "Improve air circulation between plants by thinning if needed.",
      "Monitor nearby farms and report high-risk cases to your officer.",
    ],
  },
  "Powdery Mildew": {
    actions: [
      "Apply sulphur-based fungicide as early as possible.",
      "Remove visibly infected plant parts and dispose of them away from the field.",
      "Re-scan after 5–7 days.",
    ],
    precautions: [
      "Avoid excessive nitrogen fertilisation — it promotes lush growth susceptible to mildew.",
      "Plant resistant varieties in the next season.",
      "Keep field edges clear of weeds that can harbour the spores.",
    ],
  },
  "Early Blight": {
    actions: [
      "Apply chlorothalonil or mancozeb fungicide at 7–10 day intervals.",
      "Remove lower infected leaves to slow upward spread.",
      "Ensure adequate potassium nutrition to strengthen plant resistance.",
    ],
    precautions: [
      "Rotate crops — avoid growing the same crop in the same field for 2–3 seasons.",
      "Use certified disease-free seeds/transplants.",
      "Avoid working in the field when plants are wet.",
    ],
  },
  "Stem Borer": {
    actions: [
      "Apply recommended insecticide (e.g., chlorpyrifos) at the base of stems.",
      "Collect and destroy egg masses and infected plant material.",
      "Use pheromone traps to monitor adult moth populations.",
    ],
    precautions: [
      "Maintain field hygiene — remove crop residues after harvest.",
      "Plant early to avoid peak pest populations.",
      "Encourage natural predators by minimising broad-spectrum insecticide use.",
    ],
  },
  Healthy: {
    actions: [
      "No treatment required at this time.",
      "Continue your regular crop monitoring schedule.",
    ],
    precautions: [
      "Scan again in 7–14 days or sooner if you notice any new symptoms.",
      "Keep records of weather conditions and soil health.",
    ],
  },
};

const defaultRecommendation: RecommendationResult = {
  actions: [
    "Consult your local agriculture officer for specific guidance.",
    "Upload additional photos for a more accurate analysis.",
  ],
  precautions: [
    "Isolate affected plants until the disease is identified.",
    "Avoid moving equipment between affected and healthy areas.",
  ],
};

/**
 * Returns structured actions and precautions for a given disease name.
 * Falls back to generic advice for unknown diseases.
 */
export function getRecommendation(disease: string): RecommendationResult {
  return diseaseKnowledge[disease] ?? defaultRecommendation;
}
