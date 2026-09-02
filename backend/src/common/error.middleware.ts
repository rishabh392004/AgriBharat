import type { NextFunction, Request, Response } from "express";
import { AppError } from "./AppError.js";

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
    });
    return;
  }

  console.error("Unexpected error:", error);

  res.status(500).json({
    message: "Internal server error",
  });
}