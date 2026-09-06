import type { NextFunction, Response } from "express";

import { AppError } from "../common/AppError.js";
import type { AuthenticatedRequest } from "./auth.middleware.js";
import type { UserRole } from "./auth.types.js";

export function authorize(...allowedRoles: UserRole[]) {
  return (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      throw new AppError("Forbidden", 403);
    }

    next();
  };
}