import { NextResponse } from 'next/server'

interface ChatRequestBody {
  question: string
  chat_history?: { role: 'user' | 'model'; content: string }[]
  contextDisease?: string
  locale?: string
}

export async function POST(req: Request) {
  try {
    const body: ChatRequestBody = await req.json()
    const { question, chat_history = [], contextDisease, locale = 'en' } = body

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    const contextualQuestion = contextDisease
      ? `[Crop Context: ${contextDisease}, Language: ${locale}] ${question}`
      : `[Language: ${locale}] ${question}`

    // 1. Attempt Node Express Backend Gateway on Port 5000
    try {
      const nodeController = new AbortController()
      const nodeTimeout = setTimeout(() => nodeController.abort(), 6000)

      const nodeRes = await fetch('http://localhost:5000/api/v1/chatbot/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: contextualQuestion,
          chat_history,
          language: locale,
        }),
        signal: nodeController.signal,
      })
      clearTimeout(nodeTimeout)

      if (nodeRes.ok) {
        const nodeData = await nodeRes.json()
        if (nodeData && nodeData.answer) {
          return NextResponse.json({
            status: 'success',
            answer: nodeData.answer,
            source: 'node-backend:5000',
          })
        }
      }
    } catch {
      // Proceed to direct Python Chatbot fallback
    }

    // 2. Direct Python Chatbot Server on Port 8001
    try {
      const pyController = new AbortController()
      const pyTimeout = setTimeout(() => pyController.abort(), 8000)

      const pyRes = await fetch('http://localhost:8001/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: contextualQuestion,
          chat_history,
          language: locale,
        }),
        signal: pyController.signal,
      })
      clearTimeout(pyTimeout)

      if (pyRes.ok) {
        const pyData = await pyRes.json()
        if (pyData && pyData.answer) {
          return NextResponse.json({
            status: 'success',
            answer: pyData.answer,
            source: 'python-faq-bot:8001',
          })
        }
      }
    } catch {
      // Proceed to local domain knowledge fallback
    }

    // 3. High quality domain knowledge response matching user's exact native language
    return NextResponse.json({
      status: 'fallback',
      answer: generateLocalAgriAnswer(question, contextDisease, locale),
      source: 'local-knowledge',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to process chat query' },
      { status: 500 }
    )
  }
}

function generateLocalAgriAnswer(q: string, disease?: string, locale: string = 'en'): string {
  const query = q.toLowerCase()
  const isMr = locale === 'mr' || anyContains(q, ['पिक', 'रोग', 'फवारणी', 'आहे', 'नाही', 'शेतकरी', 'औषध', 'कसे'])
  const isGu = locale === 'gu' || /[\u0A80-\u0AFF]/.test(q)
  const isBn = locale === 'bn' || locale === 'as' || /[\u0980-\u09FF]/.test(q)
  const isTa = locale === 'ta' || /[\u0B80-\u0BFF]/.test(q)
  const isTe = locale === 'te' || /[\u0C00-\u0C7F]/.test(q)
  const isPa = locale === 'pa' || /[\u0A00-\u0A7F]/.test(q)
  const isHi = locale === 'hi' || (!isMr && /[\u0900-\u097F]/.test(q))

  if (disease) {
    if (isMr) {
      return `🌾 **शेतकरी सल्ला (${disease}):**\n1. प्रादुर्भाव झालेली पाने किंवा फांद्या त्वरित काढून नष्ट करा.\n2. कार्बेन्डाझिम किंवा कॉपर ऑक्सिक्लोराईड (२ ग्रॅम प्रति लिटर पाणी) सकाळी फवारा.\n3. सेंद्रिय नियंत्रणासाठी ५% निंबोळी अर्क किंवा नीम तेल (५ मिली/लिटर) फवारा.`
    }
    if (isGu) {
      return `🌾 **ખેડૂત સલાહ (${disease}):**\n1. રોગગ્રસ્ત પાંદડાં કે છોડને તાત્કાલિક ખેતરમાંથી દૂર કરો.\n2. કાર્બેન્ડાઝિમ અથવા કોપર ઓક્સિક્લોરાઇડ (૨ ગ્રામ/લિટર પાણી) સવારે છાંટો.\n3. જૈવિક નિયંત્રણ માટે ૫% લીમડાનું તેલ (૫ મિલી/લિટર) છાંટો.`
    }
    if (isBn) {
      return `🌾 **কৃষক পরামর্শ (${disease}):**\n1. রোগাক্রান্ত পাতা বা গাছ অবিলম্বে কেটে আলাদা করুন।\n2. কার্বেনডাজিম বা কপার অক্সিক্লোরাইড (২ গ্রাম/লিটার জল) সকালে স্প্রে করুন।\n3. জৈব নিয়ন্ত্রণের জন্য ৫% নিম তেল স্প্রে করুন।`
    }
    if (isHi) {
      return `🌾 **रोग सलाह (${disease}):**\n1. प्रभावित पत्तियों या पौधों को तुरंत अलग करें।\n2. कार्बेन्डाजिम या कॉपर ऑक्सीक्लोराइड (2 ग्राम/लीटर पानी) का छिड़काव सुबह के समय करें।\n3. जैविक उपचार के रूप में 5% नीम तेल (Neem Oil) का छिड़काव करें।`
    }
    return `🌾 **Advisory for ${disease}:**\n1. Isolate and prune heavily infected crop leaves to stop spore transmission.\n2. Apply Copper Oxychloride or Carbendazim (2g per liter of water) during early morning.\n3. For organic management, spray cold-pressed Neem oil (5ml/L with mild soap water).`
  }

  // General Questions
  if (isMr) {
    return `🌾 **किसान सल्लागार (मराठी):**\nतुमच्या "${q}" या प्रश्नासाठी खालीलप्रमाणे कृषी उपाययोजना करा:\n• **सेंद्रिय उपाय:** ५% निंबोळी अर्क (३-५ मिली/लिटर) फवारा.\n• **खत व्यवस्थापन:** नत्र, स्फुरद व पालाश (NPK) योग्य प्रमाणात व माती परीक्षणानुसार द्या.\n• **पाणी नियोजन:** हलके पाणी द्या व शेतात पाण्याचा निचरा योग्य ठेवा.\n• **तज्ज्ञ मदत:** नजीकच्या कृषी विज्ञान केंद्राशी संपर्क साधा.`
  }

  if (isGu) {
    return `🌾 **ખેડૂત સલાહકાર (ગુજરાતી):**\nતમારા પ્રશ્ન "${q}" માટે કૃષિ સલાહ:\n• **જૈવિક ઉપાય:** લીમડાનું તેલ (૩-૫ મિલી/લિટર પાણી) સાંજે છાંટો.\n• **ખાતર વ્યવસ્થા:** NPK ખાતર જમીન પરીક્ષણ મુજબ આપો.\n• **પિયત નિયંત્રણ:** વધુ પાણી ભરાવા ન દો, ટપક સિંચાઈ અપનાવો.`
  }

  if (isBn) {
    return `🌾 **কৃষক উপদেষ্টা (বাংলা):**\nআপনার "${q}" প্রশ্নের সমাধান:\n• **জৈব নিয়ন্ত্রণ:** নিম তেল (৩-৫ মিলি/লিটার জল) স্প্রে করুন।\n• **সার প্রয়োগ:** মাটির গুণাগুণ অনুযায়ী পরিমিত NPK সার দিন।\n• **সেচ:** জমিতে অতিরিক্ত জল জমতে দেবেন না।`
  }

  if (isTa) {
    return `🌾 **விவசாயி ஆலோசகர் (தமிழ்):**\nஉங்கள் "${q}" கேள்விக்கான தீர்வு:\n• **இயற்கை முறை:** வேப்ப எண்ணெய் (3-5 மி.லி/லிட்டர்) மாலை தெளிக்கவும்.\n• **உர மேலாண்மை:** NPK உரங்களை சீரான அளவில் பயன்படுத்தவும்.\n• **பாசனம்:** சொட்டு நீர் பாசனம் சிறந்த பலன் தரும்.`
  }

  if (isTe) {
    return `🌾 **రైతు సలహాదారు (తెలుగు):**\nమీ "${q}" ప్రశ్నకు సలహా:\n• **సేంద్రీయ పద్ధతి:** వేప నూనె (3-5 మి.లీ/లీటరు) పిచికారీ చేయండి.\n• **ఎరువుల యాజమాన్యం:** నేల పరీక్ష ప్రకారం NPK ఎరువులు వేయండి.\n• **నీటి యాజమాన్యం:** బిందు సేద్యం ద్వారా తేమను కాపాడండి.`
  }

  if (isPa) {
    return `🌾 **ਕਿਸਾਨ ਸਲਾਹਕਾਰ (ਪੰਜਾਬੀ):**\nਤੁਹਾਡੇ "${q}" ਸਵਾਲ ਦਾ ਹੱਲ:\n• **ਜੈਵਿਕ ਉਪਾਅ:** ਨਿੰਮ ਦਾ ਤੇਲ (3-5 ਮਿਲੀਲੀਟਰ/ਲਿਟਰ) ਸ਼ਾਮ ਨੂੰ ਛਿੜਕੋ।\n• **ਖਾਦ ਪ੍ਰਬੰਧਨ:** ਮਿੱਟੀ ਪਰਖ ਮੁਤਾਬਕ NPK ਖਾਦਾਂ ਦੀ ਵਰਤੋਂ ਕਰੋ।\n• **ਸਿੰਚਾਈ:** ਤੁਪਕਾ ਸਿੰਚਾਈ ਅਪਣਾਓ, ਵਾਧੂ ਪਾਣੀ ਨਾ ਖੜ੍ਹਨ ਦਿਓ।`
  }

  if (isHi) {
    return `🌾 **किसान सलाहकार सेवा (हिन्दी):**\nआपके प्रश्न "${q}" पर कृषि विशेषज्ञ सलाह उपलब्ध है:\n• **जैविक समाधान:** 5% नीम तेल (3-5 मिली/लीटर पानी) का शाम को छिड़काव करें।\n• **उर्वरक प्रबंधन:** मिट्टी परीक्षण के अनुसार संतुलित NPK अनुपात (4:2:1) अपनाएं।\n• **सिंचाई नियंत्रण:** ड्रिप सिंचाई अपनाएं, खेत में जलभराव से बचें।\n• **विशेषज्ञ सहयोग:** विस्तृत सलाह के लिए नजदीकी कृषि विज्ञान केंद्र (KVK) से संपर्क करें।`
  }

  return `🌾 **Kisan Salahkar Assistant (English):**\nRegarding "${q}":\n• **Organic Care:** Spray 5% cold-pressed Neem Oil (3-5 ml per liter with mild soapy water) during evening hours.\n• **Fertilizer Guidance:** Maintain balanced NPK (4:2:1) and apply based on soil testing.\n• **Irrigation:** Prefer drip or furrow irrigation to minimize foliar moisture.\n• **Expert Support:** For custom advice, consult your nearest Krishi Vigyan Kendra (KVK).`
}

function anyContains(str: string, words: string[]): boolean {
  return words.some((w) => str.includes(w))
}
