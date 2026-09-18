import { describe, expect, it, vi } from "vitest";
import type { Response, NextFunction } from "express";
import { authMiddleware, type AuthenticatedRequest } from "./auth.middleware.js";
import { generateToken } from "../common/jwt.js";
import { AppError } from "../common/AppError.js";

describe("authMiddleware", () => {
  it("rejects request without authorization header", () => {
    const req = { headers: {} } as AuthenticatedRequest;
    const res = {} as Response;
    const next = vi.fn();

    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalledWith(new AppError("Authentication required", 401));
    expect(req.user).toBeUndefined();
  });

  it("rejects request without Bearer scheme", () => {
    const req = { headers: { authorization: "Basic 12345" } } as unknown as AuthenticatedRequest;
    const res = {} as Response;
    const next = vi.fn();

    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalledWith(new AppError("Invalid authorization format", 401));
    expect(req.user).toBeUndefined();
  });

  it("rejects request with empty Bearer token", () => {
    const req = { headers: { authorization: "Bearer " } } as unknown as AuthenticatedRequest;
    const res = {} as Response;
    const next = vi.fn();

    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalledWith(new AppError("Authentication token missing", 401));
    expect(req.user).toBeUndefined();
  });

  it("rejects request with invalid signature token", () => {
    const req = { headers: { authorization: "Bearer invalid.jwt.token" } } as unknown as AuthenticatedRequest;
    const res = {} as Response;
    const next = vi.fn();

    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalledWith(new AppError("Invalid or expired token", 401));
    expect(req.user).toBeUndefined();
  });

  it("authenticates and attaches user on valid token", () => {
    const token = generateToken({ userId: 42, role: "USER" });
    const req = { headers: { authorization: `Bearer ${token}` } } as unknown as AuthenticatedRequest;
    const res = {} as Response;
    const next = vi.fn();

    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.user).toEqual({ userId: 42, role: "USER" });
  });
});
