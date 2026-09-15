import bcrypt from "bcryptjs";

import { db } from "../prisma/db.js";
import { AppError } from "../common/AppError.js";
import { generateToken } from "../common/jwt.js";
import {
  USER_ROLE,
  ADMIN_ROLE,
  OFFICER_ROLE,
  type UserRole,
} from "./auth.types.js";

function validateUserRole(role: string): UserRole {
  if (role === USER_ROLE || role === ADMIN_ROLE || role === OFFICER_ROLE) {
    return role;
  }

  throw new AppError("Invalid user role", 500);
}

export async function registerUser(
  email: string,
  password: string,
  name?: string
) {
  const existingUser = await db.orm.public.User
    .where({ email })
    .first();

  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await db.orm.public.User.create({
    email,
    passwordHash,
    ...(name !== undefined && { name }),
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export async function loginUser(
  email: string,
  password: string
) {
  const user = await db.orm.public.User
    .where({ email })
    .first();

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordValid) {
    throw new AppError("Invalid email or password", 401);
  }

 const role = validateUserRole(user.role);

const token = generateToken({
  userId: user.id,
  role,
});

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role,
    },
  };
}

export async function getUserById(userId: number) {
  const user = await db.orm.public.User
    .where({ id: userId })
    .first();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export async function updateUserRole(userId: number, newRole: UserRole) {
  const user = await db.orm.public.User
    .where({ id: userId })
    .first();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const updated = await db.orm.public.User
    .where({ id: userId })
    .update({ role: newRole });

  if (!updated) {
    throw new AppError("Failed to update user role", 500);
  }

  return {
    id: updated.id,
    email: updated.email,
    name: updated.name,
    role: updated.role,
  };
}