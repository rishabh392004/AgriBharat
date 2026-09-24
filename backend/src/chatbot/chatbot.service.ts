import { AppError } from "../common/AppError.js";
import { env } from "../config/env.js";

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
  chatHistory: ChatMessage[] = [],
  language: string = "en"
): Promise<ChatbotResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.CHATBOT_TIMEOUT_MS);

  try {
    const res = await fetch(`${env.CHATBOT_SERVICE_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        chat_history: chatHistory,
        language,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      // Do NOT forward raw internal service body — it may contain stack traces or internal hostnames.
      console.error(`[Chatbot] Python service returned HTTP ${res.status}`);
      throw new AppError("Chatbot service returned an error. Please try again later.", 502);
    }

    return (await res.json()) as ChatbotResponse;
  } catch (error) {
    clearTimeout(timer);
    if (error instanceof AppError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new AppError("Chatbot service timed out. Please try again later.", 504);
    }
    throw new AppError("Chatbot service is unavailable. Please try again later.", 503);
  }
}

/**
 * Health check for the chatbot Python service.
 */
export async function checkChatbotHealth(): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${env.CHATBOT_SERVICE_URL}/health`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    clearTimeout(timer);
    return false;
  }
}
