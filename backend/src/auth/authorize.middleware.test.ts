import { describe, expect, it, vi } from "vitest";
import type { Response, NextFunction } from "express";
import { authorize } from "./authorize.middleware.js";
import type { AuthenticatedRequest } from "./auth.middleware.js";
import { AppError } from "../common/AppError.js";

describe("authorize middleware", () => {
  it("calls next with 401 AppError if req.user is missing", () => {
    const middleware = authorize("OFFICER", "ADMIN");
    const req = {} as AuthenticatedRequest;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    const err = (next as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect((err as AppError).statusCode).toBe(401);
  });

  it("calls next with 403 AppError if user role is not in allowed roles", () => {
    const middleware = authorize("OFFICER", "ADMIN");
    const req = {
      user: { userId: 1, role: "USER" },
    } as AuthenticatedRequest;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    const err = (next as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect((err as AppError).statusCode).toBe(403);
  });

  it("calls next() with no argument if user has an allowed role", () => {
    const middleware = authorize("OFFICER", "ADMIN");
    const req = {
      user: { userId: 2, role: "OFFICER" },
    } as AuthenticatedRequest;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("calls next() with no argument if user is ADMIN", () => {
    const middleware = authorize("OFFICER", "ADMIN");
    const req = {
      user: { userId: 3, role: "ADMIN" },
    } as AuthenticatedRequest;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });
});
