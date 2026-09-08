import type { Locale } from '@/lib/i18n'

export interface ChatResponse {
  text: string
  suggestMap?: boolean
  suggestions?: string[]
}

export async function sendChatMessage(
  question: string,
  contextDisease?: string,
  locale: string = 'en'
): Promise<ChatResponse> {
  await new Promise((resolve) => setTimeout(resolve, 350))
  return replyToChat(question, contextDisease, locale)
}

// Detect script if question is in a native Indian script
function detectLocaleFromText(text: string, currentLocale: string): string {
  // Devanagari (Hindi / Marathi)
  if (/[\u0900-\u097F]/.test(text)) {
    return currentLocale === 'mr' ? 'mr' : 'hi'
  }
  // Bengali / Assamese
  if (/[\u0980-\u09FF]/.test(text)) {
    return currentLocale === 'as' ? 'as' : 'bn'
  }
  // Gujarati
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu'
  // Tamil
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'
  // Telugu
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te'
  // Kannada
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn'
  // Malayalam
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml'
  // Gurmukhi (Punjabi)
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa'

  return currentLocale || 'en'
}

type Topic = 'nearby' | 'symptoms' | 'precaution' | 'water' | 'yellow' | 'disease' | 'next' | 'fertilizer' | 'default'

function matchTopic(q: string): Topic {
  const s = q.toLowerCase()
  if (
    s.includes('nearby') || s.includes('help') || s.includes('kendra') || s.includes('store') ||
    s.includes('मदत') || s.includes('नजीक') || s.includes('केंद्र') || s.includes('দোকান') ||
    s.includes('સહાય') || s.includes('உதவி') || s.includes('సహాయం')
  ) {
    return 'nearby'
  }

  if (
    s.includes('symptom') || s.includes('लक्षण') || s.includes('notice') || s.includes('spot') ||
    s.includes('धब्बे') || s.includes('डाग') || s.includes('চিহ্ন') || s.includes('અસર')
  ) {
    return 'symptoms'
  }

  if (
    s.includes('precaution') || s.includes('prevent') || s.includes('रोक') || s.includes('बचाव') ||
    s.includes('काळजी') || s.includes('উপায়') || s.includes('સાવચેતી') || s.includes('முன்னெச்சரிக்கை')
  ) {
    return 'precaution'
  }

  if (
    s.includes('water') || s.includes('irrigation') || s.includes('सिंच') || s.includes('पाणी') ||
    s.includes('जल') || s.includes('পানি') || s.includes('પાણી') || s.includes('தண்ணீர்') || s.includes('నీరు')
  ) {
    return 'water'
  }

  if (
    s.includes('yellow') || s.includes('पील') || s.includes('पिवळ') || s.includes('হলুদ') ||
    s.includes('પીળા') || s.includes('மஞ்சள்') || s.includes('పసుపు')
  ) {
    return 'yellow'
  }

  if (
    s.includes('fertilizer') || s.includes('khad') || s.includes('खाद') || s.includes('खत') ||
    s.includes('সার') || s.includes('ખાતર') || s.includes('உரம்') || s.includes('ఎరువు')
  ) {
    return 'fertilizer'
  }

  if (
    s.includes('disease') || s.includes('rust') || s.includes('blight') || s.includes('mildew') ||
    s.includes('रोग') || s.includes('आजार') || s.includes('व्याधी') || s.includes('রোগবালাই') || s.includes('രോഗം')
  ) {
    return 'disease'
  }

  if (
    s.includes('next') || s.includes('step') || s.includes('do now') || s.includes('kay kara') ||
    s.includes('क्या करें') || s.includes('काय करू') || s.includes('কী করব')
  ) {
    return 'next'
  }

  return 'default'
}

// Multilingual response repository
const RESPONSES: Record<string, Record<Topic, (disease?: string) => { text: string; suggestMap?: boolean }>> = {
  // HINDI
  hi: {
    nearby: (d) => ({
      text: d
        ? `📍 **नजदीकी सहायता केंद्र (${d} के लिए):**\n\n1. **कृषि सेवा केंद्र, नासिक रोड** (2.4 किमी) - कवकनाशी व कीटनाशक उपलब्ध हैं।\n2. **कृषि विज्ञान केंद्र (KVK), पिंपलगांव** (4.1 किमी) - विशेषज्ञ परामर्श व मिट्टी परीक्षण।\n\n📞 किसान कॉल सेंटर: 1800-180-1551 (टोल-फ्री)\n'नजदीकी मदद' टैब खोलकर सटीक लोकेशन व मैप देखें।`
        : `📍 **आपके नजदीकी कृषि केंद्र:**\n\n• कृषि सेवा केंद्र (2.4 किमी) - प्रमाणित बीज और खाद उपलब्ध।\n• नासिक कृषि मंडी समिति कार्यालय (4.1 किमी)।\n\n📞 किसान हेल्पलाइन: 1800-180-1551 पर कॉल करें।`,
      suggestMap: true,
    }),
    symptoms: (d) => ({
      text: d
        ? `🔍 **${d} के मुख्य लक्षण:**\n\n• पत्तियों की निचली सतह पर नारंगी-भूरे या पीले रंग के धब्बे दिखते हैं।\n• अंगुली से छूने पर चूर्ण (पाउडर) जैसा पदार्थ हाथ पर लग जाता है।\n• रोग बढ़ने पर पत्तियां जल्दी पीली पड़कर सूखने लगती हैं।\n\n💡 सलाह: धूप में पत्ते के दोनों तरफ की साफ फोटो अपलोड करें।`
        : `🔍 **फसल रोग के सामान्य लक्षण:**\n\n1. निचली या पुरानी पत्तियों पर पीले या भूरे धब्बे बनना।\n2. पत्तियों का मुड़ना या किनारों से सूखना।\n3. सफेद या कत्थई रंग का फफूंद पाउडर दिखना।\n\nस्पष्ट पहचान के लिए 'फसल स्कैन' से फोटो खींचें।`,
    }),
    precaution: (d) => ({
      text: `🛡️ **बचाव और सावधानियां:**\n\n1. **संक्रमित हिस्से हटाएं:** गंभीर रूप से प्रभावित पत्तियों को तोड़कर खेत से दूर नष्ट करें।\n2. **हवा का संचार:** पौधों के बीच उचित दूरी रखें ताकि नमी जमा न हो।\n3. **जैविक उपचार:** 5 मिली नीम तेल प्रति लीटर पानी में मिलाकर शाम के समय छिड़काव करें।\n4. **रासायनिक रोकथाम:** लक्षण अधिक होने पर मैंकोजेब (Mancozeb 75% WP) 2 ग्राम प्रति लीटर पानी में छिड़कें।`,
    }),
    water: () => ({
      text: `💧 **सिंचाई व पानी प्रबंधन:**\n\n• सुबह के समय पौधों की जड़ों में पानी दें, दोपहर की तेज धूप या देर शाम में बचें।\n• पत्तियों के ऊपर फव्वारे से पानी डालने से बचें, क्योंकि पत्तों पर नमी रहने से फफूंद (फंगस) तेजी से फैलती है।\n• खेत में जलभराव न होने दें, जलनिकासी की उचित व्यवस्था रखें।`,
    }),
    yellow: () => ({
      text: `🍂 **पत्तियों के पीले पड़ने के मुख्य कारण:**\n\n1. **नाइट्रोजन की कमी:** यदि केवल पुरानी/निचली पत्तियां हल्की पीली हो रही हैं, तो यूरिया/कंपोस्ट की जरूरत हो सकती है।\n2. **फंगल या विषाणु रोग:** यदि पीलेपन के साथ कत्थई छल्ले या पाउडर दिखे, तो तुरंत फफूंदनाशक का प्रयोग करें।\n3. **अधिक पानी/जलजमाव:** जड़ों को हवा न मिलने पर पत्तियां पीली पड़ती हैं, जल निकासी जांचें।`,
    }),
    fertilizer: () => ({
      text: `🌱 **उर्वरक एवं पोषण सलाह:**\n\n• संतुलित NPK (19:19:19) का पर्णीय छिड़काव (5 ग्राम/लीटर) करें।\n• सूक्ष्म पोषक तत्वों (जिंक, फेरस) की कमी होने पर चेलैटेड माइक्रोन्यूट्रिएंट स्प्रे करें।\n• रोग की स्थिति में अत्यधिक यूरिया (नाइट्रोजन) देने से बचें, इससे बीमारी बढ़ सकती है।`,
    }),
    disease: (d) => ({
      text: d
        ? `⚠️ **${d} का प्रबंधन:**\n\nआपकी स्कैन की गई फसल में ${d} के संकेत हैं।\n\n• **तत्काल कदम:** संक्रमित पत्तियों को काटकर अलग करें।\n• **दवा छिड़काव:** प्रोपिकोनाजोल (Tilt 25% EC) 1 मिली प्रति लीटर पानी, या एजोक्सिस्ट्रोबिन का छिड़काव करें।\n• 7-10 दिनों के बाद दोबारा स्कैन कर स्थिति की जांच करें।`
        : `🌾 **क्षेत्रीय मुख्य फसल रोग:**\n\n• गेहूं: पीला व भूरा रतुआ (Leaf Rust)\n• टमाटर: अगेती व पछेती झुलसा (Blight)\n• धान: भूरा धब्बा रोग (Brown Spot)\n\nसही पहचान के लिए 'फसल स्कैन' पर पत्ते का स्पष्ट फोटो अपलोड करें।`,
    }),
    next: () => ({
      text: `📋 **आज आपको क्या करना चाहिए (कदम दर कदम):**\n\n1. **अलगाव:** सबसे अधिक रोगग्रस्त पौधों की छंटाई करें।\n2. **छिड़काव:** शाम 4 बजे के बाद फफूंदनाशक या नीम तेल का छिड़काव करें।\n3. **निगरानी:** कल सुबह नई पत्तियों पर धब्बों का फैलाव जांचें।\n4. **सहायता:** यदि 30% से अधिक खेत प्रभावित हो, तो नजदीकी कृषि केंद्र पर संपर्क करें।`,
    }),
    default: (d) => ({
      text: d
        ? `कृषि एआई आपके ${d} मामले के लिए तैयार है। आप लक्षण, दवा, सिंचाई या नजदीकी दुकान के बारे में पूछ सकते हैं या नई फोटो भेज सकते हैं।`
        : `नमस्ते किसान भाई! 🙏 मैं आपका कृषि एआई साथी हूँ। मुझे बताइए आपकी फसल में क्या समस्या दिख रही है, या पत्ते की फोटो अपलोड करें।`,
    }),
  },

  // MARATHI
  mr: {
    nearby: (d) => ({
      text: d
        ? `📍 **जवळचे कृषी मदत केंद्र (${d} साठी):**\n\n1. **कृषी सेवा केंद्र, नाशिक रोड** (2.4 किमी) - बुरशीनाशके व खते उपलब्ध.\n2. **कृषी विज्ञान केंद्र (KVK), पिंपळगाव** (4.1 किमी) - तज्ज्ञ कृषी सल्लागार.\n\n📞 किसान कॉल सेंटर: 1800-180-1551 (मोफत)\n'जवळची मदत' टॅब उघडून नकाशावर प्रत्यक्ष ठिकाण पाहा.`
        : `📍 **आपल्या परिसरातील कृषी केंद्रे:**\n\n• कृषी सेवा केंद्र (2.4 किमी) - प्रमाणित औषधे व बियाणे.\n• नाशिक कृषी उत्पन्न बाजार समिती कार्यालय (4.1 किमी).\n\n📞 किसान हेल्पलाइन: 1800-180-1551 वर संपर्क साधा.`,
      suggestMap: true,
    }),
    symptoms: (d) => ({
      text: d
        ? `🔍 **${d} ची प्रमुख लक्षणे:**\n\n• पानांच्या खालच्या बाजूला तांबूस-तपकिरी किंवा पिवळसर ठिपके दिसतात.\n• बोटाने घासल्यास हाताला भुकटी (पावडर) लागते.\n• प्रादुर्भाव वाढल्यास पाने पिवळी पडून वाळतात.\n\n💡 सल्ला: दिवसा चांगल्या प्रकाशात पानाच्या दोन्ही बाजूंचा फोटो काढून स्कॅन करा.`
        : `🔍 **पिकांवरील रोगांची सामान्य लक्षणे:**\n\n1. जुन्या पानांवर पिवळे किंवा तांबूस ठिपके पडणे.\n2. पानांचा आकार बदलणे किंवा सुरकुतणे.\n3. पांढरी किंवा काळी बुरशी दिसणे.\n\nअचूक निदानासाठी 'पीक स्कॅन' मधून फोटो पाठवा.`,
    }),
    precaution: (d) => ({
      text: `🛡️ **प्रतिबंधात्मक उपाय व काळजी:**\n\n1. **रोगट भाग काढा:** जास्त प्रादुर्भाव झालेली पाने तोडून शेताबाहेर नष्ट करा.\n2. **हवा खेळती ठेवा:** पिकांमध्ये योग्य अंतर ठेवा, जेणेकरून अतिरिक्त ओलावा राहणार नाही.\n3. **जैविक फवारणी:** 5 मिली निंबोळी अर्क (Neem Oil) प्रति लिटर पाण्यात मिसळून संध्याकाळी फवारा.\n4. **रासायनिक नियंत्रण:** लक्षणे जास्त असल्यास मॅन्कोझेब (Mancozeb 75% WP) 2 ग्रॅम/लिटर पाण्यात फवारा.`,
    }),
    water: () => ({
      text: `💧 **पाणी व्यवस्थापन व सिंचन:**\n\n• सकाळी लवकर मुळांच्या भागात पाणी द्या. कडक उन्हात किंवा रात्री उशिरा पाणी देणे टाळा.\n• पानांवर पाणी उडवणे टाळा, कारण पानांवर ओलावा राहिल्यास बुरशीजन्य रोग वेगाने पसरतात.\n• शेतात पाण्याचा निचरा उत्तम ठेवा, पाणी साचू देऊ नका.`,
    }),
    yellow: () => ({
      text: `🍂 **पाने पिवळी पडण्याची प्रमुख कारणे:**\n\n1. **नत्राची (Nitrogen) कमतरता:** जुनी पाने पिवळी पडत असल्यास युरिया किंवा गांडूळ खताचा वापर करा.\n2. **बुरशी किंवा विषाणू:** पिवळेपणासोबत ठिपके किंवा पावडर दिसत असल्यास तातडीने बुरशीनाशक फवारा.\n3. **जास्त पाणी/पाणथळ जमीन:** मुळांना हवा न मिळाल्याने पाने पिवळी पडतात, निचरा तपासा.`,
    }),
    fertilizer: () => ({
      text: `🌱 **खत व्यवस्थापन सल्ला:**\n\n• समतोल 19:19:19 विद्राव्य खताची 5 ग्रॅम प्रति लिटर फवारणी करा.\n• सूक्ष्म अन्नद्रव्यांची कमतरता असल्यास चिलेटेड मायक्रोन्युट्रिएंट्स वापरा.\n• रोगाचा प्रादुर्भाव असताना युरियाचा अतिरेक वापर टाळा.`,
    }),
    disease: (d) => ({
      text: d
        ? `⚠️ **${d} चे व्यवस्थापन:**\n\nतुमच्या पिकावर ${d} ची लक्षणे आढळली आहेत.\n\n• **तातडीची कृती:** बाधित पाने त्वरित काढून टाका.\n• **फवारणी:** प्रोपिकोनाझोल (Tilt) 1 मिली प्रति लिटर पाण्यात मिसळून फवारणी करा.\n• 7 दिवसांनी पुन्हा पीक स्कॅन करून सुधारणा तपासा.`
        : `🌾 **नाशिक परिसरातील मुख्य रोग:**\n\n• गहू: तांबेरा (Rust)\n• टोमॅटो: करपा व पाने गुंडाळणारा रोग (Blight)\n• भात: पानांवरील तपकिरी ठिपके\n\n'पीक स्कॅन' वापरून स्पष्ट फोटो पाठवा.`,
    }),
    next: () => ({
      text: `📋 **आज काय करावे (पुढील पावले):**\n\n1. बाधित रोपांची छाटणी करा.\n2. आज संध्याकाळी निंबोळी तेल किंवा बुरशीनाशक फवारा.\n3. उद्या सकाळी रोगाचा प्रसार थांबला आहे का ते तपासा.\n4. 30% पेक्षा जास्त नुकसान असल्यास जवळच्या कृषी सेवा केंद्राशी संपर्क करा.`,
    }),
    default: (d) => ({
      text: d
        ? `मी तुमच्या ${d} समस्येसाठी उपलब्ध आहे. लक्षणे, फवारणी, पाणी किंवा नजीकच्या केंद्राबद्दल विचारा.`
        : `नमस्कार शेतकरी मित्र! 🙏 मी तुमचा कृषी एआय मार्गदर्शक आहे. पिकावरील लक्षणे सांगा किंवा फोटो पाठवा.`,
    }),
  },

  // ENGLISH
  en: {
    nearby: (d) => ({
      text: d
        ? `📍 **Nearby Agricultural Support Centers for ${d}:**\n\n1. **Krishi Seva Kendra, Nashik Road** (2.4 km) - Fungicides, certified inputs & spraying gear.\n2. **Krishi Vigyan Kendra (KVK), Pimpalgaon** (4.1 km) - Agronomist consultations & soil testing.\n\n📞 Kisan Call Centre: 1800-180-1551 (Toll-Free)\nOpen 'Nearby Help' to view exact map locations and driving routes.`
        : `📍 **Nearby Centers in Nashik Corridor:**\n\n• Krishi Seva Kendra (2.4 km) - Quality seeds and certified fertilizers.\n• APMC Nashik Agricultural Office (4.1 km).\n\n📞 National Kisan Helpline: 1800-180-1551.`,
      suggestMap: true,
    }),
    symptoms: (d) => ({
      text: d
        ? `🔍 **Key Symptoms of ${d}:**\n\n• Powdery orange-brown or yellowish pustules on lower leaf surfaces.\n• Rust-colored residue that smears when rubbed between fingers.\n• Leaf chlorosis (yellowing) followed by premature leaf drop.\n\n💡 Tip: Take close-up photos of both leaf sides in daylight for precise automated detection.`
        : `🔍 **Common Crop Symptoms:**\n\n1. Yellowing or brown necrotic lesions starting on older leaves.\n2. Wilting, curled foliage, or powdery fungal growth.\n3. Stunted growth or root discolouration.\n\nUpload a photo via 'Scan Crop' for instant diagnosis.`,
    }),
    precaution: (d) => ({
      text: `🛡️ **Preventative Agronomic Actions:**\n\n1. **Sanitation:** Prune severely infested leaves and dispose of them outside the field.\n2. **Canopy Airflow:** Maintain optimal row spacing to prevent microclimate humidity build-up.\n3. **Organic Spray:** Apply 5ml/L cold-pressed Neem Oil with emulsifier during late afternoon.\n4. **Chemical Protection:** If lesions exceed 10% canopy, apply Mancozeb 75% WP @ 2g/L or Propiconazole 25% EC @ 1ml/L.`,
    }),
    water: () => ({
      text: `💧 **Irrigation & Moisture Guidelines:**\n\n• Water early in the morning directly at the root zone (drip irrigation preferred).\n• Avoid overhead sprinkler irrigation during high ambient humidity, as leaf wetness accelerates fungal spore germination.\n• Ensure optimal field drainage to prevent root rot and hypoxia.`,
    }),
    yellow: () => ({
      text: `🍂 **Why Leaves Turn Yellow:**\n\n1. **Nitrogen Deficiency:** Uniform pale yellowing of older lower leaves. Correct with balanced organic compost or 1% urea foliar spray.\n2. **Fungal Blight or Rust:** Yellow halo rings surrounding brown or orange spots. Requires targeted fungicide.\n3. **Overwatering/Waterlogging:** Roots suffocating due to poor drainage. Aerate topsoil.`,
    }),
    fertilizer: () => ({
      text: `🌱 **Nutritional & Fertilizer Advice:**\n\n• Apply balanced soluble NPK (19:19:19) at 5g per litre water for quick vegetative recovery.\n• Add chelated micronutrients (Zinc, Iron) if interveinal chlorosis is present.\n• Avoid excessive high-nitrogen dosing during active fungal outbreaks.`,
    }),
    disease: (d) => ({
      text: d
        ? `⚠️ **Managing ${d}:**\n\nYour crop scan indicates ${d}.\n\n• **Immediate Step:** Remove and isolate primary infection clusters.\n• **Fungicide Spray:** Apply systemic fungicide such as Propiconazole (1ml/L) or Azoxystrobin (1ml/L).\n• Re-scan leaves in 7 days to evaluate treatment efficacy.`
        : `🌾 **Prevalent Crop Diseases in this Region:**\n\n• Wheat: Leaf Rust (Puccinia triticina)\n• Tomato: Early & Late Blight (Alternaria / Phytophthora)\n• Rice: Brown Spot (Bipolaris oryzae)\n\nScan your crop leaf for automated AI identification.`,
    }),
    next: () => ({
      text: `📋 **Action Plan for Today:**\n\n1. Inspect and rogue out the 5 most severely damaged plants.\n2. Spray fungicide or neem oil after 4:00 PM once the direct sun softens.\n3. Re-photograph symptoms tomorrow morning to monitor progression.\n4. Visit Krishi Seva Kendra if >25% of the plot exhibits active lesions.`,
    }),
    default: (d) => ({
      text: d
        ? `I am ready to assist with your ${d} diagnosis. Ask about symptoms, spray dosage, watering schedules, or nearby Nashik stores.`
        : `Namaste! 🙏 I am Krishi AI, your personal crop care agronomist. Tell me what symptoms you observe, or upload a photo of your leaf.`,
    }),
  },
}

export function replyToChat(question: string, contextDisease?: string, locale: string = 'en'): ChatResponse {
  // Detect language: check question text first, fallback to user's selected locale
  const langKey = detectLocaleFromText(question, locale)
  const lang = (RESPONSES[langKey] ? langKey : RESPONSES[locale] ? locale : 'en') as 'hi' | 'mr' | 'en'

  const topic = matchTopic(question)
  const handler = RESPONSES[lang][topic] || RESPONSES[lang]['default']
  const result = handler(contextDisease)

  return {
    text: result.text,
    suggestMap: result.suggestMap,
    suggestions: [
      lang === 'hi' ? 'दवा का सही छिड़काव कैसे करें?' : lang === 'mr' ? 'फवारणीचे योग्य प्रमाण काय?' : 'What is the correct spray dosage?',
      lang === 'hi' ? 'नजदीकी केंद्र का पता दें' : lang === 'mr' ? 'जवळचे कृषी केंद्र दाखवा' : 'Show nearby agricultural centers',
      lang === 'hi' ? 'सिंचाई कब करनी चाहिए?' : lang === 'mr' ? 'पाणी कधी द्यावे?' : 'When should I irrigate?',
    ],
  }
}
