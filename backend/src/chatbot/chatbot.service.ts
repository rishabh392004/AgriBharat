import { AppError } from "../common/AppError.js";

const CHATBOT_SERVICE_URL = process.env.CHATBOT_SERVICE_URL ?? "http://localhost:8001";

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export interface ChatbotResponse {
  answer: string;
  status: string;
}

/**
 * Calls the Python Gemini FAQ bot service (faq_bot.py).
 * Sends the user's question + full chat history to maintain context.
 */
export async function askChatbot(
  question: string,
  chatHistory: ChatMessage[] = []
): Promise<ChatbotResponse> {
  try {
    const res = await fetch(`${CHATBOT_SERVICE_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        chat_history: chatHistory,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new AppError(`Chatbot service error: ${err}`, 502);
    }

    return await res.json() as ChatbotResponse;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Chatbot service is unavailable. Please try again later.", 503);
  }
}

/**
 * Health check for the chatbot Python service.
 */
export async function checkChatbotHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${CHATBOT_SERVICE_URL}/health`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}
