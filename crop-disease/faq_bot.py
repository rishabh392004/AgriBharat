import os
from typing import List, Optional
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types

# Load environment from current directory or backend directory
load_dotenv()
backend_env = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend", ".env")
if os.path.exists(backend_env):
    load_dotenv(backend_env)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print("Loaded Key Prefix:", GEMINI_API_KEY[:8] if GEMINI_API_KEY else "KEY NOT FOUND (running in advisory fallback mode)")

ai_client = None
if GEMINI_API_KEY and len(GEMINI_API_KEY.strip()) > 10:
    try:
        ai_client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        print(f"Warning: Could not initialize Gemini client: {e}")

app = FastAPI(title="AgriFAQ Chat Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



FARMER_FAQ_SYSTEM_PROMPT = """
You are 'Kisan Salahkar', an expert AI voice and agricultural advisor for Indian farmers.
CRITICAL MULTILINGUAL INSTRUCTIONS:
- You MUST answer directly in the EXACT requested language:
  * If Marathi (मराठी), answer in fluent, respectful Marathi script.
  * If English, answer in clear English.
  * If Hindi (हिन्दी), answer in pure, natural Hindi script.
  * If Gujarati (ગુજરાતી), answer in Gujarati script.
  * If Bengali (বাংলা), answer in Bengali script.
  * If Tamil (தமிழ்), answer in Tamil script.
  * If Telugu (తెలుగు), answer in Telugu script.
  * If Punjabi (ਪੰਜਾਬੀ), answer in Punjabi Gurmukhi script.
  * If Kannada (ಕನ್ನಡ), answer in Kannada script.
  * If Malayalam (മലയാളം), answer in Malayalam script.
  * If Assamese (অসমীয়া), answer in Assamese script.
- Keep sentences concise, conversational, and easy to understand when spoken by a voice agent (Text-To-Speech).
- Use clear bullet points:
  1. Disease/issue identification or prevention.
  2. Organic/Natural remedy (e.g. neem oil, bio-fertilizers).
  3. Exact chemical spray dosage (grams or ml per liter) if needed.
  4. Irrigation and weather advice.
"""

class MessageItem(BaseModel):
    role: str
    content: str

class FAQQuery(BaseModel):
    question: str
    chat_history: Optional[List[MessageItem]] = []
    language: Optional[str] = "en"

class FAQAnswer(BaseModel):
    answer: str
    status: str
    language: Optional[str] = "en"

def get_native_fallback(q: str, lang: str = "en") -> str:
    query = q.lower()
    
    # 1. Exact language parameter check first
    if lang == "mr":
        return (
            "🌾 **शेतकरी सल्लागार मार्गदर्शन (Kisan Salahkar - Marathi):**\n\n"
            "• **रोग नियंत्रण (Control):** प्रादुर्भाव झालेली पाने त्वरित तोडून शेताबाहेर नष्ट करा.\n"
            "• **सेंद्रिय उपाय (Organic Remedy):** ५% निंबोळी अर्क किंवा नीम तेल (३ ते ५ मि.ली. प्रति लिटर पाणी) संध्याकाळी फवारा.\n"
            "• **रासायनिक फवारणी (Chemical Spray):** बुरशीजन्य रोगांसाठी मँकोझेब किंवा कॉपर ऑक्सिक्लोराईड (२ ते २.५ ग्रॅम/लिटर) फवारा.\n"
            "• **पाणी व्यवस्थापन (Irrigation):** ठिबक सिंचन वापरा; पानांवर जास्त वेळ पाणी साचू देऊ नका.\n"
            "• **अधिक माहिती:** अचूक मार्गदर्शनासाठी नजीकच्या कृषी विज्ञान केंद्राशी (KVK) संपर्क साधा."
        )

    if lang == "hi":
        return (
            "🌾 **किसान सलाहकार परामर्श (Kisan Salahkar - Hindi):**\n\n"
            "• **रोग रोकथाम:** तुरंत रोगग्रस्त पत्तियों को काटकर खेत से दूर नष्ट करें।\n"
            "• **जैविक उपाय:** नीम तेल (10,000 PPM @ 3ml/लीटर) का शाम को छिड़काव करें।\n"
            "• **सटीक दवा खुराक:** फफूंद जनित रोगों में मैन्कोजेब (2.5 ग्राम/लीटर पानी) का छिड़काव करें।\n"
            "• **सिंचाई प्रबंधन:** ड्रिप सिंचाई अपनाएं, खेत में अधिक जलभराव न होने दें।\n"
            "• **विशेषज्ञ सहायता:** नजदीकी कृषि विज्ञान केंद्र (KVK) या अधिकृत कृषि अधिकारी से परामर्श लें।"
        )

    if lang == "gu":
        return (
            "🌾 **ખેડૂત સલાહકાર માર્ગદર્શન (Kisan Salahkar - Gujarati):**\n\n"
            "• **રોગ નિયંત્રણ:** રોગગ્રસ્ત પાંદડાં તાત્કાલિક ખેતરમાંથી દૂર કરી નાશ કરો.\n"
            "• **જૈવિક ઉપાય:** લીમડાનું તેલ (Neem Oil ૩ મિલી/લિટર પાણી) નો સાંજના સમયે છંટકાવ કરો.\n"
            "• **રાસાયણિક દવા:** ફૂગનાશક નિયંત્રણ માટે મેન્કોઝેબ (૨.૫ ગ્રામ/લિટર) છાંટો.\n"
            "• **પિયત વ્યવસ્થા:** ટપક પદ્ધતિ અપનાવો, ખેતરમાં પાણી ભરાવા ન દો."
        )

    if lang in ["bn", "as"]:
        return (
            "🌾 **কৃষক উপদেষ্টা পরামর্শ (Kisan Salahkar - Bengali):**\n\n"
            "• **রোগ দমন:** আক্রান্ত পাতা ও ডাল অবিলম্বে কেটে জমি থেকে দূরে ফেলে দিন।\n"
            "• **জৈব প্রতিকার:** নিম তেল (৩ মিলি/লিটার জল) বিকেলে স্প্রে করুন।\n"
            "• **ছত্রাকনাশক স্প্রে:** ম্যানকোজেব (২.৫ গ্রাম/লিটার জল) স্প্রে করুন।\n"
            "• **সেচ পরামর্শ:** অতিরিক্ত জল জমতে দেবেন না, ড্রিপ সেচ ব্যবহার করুন।"
        )

    if lang == "ta":
        return (
            "🌾 **விவசாயி ஆலோசகர் வழிகாட்டுதல் (Kisan Salahkar - Tamil):**\n\n"
            "• **நோய் தடுப்பு:** பாதிக்கப்பட்ட இலைகளை உடனடியாக அகற்றி அழிக்கவும்.\n"
            "• **இயற்கை முறை:** வேப்ப எண்ணெய் (3 மி.லி/லிட்டர் தண்ணீர்) மாலை நேரத்தில் தெளிக்கவும்.\n"
            "• **மருந்து அளவு:** மாங்கோசெப் (2.5 கிராம்/லிட்டர்) தெளிக்கவும்.\n"
            "• **பாசன முறை:** சொட்டு நீர் பாசனத்தை பயன்படுத்தவும்."
        )

    if lang == "te":
        return (
            "🌾 **రైతు సలహాదారు మార్గదర్శకాలు (Kisan Salahkar - Telugu):**\n\n"
            "• **రోగ నివారణ:** తెగులు సోకిన ఆకులను వెంటనే తీసివేసి నాశనం చేయండి.\n"
            "• **సేంద్రీయ నివారణ:** వేప నూనె (3 మి.లీ/లీటరు నీరు) సాయంత్రం పిచికారీ చేయండి.\n"
            "• **మందు మోతాదు:** మాంకోజెబ్ (2.5 గ్రా/లీటరు) పిచికారీ చేయండి.\n"
            "• **నీటి యాజమాన్యం:** నీరు నిల్వ ఉండకుండా డ్రిప్ పద్ధతిని వాడండి."
        )

    if lang == "pa":
        return (
            "🌾 **ਕਿਸਾਨ ਸਲਾਹਕਾਰ ਸੇਧ (Kisan Salahkar - Punjabi):**\n\n"
            "• **ਰੋਗ ਰੋਕਥਾਮ:** ਬਿਮਾਰੀ ਵਾਲੇ ਪੱਤਿਆਂ ਨੂੰ ਤੁਰੰਤ ਕੱਟ ਕੇ ਖੇਤ ਤੋਂ ਬਾਹਰ ਨਸ਼ਟ ਕਰੋ।\n"
            "• **ਜੈਵਿਕ ਇਲਾਜ:** ਨਿੰਮ ਦਾ ਤੇਲ (3 ਮਿਲੀਲੀਟਰ/ਲਿਟਰ ਪਾਣੀ) ਸ਼ਾਮ ਵੇਲੇ ਛਿੜਕੋ।\n"
            "• **ਦਵਾਈ ਦੀ ਖੁਰਾਕ:** ਉੱਲੀ ਰੋਕਣ ਲਈ ਮੈਨਕੋਜ਼ੇਬ (2.5 ਗ੍ਰਾਮ/ਲਿਟਰ) ਛਿੜਕੋ।\n"
            "• **ਸਿੰਚਾਈ:** ਤੁਪਕਾ ਸਿੰਚਾਈ ਅਪਣਾਓ, ਵਾਧੂ ਪਾਣੀ ਨਾ ਖੜ੍ਹਨ ਦਿਓ।"
        )

    # 2. Heuristic fallback based on input characters if lang is en or unspecified
    if any(w in q for w in ["पिक", "पिकावर", "फवारणी", "आहे", "नाही", "शेतकरी", "औषध", "करावे", "बोंडअळी"]):
        return (
            "🌾 **शेतकरी सल्लागार मार्गदर्शन (Kisan Salahkar - Marathi):**\n\n"
            "• **रोग नियंत्रण:** प्रादुर्भाव झालेली पाने त्वरित तोडून शेताबाहेर नष्ट करा.\n"
            "• **सेंद्रिय उपाय:** ५% निंबोळी अर्क (३ ते ५ मि.ली. प्रति लिटर पाणी) संध्याकाळी फवारा.\n"
            "• **रासायनिक फवारणी:** मँकोझेब किंवा कॉपर ऑक्सिक्लोराईड (२ ते २.५ ग्रॅम/लिटर) फवारा."
        )

    if any("\u0A80" <= c <= "\u0AFF" for c in q):
        return (
            "🌾 **ખેડૂત સલાહકાર માર્ગદર્શન (Kisan Salahkar - Gujarati):**\n\n"
            "• **રોગ નિયંત્રણ:** રોગગ્રસ્ત પાંદડાં તાત્કાલિક ખેતરમાંથી દૂર કરી નાશ કરો.\n"
            "• **જૈવિક ઉપાય:** લીમડાનું તેલ (Neem Oil ૩ મિલી/લિટર પાણી) છાંટો."
        )

    if any("\u0900" <= c <= "\u097F" for c in q):
        return (
            "🌾 **किसान सलाहकार परामर्श (Kisan Salahkar - Hindi):**\n\n"
            "• **रोग रोकथाम:** तुरंत रोगग्रस्त पत्तियों को काटकर खेत से दूर नष्ट करें।\n"
            "• **जैविक उपाय:** नीम तेल (10,000 PPM @ 3ml/लीटर) का शाम को छिड़काव करें।\n"
            "• **सटीक दवा खुराक:** फफूंद जनित रोगों में मैन्कोजेब (2.5 ग्राम/लीटर पानी) का छिड़काव करें।"
        )

    # Default English
    return (
        "🌾 **Kisan Salahkar Agricultural Advisory (English):**\n\n"
        "• **Immediate Action:** Remove and destroy heavily affected leaves to arrest infection spread.\n"
        "• **Organic Remedy:** Spray cold-pressed Neem Oil (3-5 ml per liter with mild soapy water) during evening hours.\n"
        "• **Chemical Dosage:** For fungal blights, apply Mancozeb or Copper Oxychloride at 2 to 2.5 grams per liter of water.\n"
        "• **Irrigation & Soil:** Adopt drip irrigation; avoid sprinkler spray during humid spells.\n"
        "• **KVK Assistance:** Consult your nearby Krishi Vigyan Kendra for custom crop solutions."
    )


@app.get("/health")
def health():
    return {"status": "online", "service": "Kisan Salahkar", "model": "gemini-2.5-flash"}

@app.post("/ask", response_model=FAQAnswer)
async def ask_farmer_faq(payload: FAQQuery):
    if not payload.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    lang = payload.language or "en"
    if "[Language: " in payload.question:
        try:
            extracted_lang = payload.question.split("[Language: ")[1].split("]")[0].strip()
            if extracted_lang:
                lang = extracted_lang
        except Exception:
            pass

    contents = []
    for item in payload.chat_history:
        contents.append(types.Content(role=item.role, parts=[types.Part.from_text(text=item.content)]))

    contents.append(types.Content(role="user", parts=[types.Part.from_text(text=payload.question)]))

    if not ai_client:
        return FAQAnswer(
            answer=get_native_fallback(payload.question, lang),
            status="fallback",
            language=lang
        )

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
        return FAQAnswer(answer=response.text, status="success", language=lang)
    except Exception as e:
        return FAQAnswer(
            answer=get_native_fallback(payload.question, lang),
            status="fallback",
            language=lang
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("faq_bot:app", host="0.0.0.0", port=8001, reload=True)
import os
import io
from typing import List, Optional
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ai_client = genai.Client(api_key=GEMINI_API_KEY)

app = FastAPI(title="AgriFAQ Chat Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/transcribe")
async def transcribe_audio(audio_file: UploadFile = File(...)):
    """Directly transcribes Indian spoken audio using Gemini's native audio model."""
    if not audio_file:
        raise HTTPException(status_code=400, detail="No audio file uploaded.")

    audio_bytes = await audio_file.read()
    if len(audio_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded audio file is empty.")

    mime = audio_file.content_type or "audio/wav"
    # Ensure supported audio mime types
    if "octet-stream" in mime or not mime:
        mime = "audio/wav"

    try:
        response = ai_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(data=audio_bytes, mime_type=mime),
                "Accurately transcribe this farmer's voice inquiry into clean text. "
                "The speech might be in Hindi, Marathi, Hinglish, or English. "
                "Output ONLY the exact transcribed sentence. Do not add explanations, quotes, or greetings."
            ]
        )
        return {
            "status": "success",
            "transcribed_text": response.text.strip()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio transcription error: {str(e)}")

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
    uvicorn.run("faq_bot:app", host="127.0.0.1", port=8001, reload=False)
