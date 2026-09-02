import type { NextFunction, Request, Response } from "express";
import { AppError } from "../common/AppError.js";
import { verifyToken } from "../common/jwt.js";
import type { UserRole } from "./auth.types.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    role: UserRole;
  };
}

export function authMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    throw new AppError("Authentication required", 401);
  }

  if (!authorization.startsWith("Bearer ")) {
    throw new AppError("Invalid authorization format", 401);
  }

  const token = authorization.substring(7);

  if (!token) {
    throw new AppError("Authentication token missing", 401);
  }
  try {
    const payload = verifyToken(token);

    req.user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();
  } catch (error) {
  throw new AppError("Invalid or expired token", 401);
 }
}