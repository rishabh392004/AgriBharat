import { describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
import { errorMiddleware } from "./error.middleware.js";
import { AppError } from "./AppError.js";

function mockResponse() {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

describe("errorMiddleware", () => {
  it("returns AppError status and message", () => {
    const res = mockResponse();
    const req = {} as Request;
    const next = vi.fn();

    const appError = new AppError("Resource not found", 404);
    errorMiddleware(appError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Resource not found" });
  });

  it("handles SyntaxError from malformed JSON body with status 400", () => {
    const res = mockResponse();
    const req = {} as Request;
    const next = vi.fn();

    const syntaxError = new SyntaxError("Unexpected token in JSON");
    Object.assign(syntaxError, { status: 400, body: "{ invalid json" });

    errorMiddleware(syntaxError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Malformed JSON body" });
  });

  it("falls back to generic 500 for unexpected errors", () => {
    const res = mockResponse();
    const req = {} as Request;
    const next = vi.fn();

    const error = new Error("Database crashed");
    errorMiddleware(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });
});
