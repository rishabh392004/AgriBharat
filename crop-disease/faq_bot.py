import os
from typing import List, Optional
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types

load_dotenv()

# Verify your key is picked up
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print("Loaded Key Prefix:", GEMINI_API_KEY[:8] if GEMINI_API_KEY else "KEY NOT FOUND")

from google import genai
ai_client = genai.Client(api_key=GEMINI_API_KEY)

app = FastAPI(title="AgriFAQ Chat Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ai_client = genai.Client(api_key=GEMINI_API_KEY)

FARMER_FAQ_SYSTEM_PROMPT = """
You are 'Kisan Salahkar', a dedicated general agricultural assistant for Indian farmers.
Answer general farming questions (sowing, irrigation schedules, fertilizer calculation, government schemes like PM-Kisan, and weed control).
Respond concisely in bullet points. Match the user's language (Hindi, Marathi, or English).
"""

class MessageItem(BaseModel):
    role: str
    content: str

class FAQQuery(BaseModel):
    question: str
    chat_history: Optional[List[MessageItem]] = []

class FAQAnswer(BaseModel):
    answer: str
    status: str

@app.get("/health")
def health():
    return {"status": "online", "service": "Kisan Salahkar", "model": "gemini-2.5-flash"}

@app.post("/ask", response_model=FAQAnswer)
async def ask_farmer_faq(payload: FAQQuery):
    if not payload.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    contents = []
    for item in payload.chat_history:
        contents.append(types.Content(role=item.role, parts=[types.Part.from_text(text=item.content)]))

    contents.append(types.Content(role="user", parts=[types.Part.from_text(text=payload.question)]))

    try:
        response = ai_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=FARMER_FAQ_SYSTEM_PROMPT,
                temperature=0.4,
                max_output_tokens=600
            )
        )
        return FAQAnswer(answer=response.text, status="success")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"FAQ Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("faq_bot:app", host="0.0.0.0", port=8001, reload=True)