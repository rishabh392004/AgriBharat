/**
 * Unit tests for the real ML provider (realMlProvider).
 *
 * All tests mock `fetch` — no actual network calls are made.
 * The mock provider and getDiagnosisProvider are tested separately
 * in diagnosis.services.test.ts via vi.mock("./diagnosis.provider.js").
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AppError } from "../common/AppError.js";

// Mock env so tests don't need a real .env file
vi.mock("../config/env.js", () => ({
  env: {
    ML_SERVICE_URL: "http://localhost:8000",
    ML_TIMEOUT_MS: 30000,
  },
}));

// Mock the recommendation service (not under test here)
vi.mock("../recommendation/recommendation.service.js", () => ({
  getRecommendation: vi.fn().mockReturnValue({
    actions: ["Consult local KVK."],
    precautions: ["Isolate affected plants."],
  }),
}));

import { realMlProvider } from "./diagnosis.provider.js";

/** Minimal valid ML response that matches our Zod schema */
function makeValidMlResponse(overrides: object = {}) {
  return {
    status: "success",
    selected_crop_input: "Auto",
    predicted_disease: "Tomato___Late_Blight",
    confidence: 0.9141,
    foliar_damage_percent: 53.86,
    economic_threshold_status: "Breached ETL (Action Threshold)",
    etl_badge_color: "Red",
    pest_outbreak_risk: "HIGH_BORER_VECTOR_RISK",
    severity_analysis: {
      foliar_damage_percent: 53.86,
      affected_leaf_area_percent: 53.86,
      economic_threshold_status: "Breached ETL (Action Threshold)",
      etl_badge_color: "Red",
      recommended_urgency: "CRITICAL",
      action_plan: "Immediate targeted chemical intervention required.",
    },
    weather_context: {
      temperature_celsius: 29.0,
      humidity_percent: 78.0,
      pest_outbreak_risk: "HIGH_BORER_VECTOR_RISK",
      climate_pest_forecast: "Warm and humid conditions accelerate borer hatching.",
    },
    explainability: {
      method: "Grad-CAM",
      target_layer: "layer4",
      heatmap_base64: "data:image/jpeg;base64,/9j/fakeheatmap",
    },
    top_predictions: [
      { class: "Tomato___Late_Blight", confidence: 0.9141 },
      { class: "Tomato___Early_Blight", confidence: 0.0348 },
      { class: "Potato___Late_Blight", confidence: 0.0178 },
    ],
    recommended_solution: {
      vernacular_name: "Laat Blight",
      pest_vector: "Phytophthora infestans",
      biological_control: "Trichoderma @ 5g/L",
      chemical_control: "Mancozeb 75WP @ 2.5g/L",
      mechanical_control: "Remove infected leaves immediately",
    },
    ...overrides,
  };
}

const INPUT = {
  scanId: 42,
  imageUrl: "https://storage.example.com/scan42.jpg",
  cropName: "Tomato",
  latitude: 19.9975,
  longitude: 73.7898,
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("realMlProvider.diagnose — success path", () => {
  it("returns a correct DiagnosisResult from a valid ML response", async () => {
    const mockFetch = vi
      .fn()
      // First call: image download
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(100),
      })
      // Second call: ML /predict
      .mockResolvedValueOnce({
        ok: true,
        json: async () => makeValidMlResponse(),
      });

    vi.stubGlobal("fetch", mockFetch);

    const result = await realMlProvider.diagnose(INPUT);

    expect(result.scanId).toBe(42);
    expect(result.disease).toBe("Tomato___Late_Blight");
    expect(result.confidence).toBeCloseTo(0.9141, 3);
    expect(result.severity).toBe("severe");
    expect(result.flagOfficerReview).toBe(true);
    expect(result.urgency).toBe("CRITICAL");
    expect(result.foliarDamagePercent).toBeCloseTo(53.86, 1);
    expect(result.etlStatus).toBe("Breached ETL (Action Threshold)");
    expect(result.top3Predictions).toHaveLength(3);
    expect(result.top3Predictions[0]?.class).toBe("Tomato___Late_Blight");
    expect(result.weatherContext.pest_outbreak_risk).toBe("HIGH_BORER_VECTOR_RISK");
    expect(result.gradCamBase64).toContain("data:image/jpeg;base64,");
    expect(result.provider).toBe("ResNet34-FastAPI");
  });

  it("sets flagOfficerReview=true when confidence < 0.78", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, arrayBuffer: async () => new ArrayBuffer(100) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () =>
          makeValidMlResponse({
            confidence: 0.65,
            severity_analysis: {
              foliar_damage_percent: 10.0,
              affected_leaf_area_percent: 10.0,
              economic_threshold_status: "Below ETL (Monitoring Stage)",
              etl_badge_color: "Green",
              recommended_urgency: "LOW",
              action_plan: "Monitor the field.",
            },
          }),
      });

    vi.stubGlobal("fetch", mockFetch);

    const result = await realMlProvider.diagnose(INPUT);
    expect(result.flagOfficerReview).toBe(true); // confidence < 0.78
    expect(result.severity).toBe("mild"); // LOW urgency → mild
  });

  it("does NOT flag officer review for healthy high-confidence scans", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, arrayBuffer: async () => new ArrayBuffer(100) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () =>
          makeValidMlResponse({
            confidence: 0.95,
            predicted_disease: "Tomato___Healthy",
            severity_analysis: {
              foliar_damage_percent: 2.0,
              affected_leaf_area_percent: 2.0,
              economic_threshold_status: "Below ETL (Monitoring Stage)",
              etl_badge_color: "Green",
              recommended_urgency: "LOW",
              action_plan: "Continue regular monitoring.",
            },
          }),
      });

    vi.stubGlobal("fetch", mockFetch);

    const result = await realMlProvider.diagnose(INPUT);
    expect(result.flagOfficerReview).toBe(false);
  });
});

describe("realMlProvider.diagnose — failure handling", () => {
  it("throws AppError 502 when image download fails (non-200)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: false, status: 404 }));

    await expect(realMlProvider.diagnose(INPUT)).rejects.toMatchObject({
      statusCode: 502,
    });
  });

  it("throws AppError 504 when ML service request times out", async () => {
    const mockFetch = vi
      .fn()
      // Image download succeeds
      .mockResolvedValueOnce({ ok: true, arrayBuffer: async () => new ArrayBuffer(100) })
      // ML call throws AbortError (timeout)
      .mockRejectedValueOnce(
        Object.assign(new Error("The operation was aborted"), { name: "AbortError" })
      );

    vi.stubGlobal("fetch", mockFetch);

    await expect(realMlProvider.diagnose(INPUT)).rejects.toMatchObject({
      statusCode: 504,
      message: "ML service timed out",
    });
  });

  it("throws AppError 502 when ML service returns HTTP 500", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, arrayBuffer: async () => new ArrayBuffer(100) })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ detail: "Internal server error" }),
      });

    vi.stubGlobal("fetch", mockFetch);

    await expect(realMlProvider.diagnose(INPUT)).rejects.toMatchObject({
      statusCode: 502,
    });
  });

  it("throws AppError 502 when ML service is unreachable (connection refused)", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, arrayBuffer: async () => new ArrayBuffer(100) })
      .mockRejectedValueOnce(new TypeError("fetch failed"));

    vi.stubGlobal("fetch", mockFetch);

    await expect(realMlProvider.diagnose(INPUT)).rejects.toMatchObject({
      statusCode: 502,
      message: "ML service is unavailable",
    });
  });

  it("throws AppError 502 when ML response fails Zod validation (missing required field)", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, arrayBuffer: async () => new ArrayBuffer(100) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          // Missing required `predicted_disease`, `confidence`, `severity_analysis`, etc.
          status: "success",
          some_unexpected_field: true,
        }),
      });

    vi.stubGlobal("fetch", mockFetch);

    await expect(realMlProvider.diagnose(INPUT)).rejects.toMatchObject({
      statusCode: 502,
    });
  });

  it("throws AppError 502 when ML response status is not 'success'", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, arrayBuffer: async () => new ArrayBuffer(100) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () =>
          makeValidMlResponse({ status: "rejected" }),
      });

    vi.stubGlobal("fetch", mockFetch);

    await expect(realMlProvider.diagnose(INPUT)).rejects.toMatchObject({
      statusCode: 502,
    });
  });
});
