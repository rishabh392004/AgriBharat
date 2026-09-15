import { describe, expect, it, vi } from "vitest";
import type { Response, NextFunction } from "express";
import { authorize } from "./authorize.middleware.js";
import type { AuthenticatedRequest } from "./auth.middleware.js";
import { AppError } from "../common/AppError.js";

describe("authorize middleware", () => {
  it("throws 401 if req.user is missing", () => {
    const middleware = authorize("OFFICER", "ADMIN");
    const req = {} as AuthenticatedRequest;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    expect(() => middleware(req, res, next)).toThrow(
      new AppError("Authentication required", 401)
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("throws 403 if user role is not in allowed roles", () => {
    const middleware = authorize("OFFICER", "ADMIN");
    const req = {
      user: { userId: 1, role: "USER" },
    } as AuthenticatedRequest;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    expect(() => middleware(req, res, next)).toThrow(
      new AppError("Forbidden", 403)
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() if user has an allowed role", () => {
    const middleware = authorize("OFFICER", "ADMIN");
    const req = {
      user: { userId: 2, role: "OFFICER" },
    } as AuthenticatedRequest;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("calls next() if user is ADMIN", () => {
    const middleware = authorize("OFFICER", "ADMIN");
    const req = {
      user: { userId: 3, role: "ADMIN" },
    } as AuthenticatedRequest;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
