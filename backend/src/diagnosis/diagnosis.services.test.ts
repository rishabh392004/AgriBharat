import { describe, expect, it, vi } from "vitest";
import { AppError } from "../common/AppError.js";

const firstMock = vi.fn();
const updateMock = vi.fn();

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

describe("diagnoseScan", () => {
  it("throws 404 when the scan does not exist", async () => {
    firstMock.mockResolvedValue(null);

    await expect(diagnoseScan(999999,999999)).rejects.toMatchObject({
      message: "Scan not found",
      statusCode: 404,
    });
  });

  it("throws 409 when diagnosis is already completed", async () => {
    firstMock.mockResolvedValue({
      id: 1,
      imageUrl: "https://example.com/plant.jpg",
      status: "COMPLETED",
    });

    await expect(diagnoseScan(1,1)).rejects.toMatchObject({
      message: "Diagnosis already completed",
      statusCode: 409,
    });
  });

  it("throws 409 when diagnosis is already in progress", async () => {
    firstMock.mockResolvedValue({
      id: 1,
      imageUrl: "https://example.com/plant.jpg",
      status: "PROCESSING",
    });

    await expect(diagnoseScan(1,1)).rejects.toMatchObject({
      message: "Diagnosis already in progress",
      statusCode: 409,
    });
  });

  it("completes diagnosis successfully", async () => {
    firstMock.mockResolvedValue({
      id: 1,
      imageUrl: "https://example.com/plant.jpg",
      status: "PENDING",
    });

    diagnoseMock.mockResolvedValue({
      scanId: 1,
      imageUrl: "https://example.com/plant.jpg",
      disease: "Healthy",
      confidence: 0.85,
      recommendation: "No treatment required.",
      provider: "mock",
    });

    await expect(diagnoseScan(1,1)).resolves.toEqual({
      scanId: 1,
      imageUrl: "https://example.com/plant.jpg",
      disease: "Healthy",
      confidence: 0.85,
      recommendation: "No treatment required.",
      provider: "mock",
    });

    expect(updateMock).toHaveBeenCalledWith({
      status: "PROCESSING",
    });

    expect(updateMock).toHaveBeenCalledWith({
      status: "COMPLETED",
    });
  });

  it("marks the scan as FAILED when the diagnosis provider fails", async () => {
  firstMock.mockResolvedValue({
    id: 2,
    imageUrl: "https://example.com/plant.jpg",
    status: "PENDING",
    });

   diagnoseMock.mockRejectedValue(
    new Error("Provider unavailable")
   );

  await expect(diagnoseScan(2,2)).rejects.toMatchObject({
    message: "Diagnosis failed",
    statusCode: 502,
    });

  expect(updateMock).toHaveBeenCalledWith({
    status: "PROCESSING",
    });

  expect(updateMock).toHaveBeenCalledWith({
    status: "FAILED",
    });
  });

  it("preserves AppError from the diagnosis provider", async () => {
  firstMock.mockResolvedValue({
    id: 3,
    imageUrl: "https://example.com/plant.jpg",
    status: "PENDING",
    });

  diagnoseMock.mockRejectedValue(
    new AppError("Diagnosis provider failed", 502)
  );

  await expect(diagnoseScan(3,3)).rejects.toMatchObject({
    message: "Diagnosis provider failed",
    statusCode: 502,
    });

  expect(updateMock).toHaveBeenCalledWith({
    status: "FAILED",
    });
  });
});