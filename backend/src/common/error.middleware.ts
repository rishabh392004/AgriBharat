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

  // Handle express.json() JSON parse failures cleanly
  if (
    error instanceof SyntaxError &&
    "status" in error &&
    (error as Record<string, unknown>).status === 400 &&
    "body" in error
  ) {
    res.status(400).json({
      message: "Malformed JSON body",
    });
    return;
  }

  console.error("Unexpected error:", error);

  res.status(500).json({
    message: "Internal server error",
  });
}