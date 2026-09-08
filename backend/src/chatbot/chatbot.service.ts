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
  chatHistory: ChatMessage[] = [],
  language: string = "en"
): Promise<ChatbotResponse> {
  try {
    const res = await fetch(`${CHATBOT_SERVICE_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        chat_history: chatHistory,
        language,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new AppError(`Chatbot service error: ${err}`, 502);
    }

    return (await res.json()) as ChatbotResponse;
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 502) {
      console.warn("[ChatbotService] Python upstream returned error, using fallback advisory.");
    }
    
    // Provide resilient built-in agricultural advisory fallback
    const qLower = question.toLowerCase();
    let advice = "नमस्ते किसान भाई! फसलों में कीट व रोग रोकथाम के लिए खेत की नियमित निगरानी करें। रोग के लक्षण दिखने पर तुरंत नीम तेल 10,000 PPM (3 मिली प्रति लीटर पानी) का छिड़काव करें। नजदीकी कृषि विज्ञान केंद्र (KVK) से संपर्क करें।";

    if (qLower.includes("blight") || qLower.includes("झुलसा") || qLower.includes("करपा")) {
      advice = "झुलसा (Blight) रोग के नियंत्रण के लिए कॉपर ऑक्सीक्लोराइड 50% WP @ 2.5 ग्राम प्रति लीटर या मैंकोजेब 75% WP @ 2 ग्राम प्रति लीटर पानी में मिलाकर साफ मौसम में छिड़काव करें।";
    } else if (qLower.includes("rust") || qLower.includes("गेरुआ") || qLower.includes("तांबेरा")) {
      advice = "गेरुआ / रतुआ (Rust) रोग के नियंत्रण हेतु प्रोपिकोनाज़ोल 25% EC (टिल्ट) @ 1 मिली प्रति लीटर पानी में घोल बनाकर तुरंत छिड़काव करें। 10 दिन बाद दोबारा निरीक्षण करें।";
    } else if (qLower.includes("fertilizer") || qLower.includes("खाद") || qLower.includes("npk")) {
      advice = "संतुलित पोषण हेतु मिट्टी परीक्षण के आधार पर NPK 4:2:1 अनुपात का पालन करें। बुवाई के समय डीएपी और पोटाश दें तथा खड़ी फसल में यूरिया को दो भागों में टॉप-ड्रेसिंग करें।";
    } else if (qLower.includes("water") || qLower.includes("irrigation") || qLower.includes("सिंचाई")) {
      advice = "फसल की क्राउन रूट और बालियां निकलते समय जलभराव न होने दें। ड्रिप सिंचाई पद्धति का उपयोग करके 40% तक पानी की बचत करें।";
    } else if (language === "en") {
      advice = "Greetings Farmer! For optimal crop protection, inspect leaf undersides every 3-4 days. For fungal/bacterial leaf symptoms, apply Neem Oil 10,000 PPM @ 3ml/L or consult your local Krishi Vigyan Kendra (KVK). Maintain clean field drainage.";
    }

    return {
      status: "fallback",
      answer: advice,
    };
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
