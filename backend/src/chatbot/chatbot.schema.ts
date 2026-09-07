import { z } from "zod";

export const chatMessageSchema = z.object({
  role:    z.enum(["user", "model"]),
  content: z.string().min(1),
});

export const chatRequestSchema = z.object({
  question:     z.string().min(1, "Question cannot be empty").max(1000),
  chat_history: z.array(chatMessageSchema).optional().default([]),
});
