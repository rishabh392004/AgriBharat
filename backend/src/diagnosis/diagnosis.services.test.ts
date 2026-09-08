import { describe, expect, it, vi } from "vitest";
import { AppError } from "../common/AppError.js";

const firstMock = vi.fn();
const updateMock = vi.fn();
const farmFirstMock = vi.fn();

vi.mock("../prisma/db.js", () => ({
  db: {
    orm: {
      public: {
        Scan: {
          where: vi.fn(() => ({
            first: firstMock,
            update: updateMock,
          })),
        },
        Farm: {
          where: vi.fn(() => ({
            first: farmFirstMock,
          })),
        },
        DiseaseResult: {
          create: vi.fn().mockResolvedValue({ id: 1 }),
        },
      },
    },
  },
}));

const diagnoseMock = vi.fn();

vi.mock("./diagnosis.provider.js", () => ({
  getDiagnosisProvider: () => ({
    diagnose: diagnoseMock,
  }),
}));

import { diagnoseScan } from "./diagnosis.service.js";

/** Helper: a complete mock DiagnosisResult that satisfies the full type */
function makeMockResult(overrides: object = {}) {
  return {
    scanId: 1,
    imageUrl: "https://example.com/plant.jpg",
    disease: "Healthy",
    confidence: 0.85,
    severity: "none" as const,
    recommendation: { actions: ["No treatment required."], precautions: [] },
    provider: "mock",
    flagOfficerReview: false,
    foliarDamagePercent: 0,
    urgency: "LOW",
    etlStatus: "",
    top3Predictions: [{ class: "Healthy", confidence: 0.85 }],
    weatherContext: {
      temperature_celsius: 29,
      humidity_percent: 78,
      pest_outbreak_risk: "LOW_MONITORING_RISK",
      climate_pest_forecast: "Conditions are stable.",
    },
    ...overrides,
  };
}

describe("diagnoseScan", () => {
  it("throws 404 when the scan does not exist", async () => {
    firstMock.mockResolvedValue(null);

    await expect(diagnoseScan(999999, 999999)).rejects.toMatchObject({
      message: "Scan not found",
      statusCode: 404,
    });
  });

  it("throws 409 when diagnosis is already completed", async () => {
    firstMock.mockResolvedValue({
      id: 1,
      farmId: 1,
      imageUrl: "https://example.com/plant.jpg",
      status: "COMPLETED",
      cropName: "Auto",
      latitude: null,
      longitude: null,
    });

    farmFirstMock.mockResolvedValue({ id: 1 });

    await expect(diagnoseScan(1, 1)).rejects.toMatchObject({
      message: "Diagnosis already completed",
      statusCode: 409,
    });
  });

  it("throws 409 when diagnosis is already in progress", async () => {
    firstMock.mockResolvedValue({
      id: 1,
      farmId: 1,
      imageUrl: "https://example.com/plant.jpg",
      status: "PROCESSING",
      cropName: "Auto",
      latitude: null,
      longitude: null,
    });

    farmFirstMock.mockResolvedValue({ id: 1 });

    await expect(diagnoseScan(1, 1)).rejects.toMatchObject({
      message: "Diagnosis already in progress",
      statusCode: 409,
    });
  });

  it("completes diagnosis successfully", async () => {
    firstMock.mockResolvedValue({
      id: 1,
      farmId: 1,
      imageUrl: "https://example.com/plant.jpg",
      status: "PENDING",
      cropName: "Auto",
      latitude: null,
      longitude: null,
    });

    farmFirstMock.mockResolvedValue({ id: 1 });

    diagnoseMock.mockResolvedValue(makeMockResult());

    const result = await diagnoseScan(1, 1);

    expect(result).toMatchObject({
      scanId: 1,
      disease: "Healthy",
      confidence: 0.85,
      severity: "none",
      flagOfficerReview: false,
      foliarDamagePercent: 0,
      urgency: "LOW",
    });

    expect(updateMock).toHaveBeenCalledWith({ status: "PROCESSING" });
    expect(updateMock).toHaveBeenCalledWith({ status: "COMPLETED" });
  });

  it("marks the scan as FAILED when the diagnosis provider fails", async () => {
    firstMock.mockResolvedValue({
      id: 2,
      farmId: 2,
      imageUrl: "https://example.com/plant.jpg",
      status: "PENDING",
      cropName: "Auto",
      latitude: null,
      longitude: null,
    });

    farmFirstMock.mockResolvedValue({ id: 2 });

    diagnoseMock.mockRejectedValue(new Error("Provider unavailable"));

    await expect(diagnoseScan(2, 2)).rejects.toMatchObject({
      message: "Diagnosis failed",
      statusCode: 502,
    });

    expect(updateMock).toHaveBeenCalledWith({ status: "PROCESSING" });
    expect(updateMock).toHaveBeenCalledWith({ status: "FAILED" });
  });

  it("preserves AppError from the diagnosis provider", async () => {
    firstMock.mockResolvedValue({
      id: 3,
      farmId: 3,
      imageUrl: "https://example.com/plant.jpg",
      status: "PENDING",
      cropName: "Auto",
      latitude: null,
      longitude: null,
    });

    farmFirstMock.mockResolvedValue({ id: 3 });

    diagnoseMock.mockRejectedValue(
      new AppError("Diagnosis provider failed", 502)
    );

    await expect(diagnoseScan(3, 3)).rejects.toMatchObject({
      message: "Diagnosis provider failed",
      statusCode: 502,
    });

    expect(updateMock).toHaveBeenCalledWith({ status: "PROCESSING" });
    expect(updateMock).toHaveBeenCalledWith({ status: "FAILED" });
  });

  it("throws 404 when the scan does not belong to the user", async () => {
    firstMock.mockResolvedValue({
      id: 11,
      farmId: 4,
      imageUrl: "https://example.com/plant.jpg",
      status: "PENDING",
      cropName: "Auto",
      latitude: null,
      longitude: null,
    });

    farmFirstMock.mockResolvedValue(null);

    await expect(diagnoseScan(11, 14)).rejects.toMatchObject({
      message: "Scan not found",
      statusCode: 404,
    });

    expect(diagnoseMock).not.toHaveBeenCalled();
  });

  it("flags officer review when urgency is CRITICAL", async () => {
    firstMock.mockResolvedValue({
      id: 5,
      farmId: 5,
      imageUrl: "https://example.com/plant.jpg",
      status: "PENDING",
      cropName: "Tomato",
      latitude: 19.9975,
      longitude: 73.7898,
    });

    farmFirstMock.mockResolvedValue({ id: 5 });

    diagnoseMock.mockResolvedValue(
      makeMockResult({
        scanId: 5,
        disease: "Tomato___Late_Blight",
        confidence: 0.91,
        severity: "severe",
        flagOfficerReview: true,
        urgency: "CRITICAL",
        etlStatus: "Breached ETL (Action Threshold)",
        foliarDamagePercent: 53.86,
      })
    );

    const result = await diagnoseScan(5, 5);
    expect(result.flagOfficerReview).toBe(true);
    expect(result.urgency).toBe("CRITICAL");
    expect(result.foliarDamagePercent).toBe(53.86);
  });
});