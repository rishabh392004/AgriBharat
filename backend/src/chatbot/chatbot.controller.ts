import type { Request, Response } from "express";
import { AppError } from "../common/AppError.js";
import { chatRequestSchema } from "./chatbot.schema.js";
import { askChatbot, checkChatbotHealth } from "./chatbot.service.js";

/**
 * POST /api/v1/chatbot/ask
 * Sends a question (+ optional chat history) to the Kisan Salahkar bot.
 */
export async function askController(req: Request, res: Response) {
  const result = chatRequestSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
    return;
  }

  const { question, chat_history } = result.data;

  const response = await askChatbot(question, chat_history);

  res.status(200).json({
    answer:       response.answer,
    status:       response.status,
    question,                        // echo back for frontend convenience
    historyLength: chat_history.length,
  });
}

/**
 * GET /api/v1/chatbot/health
 * Returns whether the Python chatbot service is reachable.
 */
export async function chatbotHealthController(_req: Request, res: Response) {
  const isUp = await checkChatbotHealth();

  res.status(isUp ? 200 : 503).json({
    chatbot: isUp ? "online" : "offline",
    service: "Kisan Salahkar (Gemini FAQ Bot)",
  });
}
