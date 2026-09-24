import { NextResponse } from 'next/server'

interface ChatRequestBody {
  question: string
  chat_history?: { role: 'user' | 'model'; content: string }[]
  contextDisease?: string
  locale?: string
}

// Flexible greetings check
function isGreeting(q: string): boolean {
  const s = q.trim().toLowerCase()
  const greetingWords = [
    'hi', 'hello', 'hey', 'hlo', 'hii', 'namaste', 'namaskar',
    'नमस्ते', 'नमस्कार', 'हेलो', 'हाय', 'राम राम', 'प्रणाम', 'सलाम',
    'নমস্কার', 'ਸਤਿ ਸ੍ਰੀ', 'ਨਮਸਤੇ', 'வணக்கம்', 'నమస్కారం', 'നമസ്കാരം'
  ]
  return greetingWords.some((w) => s === w || s.startsWith(w + ' ') || s.endsWith(' ' + w))
}

// Self-introduction / Describe Yourself query detection
function isSelfIntro(q: string): boolean {
  const s = q.toLowerCase()
  return (
    s.includes('describe') || s.includes('who are you') || s.includes('what are you') ||
    s.includes('introduce') || s.includes('yourself') || s.includes('jkrishi') ||
    s.includes('kisan salahkar') || s.includes('about you') || s.includes('tell me about') ||
    s.includes('what can you do') || s.includes('what do you do') ||
    s.includes('अपने बारे में') || s.includes('बताओ') || s.includes('आप कौन') ||
    s.includes('तुम कौन') || s.includes('तुम क्या') || s.includes('आप क्या') ||
    s.includes('क्या काम') || s.includes('खुद के बारे में') || s.includes('अपना परिचय') ||
    s.includes('परिचय') || s.includes('तुम्ही कोण') || s.includes('स्वतःबद्दल') ||
    s.includes('तुमचा परिचय') || s.includes('काय करू शकता')
  )
}

// Auto-detect the language from Unicode script ranges in the question,
// overriding the locale parameter if a non-Latin script is clearly present.
function resolveLocale(question: string, locale: string): string {
  if (/[\u0900-\u097F]/.test(question)) {
    if (/आहे|नाही|शेतकरी|करावे|सांगा/.test(question)) return 'mr'
    return 'hi'
  }
  if (/[\u0980-\u09FF]/.test(question)) return 'bn'
  if (/[\u0A80-\u0AFF]/.test(question)) return 'gu'
  if (/[\u0B80-\u0BFF]/.test(question)) return 'ta'
  if (/[\u0C00-\u0C7F]/.test(question)) return 'te'
  if (/[\u0C80-\u0CFF]/.test(question)) return 'kn'
  if (/[\u0D00-\u0D7F]/.test(question)) return 'ml'
  if (/[\u0A00-\u0A7F]/.test(question)) return 'pa'
  return locale
}

function greetingAnswer(locale: string): string {
  if (locale === 'hi') return 'नमस्ते किसान भाई! 🙏\n\nमैं **Kisan Salahkar (JKrishi AI)** हूँ — आपका डिजिटल कृषि सलाहकार। आप मुझसे पूछ सकते हैं:\n\n🌾 फसल रोग की पहचान\n💊 दवा छिड़काव की सही मात्रा\n💧 सिंचाई का सही समय\n🧪 खाद और NPK की जरूरत\n📍 नजदीकी कृषि केंद्र\n\nबोलिए या लिखिए — मैं हमेशा तैयार हूँ!'
  if (locale === 'mr') return 'नमस्कार शेतकरी मित्र! 🙏\n\nमी **Kisan Salahkar (JKrishi AI)** आहे — तुमचा डिजिटल कृषी सल्लागार. तुम्ही मला विचारू शकता:\n\n🌾 पिकावरील रोगाची ओळख\n💊 फवारणीचे योग्य प्रमाण\n💧 पाणी देण्याची योग्य वेळ\n🧪 खत आणि NPK व्यवस्थापन\n📍 जवळचे कृषी केंद्र\n\nबोला किंवा लिहा — मी नेहमी तयार आहे!'
  if (locale === 'gu') return 'નમસ્તે ખેડૂત મિત્ર! 🙏\n\nહું **Kisan Salahkar (JKrishi AI)** છું — તમારો ડિજિટલ કૃષિ સહાયક.\n\nપ્રશ્ન પૂછો — પાક રોગ, દવાનો છંટકાવ, ખાતર અથવા સિંચાઈ વ્યવસ્થાપન.'
  return 'Hello, Farmer Friend! 🙏\n\nI am **Kisan Salahkar (JKrishi AI)** — your digital agronomy advisor. You can ask me about:\n\n🌾 Crop disease identification\n💊 Spray dosage & timing\n💧 Irrigation scheduling\n🧪 NPK & fertilizer advice\n📍 Nearby Krishi centers\n\nSpeak or type — I am always ready to help!'
}

function introduceAnswer(locale: string): string {
  if (locale === 'hi') return '🤖 **JKrishi AI (Kisan Salahkar) — मेरा परिचय:**\n\nमैं AgriBharat का **बहुभाषी AI कृषि सलाहकार** हूँ। मुझे विशेष रूप से भारतीय किसानों के लिए बनाया गया है।\n\n🌐 **मैं क्या कर सकता हूँ:**\n• फसल रोग की पहचान (AI स्कैन + सलाह)\n• दवा की सही खुराक और छिड़काव समय\n• जैविक व रासायनिक उपचार की जानकारी\n• NPK खाद की मात्रा और मिट्टी परीक्षण सलाह\n• नजदीकी कृषि विज्ञान केंद्र (KVK) ढूंढना\n• सरकारी योजनाएं जैसे PM-Kisan की जानकारी\n\n🗣️ **भाषा:** हिन्दी, मराठी, गुजराती, तमिल, तेलुगु और 8 अन्य भाषाओं में बात करें।\n\nबताइए — आपकी फसल में क्या समस्या है?'
  if (locale === 'mr') return '🤖 **JKrishi AI (Kisan Salahkar) — माझा परिचय:**\n\nमी AgriBharat चा **बहुभाषी AI कृषी सल्लागार** आहे. मला विशेषतः भारतीय शेतकऱ्यांसाठी तयार केले आहे.\n\n🌐 **मी काय करू शकतो:**\n• पिकावरील रोगाची ओळख (AI स्कॅन + सल्ला)\n• फवारणीचे योग्य प्रमाण आणि वेळ\n• जैविक व रासायनिक उपचार माहिती\n• NPK खत व मातीपरीक्षण सल्ला\n• जवळचे कृषी विज्ञान केंद्र (KVK) शोधणे\n• PM-Kisan सारख्या शासकीय योजनांची माहिती\n\n🗣️ **भाषा:** मराठी, हिन्दी, गुजराती, तमिळ, तेलुगू आणि ८ इतर भाषांमध्ये बोलता येते.\n\nसांगा — तुमच्या पिकात काय समस्या आहे?'
  return '🤖 **JKrishi AI (Kisan Salahkar) — About Me:**\n\nI am AgriBharat\'s **multilingual AI agriculture advisor**, built specifically for Indian farmers.\n\n🌐 **What I can do:**\n• Identify crop diseases (AI scan + advisory)\n• Recommend exact spray dosages & safe application windows\n• Provide organic & chemical treatment information\n• Advise on NPK nutrition & soil testing\n• Locate nearby Krishi Vigyan Kendra (KVK) centers\n• Explain government schemes like PM-Kisan\n\n🗣️ **Languages:** Hindi, Marathi, Gujarati, Tamil, Telugu and 8 other regional languages.\n\nTell me — what\'s happening with your crop today?'
}

export async function POST(req: Request) {
  try {
    const body: ChatRequestBody = await req.json()
    const { question, chat_history = [], contextDisease } = body
    const rawLocale = body.locale || 'en'

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    // Auto-detect language from the Unicode script in the question.
    // This ensures Hindi text gets Hindi responses even if locale=en was sent.
    const locale = resolveLocale(question, rawLocale)

    // --- Intercept greetings and self-introduction queries immediately ---
    if (isGreeting(question)) {
      return NextResponse.json({
        status: 'success',
        answer: greetingAnswer(locale),
        source: 'local-greeting',
      })
    }
    if (isSelfIntro(question)) {
      return NextResponse.json({
        status: 'success',
        answer: introduceAnswer(locale),
        source: 'local-intro',
      })
    }

    const contextualQuestion = contextDisease
      ? `[Crop Context: ${contextDisease}, Language: ${locale}] ${question}`
      : `[Language: ${locale}] ${question}`

    // 1. Attempt Node Express Backend Gateway
    try {
      const nodeController = new AbortController()
      const nodeTimeout = setTimeout(() => nodeController.abort(), 6000)

      const apiBaseUrl = (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1').replace(/\/+$/, '')
      const nodeChatEndpoint = apiBaseUrl.endsWith('/api/v1') ? `${apiBaseUrl}/chatbot/ask` : `${apiBaseUrl}/api/v1/chatbot/ask`

      const nodeRes = await fetch(nodeChatEndpoint, {
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
          // Verify it's not the old stale 1-sentence static blurb
          const isStaleStatic = nodeData.answer.includes('नीम तेल 10,000 PPM (3 मिली प्रति लीटर पानी) का छिड़काव करें') && nodeData.answer.length < 250
          if (!isStaleStatic) {
            return NextResponse.json({
              status: 'success',
              answer: nodeData.answer,
              source: 'node-backend',
            })
          }
        }
      }
    } catch {
      // Proceed to direct Python Chatbot fallback
    }

    // 2. Direct Python Chatbot Server
    try {
      const pyController = new AbortController()
      const pyTimeout = setTimeout(() => pyController.abort(), 8000)

      const pyBaseUrl = (process.env.PYTHON_ML_URL || process.env.NEXT_PUBLIC_ML_URL || 'http://localhost:8001').replace(/\/+$/, '')
      const pyChatEndpoint = `${pyBaseUrl}/ask`

      const pyRes = await fetch(pyChatEndpoint, {
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

    // 3. High quality domain knowledge response matching user's exact query and language
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

  // Pests / Insects
  if (query.includes('कीट') || query.includes('कीड़ा') || query.includes('सुंडी') || query.includes('इल्ली') || query.includes('माहू') || query.includes('चेपा') || query.includes('थ्रिप्स') || query.includes('pest') || query.includes('insect') || query.includes('worm')) {
    if (isHi) {
      return `🐛 **कीट व इल्ली नियंत्रण सलाह:**\n• **जैविक उपचार:** 10,000 PPM नीम तेल (3 मिली/लीटर पानी) शाम के समय छिड़कें।\n• **रस चूसक कीट:** इमिडाक्लोप्रिड 17.8% SL (0.5 मिली/लीटर पानी)।\n• **फली/तना छेदक सुंडी:** एमामेक्टिन बेंजोएट 5% SG (0.5 ग्राम/लीटर पानी)।\n• खेत में प्रति एकड़ 5-6 पीले चिपचिपे कार्ड लगाएं।`
    }
    if (isMr) {
      return `🐛 **कीड व अळी नियंत्रण सल्ला:**\n• **सेंद्रिय उपाय:** नीम तेल १०,००० PPM (३ मि.ली./लिटर पाणी) संध्याकाळी फवारा.\n• **रसशोषक किडी:** इमिडाक्लोप्रिड १७.८% SL (०.५ मि.ली./लिटर पाणी).\n• **अळी नियंत्रण:** इमामेक्टिन बेन्झोएट ५% SG (०.५ ग्रॅम/लिटर पाणी).`
    }
    return `🐛 **Pest Control Advisory:**\n• **Organic:** Spray Neem Oil 10,000 PPM @ 3ml/L in evening.\n• **Sucking Pests:** Imidacloprid 17.8% SL @ 0.5ml/L.\n• **Caterpillars:** Emamectin Benzoate 5% SG @ 0.5g/L.`
  }

  // Yellow leaves
  if (query.includes('पीली') || query.includes('पीला') || query.includes('पिवळ') || query.includes('yellow')) {
    if (isHi) {
      return `🍂 **पत्तियों का पीलापन दूर करने के उपाय:**\n1. **नाइट्रोजन की कमी:** 19:19:19 NPK (5 ग्राम/लीटर पानी) का पर्णीय छिड़काव करें।\n2. **सूक्ष्म पोषक तत्व:** चिलेटेड जिंक (1 ग्राम/लीटर) या फेरस सल्फेट का स्प्रे करें।\n3. **जलजमाव:** खेत से अतिरिक्त पानी तुरंत निकालें।`
    }
    if (isMr) {
      return `🍂 **पाने पिवळी पडण्यावरील उपाय:**\n1. **नत्राची कमतरता:** १९:१९:१९ विद्राव्य खत (५ ग्रॅम/लिटर पाणी) फवारा.\n2. **सूक्ष्म अन्नद्रव्ये:** चिलेटेड झिंक किंवा फेरस सल्फेट फवारा.\n3. शेतात पाणी साचले असल्यास त्वरित निचरा करा.`
    }
    return `🍂 **Leaf Yellowing Treatment:**\n1. Spray 19:19:19 NPK @ 5g/L for balanced nitrogen uptake.\n2. Apply Chelated Zinc @ 1g/L if upper leaves are affected.\n3. Ensure prompt field drainage.`
  }

  // Wheat
  if (query.includes('गेहूं') || query.includes('गहू') || query.includes('wheat')) {
    if (isHi) {
      return `🌾 **गेहूं फसल विशेष सलाह:**\n• **रतुआ (Rust):** प्रोपिकोनाज़ोल (Tilt 25% EC) 1 मिली/लीटर पानी में मिलाकर छिड़कें।\n• **सिंचाई:** कल्ले फूटते समय (CRI) और बालियां निकलते समय नमी बनाए रखें।\n• **उर्वरक:** पहली सिंचाई पर 30-35 किग्रा यूरिया प्रति एकड़ दें।`
    }
    return `🌾 **Wheat Crop Care:**\n• Spray Propiconazole 25% EC @ 1ml/L for rust.\n• Ensure irrigation at CRI and heading stages.\n• Apply balanced urea top-dressing.`
  }

  // Tomato
  if (query.includes('टमाटर') || query.includes('टोमॅटो') || query.includes('tomato')) {
    if (isHi) {
      return `🍅 **टमाटर फसल सलाह:**\n• **झुलसा (Blight):** कॉपर ऑक्सीक्लोराइड @ 2.5 ग्राम या रिडोमिल गोल्ड @ 2 ग्राम/लीटर छिड़कें।\n• **पत्ती मरोड़:** सफेद मक्खी रोकने के लिए इमिडाक्लोप्रिड @ 0.5 मिली/लीटर स्प्रे करें।\n• **फल सड़ना:** कैल्शियम नाइट्रेट 5 ग्राम/लीटर पानी का छिड़काव करें।`
    }
    return `🍅 **Tomato Crop Care:**\n• Apply Copper Oxychloride @ 2.5g/L for blight.\n• Control whitefly vector with Imidacloprid @ 0.5ml/L.\n• Supplement calcium to prevent blossom rot.`
  }

  // Fertilizers
  if (query.includes('खाद') || query.includes('यूरिया') || query.includes('डीएपी') || query.includes('खत') || query.includes('fertilizer') || query.includes('npk')) {
    if (isHi) {
      return `🌱 **उर्वरक एवं पोषण सलाह:**\n• संतुलित NPK (4:2:1) अनुपात अपनाएं।\n• डीएपी और पोटाश बुवाई के समय दें, यूरिया को 2-3 किस्तों में बांटकर सिंचाई के बाद दें।\n• फूल व फल के समय 00:52:34 का पर्णीय स्प्रे (5 ग्राम/लीटर) करें।`
    }
    return `🌱 **Fertilizer Guidance:**\n• Follow balanced 4:2:1 NPK ratio.\n• Apply basal DAP + Potash, split Urea top-dressing.\n• Foliar spray 00:52:34 @ 5g/L during reproductive phase.`
  }

  // General Questions per Language
  if (isMr) {
    return `🌾 **किसान सल्लागार (मराठी):**\nतुमच्या "${q}" या प्रश्नासाठी खालीलप्रमाणे कृषी उपाययोजना करा:\n• **सेंद्रिय उपाय:** ५% निंबोळी अर्क (३-५ मिली/लिटर) फवारा.\n• **खत व्यवस्थापन:** नत्र, स्फुरद व पालाश (NPK) योग्य प्रमाणात व माती परीक्षणानुसार द्या.\n• **पाणी नियोजन:** हलके पाणी द्या व शेतात पाण्याचा निचरा योग्य ठेवा.\n• **तज्ज्ञ मदत:** नजीकच्या कृषी विज्ञान केंद्राशी संपर्क साधा किंवा टोल-फ्री १८००-१८०-१५५१ वर कॉल करा.`
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
    return `🌾 **किसान सलाहकार सेवा (हिन्दी):**\nआपके प्रश्न "${q}" पर कृषि विशेषज्ञ सलाह उपलब्ध है:\n• **जैविक समाधान:** 5% नीम तेल (3-5 मिली/लीटर पानी) का शाम को छिड़काव करें।\n• **उर्वरक प्रबंधन:** मिट्टी परीक्षण के अनुसार संतुलित NPK अनुपात (4:2:1) अपनाएं।\n• **सिंचाई नियंत्रण:** ड्रिप सिंचाई अपनाएं, खेत में जलभराव से बचें।\n• **विशेषज्ञ सहयोग:** विस्तृत सलाह के लिए नजदीकी कृषि विज्ञान केंद्र (KVK) या 1800-180-1551 पर संपर्क करें।`
  }

  return `🌾 **Kisan Salahkar Assistant (English):**\nRegarding "${q}":\n• **Organic Care:** Spray 5% cold-pressed Neem Oil (3-5 ml per liter with mild soapy water) during evening hours.\n• **Fertilizer Guidance:** Maintain balanced NPK (4:2:1) and apply based on soil testing.\n• **Irrigation:** Prefer drip or furrow irrigation to minimize foliar moisture.\n• **Expert Support:** For custom advice, consult your nearest Krishi Vigyan Kendra (KVK).`
}

function anyContains(str: string, words: string[]): boolean {
  return words.some((w) => str.includes(w))
}
