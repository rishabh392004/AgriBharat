import type { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.schema.js";
import type { AuthenticatedRequest } from "./auth.middleware.js";
import { AppError } from "../common/AppError.js";
import { getUserById, registerUser, loginUser } from "./auth.service.js";

export async function register(req: Request, res: Response) {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
    return;
  }

  const { email, password, name } = result.data;

  const user = await registerUser(email, password, name);

  res.status(201).json({
    message: "User registered successfully",
    user,
  });
}

export async function login(req: Request, res: Response) {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
    return;
  }

  const { email, password } = result.data;

  const resultData = await loginUser(email, password);

  res.status(200).json({
    message: "Login successful",
    ...resultData,
  });
}

export async function getMe(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const user = await getUserById(req.user.userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    user,
  });
}