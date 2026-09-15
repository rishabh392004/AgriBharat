import { Router } from "express";
import { askController, chatbotHealthController } from "./chatbot.controller.js";

const router = Router();

/**
 * @route   POST /api/v1/chatbot/ask
 * @desc    Ask a farming question to Kisan Salahkar (Gemini AI)
 * @access  Public (no auth needed — chatbot is open to all users)
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
router.post("/ask", askController);

/**
 * @route   GET /api/v1/chatbot/health
 * @desc    Check if the Python chatbot service is running
 * @access  Public
 */
router.get("/health", chatbotHealthController);

export default router;
