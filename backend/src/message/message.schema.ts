import { z } from "zod";

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1, "Message cannot be empty").max(1000),
});

export const messageUserIdSchema = z.object({
  userId: z.coerce.number().int().positive(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
