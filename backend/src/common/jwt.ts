import jwt from "jsonwebtoken";
import { z } from "zod";

import { env } from "../config/env.js";

import {
  USER_ROLE,
  ADMIN_ROLE,
  type UserRole,
} from "../auth/auth.types.js";

const jwtPayloadSchema = z.object({
  userId: z.number().int().positive(),
  role: z.enum([USER_ROLE, ADMIN_ROLE]),
});

export interface JwtPayload {
  userId: number;
  role: UserRole;
}

export function generateToken(payload: JwtPayload): string {
  const expiresIn = env.JWT_EXPIRES_IN;

  return jwt.sign(
    payload,
    env.JWT_SECRET as jwt.Secret,
    {
      expiresIn: expiresIn as NonNullable<jwt.SignOptions["expiresIn"]>,
    }
  );
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(
    token,
    env.JWT_SECRET as jwt.Secret
  );

  const result = jwtPayloadSchema.safeParse(decoded);

  if (!result.success) {
    throw new Error("Invalid JWT payload");
  }

  return {
    userId: result.data.userId,
    role: result.data.role,
  };
}