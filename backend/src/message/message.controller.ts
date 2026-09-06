import type { Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { AppError } from "../common/AppError.js";
import { sendMessageSchema, messageUserIdSchema } from "./message.schema.js";
import {
  sendMessage,
  getConversation,
  getConversationList,
  markAsRead,
  getOfficers,
} from "./message.service.js";

// POST /messages/:userId  — send a message
export async function sendMessageController(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.user) throw new AppError("Authentication required", 401);

  const paramResult = messageUserIdSchema.safeParse(req.params);
  if (!paramResult.success) {
    res.status(400).json({ message: "Invalid user ID" });
    return;
  }

  const bodyResult = sendMessageSchema.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: bodyResult.error.flatten().fieldErrors,
    });
    return;
  }

  const message = await sendMessage(
    req.user.userId,
    req.user.role,
    paramResult.data.userId,
    bodyResult.data.content
  );

  res.status(201).json({ message: "Message sent", data: message });
}

// GET /messages/:userId  — get conversation with a specific user
export async function getConversationController(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.user) throw new AppError("Authentication required", 401);

  const paramResult = messageUserIdSchema.safeParse(req.params);
  if (!paramResult.success) {
    res.status(400).json({ message: "Invalid user ID" });
    return;
  }

  const conversation = await getConversation(
    req.user.userId,
    paramResult.data.userId
  );

  res.status(200).json({ conversation });
}

// GET /messages/conversations  — list all conversation threads
export async function getConversationListController(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.user) throw new AppError("Authentication required", 401);

  const conversations = await getConversationList(req.user.userId);
  res.status(200).json({ conversations });
}

// PATCH /messages/:userId/read  — mark messages from a user as read
export async function markAsReadController(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.user) throw new AppError("Authentication required", 401);

  const paramResult = messageUserIdSchema.safeParse(req.params);
  if (!paramResult.success) {
    res.status(400).json({ message: "Invalid user ID" });
    return;
  }

  await markAsRead(req.user.userId, paramResult.data.userId);
  res.status(200).json({ message: "Messages marked as read" });
}

// GET /messages/officers  — list all officers (for farmers to start chat)
export async function getOfficersController(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.user) throw new AppError("Authentication required", 401);

  const officers = await getOfficers();
  res.status(200).json({ officers });
}
