import { Router } from "express";
import rateLimit from "express-rate-limit";
import { askController, chatbotHealthController } from "./chatbot.controller.js";

const router = Router();

export const chatbotRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 10, // 10 requests per minute per IP
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many questions. Please wait a moment and try again." },
});

/**
 * @route   POST /api/v1/chatbot/ask
 * @desc    Ask a farming question to Kisan Salahkar (Gemini AI)
 * @access  Public (rate-limited)
 *
 * Body:
 * {
 *   "question": "गेहूं की बुवाई कब करें?",
 *   "chat_history": [
 *     { "role": "user",  "content": "previous question" },
 *     { "role": "model", "content": "previous answer"   }
 *   ]
 * }
 */
router.post("/ask", chatbotRateLimit, askController);

/**
 * @route   GET /api/v1/chatbot/health
 * @desc    Check if the Python chatbot service is running
 * @access  Public
 */
router.get("/health", chatbotHealthController);

export default router;
