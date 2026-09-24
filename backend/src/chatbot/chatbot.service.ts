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
 * Intelligent agricultural advisory engine providing contextual,
 * multilingual guidance when upstream AI bot is offline or initializing.
 */
function getIntelligentAdvisory(rawQuestion: string, language: string = "en"): string {
  // Strip system prompt markers like [Language: hi] or [Crop Context: ...]
  const q = rawQuestion
    .replace(/^\[(?:Crop Context:[^\]]*,?\s*)?(?:Language:[^\]]*)?\]\s*/i, "")
    .trim();
  const lower = q.toLowerCase();

  const isMr = language === "mr" || /[\u0900-\u097F]/.test(q) && (lower.includes("आहे") || lower.includes("नाही") || lower.includes("शेतकरी") || lower.includes("करावे") || lower.includes("सांगा"));
  const isHi = language === "hi" || (!isMr && /[\u0900-\u097F]/.test(q));
  const isGu = language === "gu" || /[\u0A80-\u0AFF]/.test(q);
  const isBn = language === "bn" || /[\u0980-\u09FF]/.test(q);
  const isPa = language === "pa" || /[\u0A00-\u0A7F]/.test(q);

  // 1. GREETINGS
  const greetingWords = ["hi", "hello", "hey", "hlo", "namaste", "namaskar", "नमस्ते", "नमस्कार", "हेलो", "हाय", "राम राम", "प्रणाम", "सलाम", "sat sri akal", "kem cho"];
  if (greetingWords.some((w) => lower === w || lower.startsWith(w + " ") || lower.endsWith(" " + w))) {
    if (isMr) {
      return `🌾 **नमस्कार शेतकरी मित्र! 🙏**\n\nमी **Kisan Salahkar (JKrishi AI)** — तुमचा डिजिटल कृषी सल्लागार.\n\nतुम्ही मला खालील विषयांवर विचारू शकता:\n• 🌾 पिकावरील रोग व कीड नियंत्रण\n• 💊 औषध फवारणीचे प्रमाण (Dosage)\n• 🧪 खते आणि NPK पोषण व्यवस्थापन\n• 💧 पाणी देणे व ठिबक सिंचन\n• 📍 जवळचे कृषी विज्ञान केंद्र (KVK)\n\nसांगा, आज तुमच्या पिकासाठी काय मदत हवी आहे?`;
    }
    if (isHi) {
      return `🌾 **नमस्ते किसान भाई! 🙏**\n\nमैं **Kisan Salahkar (JKrishi AI)** — आपका डिजिटल कृषि सलाहकार।\n\nआप मुझसे किसी भी विषय पर पूछ सकते हैं:\n• 🌾 फसल रोग और कीट नियंत्रण\n• 💊 दवा की सही खुराक और छिड़काव समय\n• 🧪 खाद और NPK उर्वरक प्रबंधन\n• 💧 सिंचाई का सही समय\n• 📍 नजदीकी कृषि विज्ञान केंद्र (KVK)\n\nबोलिए या लिखिए — मैं आपकी सेवा में हाजिर हूँ!`;
    }
    return `🌾 **Hello Farmer Friend! 🙏**\n\nI am **Kisan Salahkar (JKrishi AI)** — your digital agricultural advisor.\n\nYou can ask me about:\n• 🌾 Crop disease & pest identification\n• 💊 Exact chemical & organic spray dosages\n• 🧪 Balanced NPK fertilizer nutrition\n• 💧 Irrigation scheduling\n• 📍 Nearby Krishi Vigyan Kendra (KVK) centers\n\nHow can I help your crop today?`;
  }

  // 2. SELF-INTRO / ABOUT ME ("अपने बारे में बताओ", "who are you", etc.)
  const introWords = [
    "अपने बारे में", "अपने बारे में बताओ", "परिचय", "तुम कौन", "आप कौन", "क्या करते", "क्या काम", "खुद के बारे में",
    "who are you", "what are you", "describe yourself", "about yourself", "about you", "tell me about yourself",
    "introduce", "jkrishi", "kisan salahkar", "तुम्ही कोण", "स्वतःबद्दल", "तुमचा परिचय", "काय करू शकता"
  ];
  if (introWords.some((w) => lower.includes(w))) {
    if (isMr) {
      return `🤖 **JKrishi AI (Kisan Salahkar) — माझा परिचय:**\n\nमी AgriBharat चा **बहुभाषी AI कृषी सल्लागार** आहे, जो भारतीय शेतकऱ्यांसाठी समर्पित आहे.\n\n🌐 **मी काय करू शकतो:**\n• **रोग निदान:** पानांचा फोटो स्कॅन करून आजार ओळखणे\n• **औषध मात्रा:** जैविक व रासायनिक फवारणीचे अचूक प्रमाण देणे\n• **खत व्यवस्थापन:** जमिनीनुसार NPK, डीएपी, युरिया नियोजन\n• **हवामान व सिंचन:** पाणी देण्याच्या योग्य वेळा सांगणे\n• **सरकारी योजना:** PM-Kisan, पिक विमा, KCC ची माहिती\n• **मदत केंद्र:** जवळचे कृषी विज्ञान केंद्र (KVK) शोधणे\n\n🗣️ **भाषा:** मराठी, हिन्दी, इंग्रजी आणि 8 इतर प्रादेशिक भाषा.\n\nतुमच्या पिकात काय अडचण आहे? सांगा, मी त्वरित सल्ला देतो.`;
    }
    if (isHi) {
      return `🤖 **JKrishi AI (Kisan Salahkar) — मेरा परिचय:**\n\nमैं AgriBharat का **बहुभाषी AI कृषि सलाहकार** हूँ। मुझे विशेष रूप से भारतीय किसान भाइयों की मदद के लिए बनाया गया है।\n\n🌐 **मेरी मुख्य क्षमताएं:**\n• **रोग पहचान:** पत्ते का फोटो स्कैन करके तुरंत बीमारी का सटीक निदान\n• **दवा व छिड़काव मात्रा:** जैविक (नीम तेल) व रासायनिक दवाओं की सही खुराक\n• **उर्वरक सलाह:** मिट्टी परीक्षण के अनुसार NPK, DAP, पोटाश व जिंक प्रबंधन\n• **सिंचाई नियंत्रण:** फसल की अवस्था अनुसार पानी देने का सही समय\n• **सरकारी योजनाएं:** PM-किसान सम्मान निधि, फसल बीमा (PMFBY), किसान क्रेडिट कार्ड (KCC)\n• **नजदीकी केंद्र:** आसपास के कृषि विज्ञान केंद्र (KVK) और खाद-बीज दुकान ढूंढना\n\n🗣️ **भाषाएं:** हिन्दी, मराठी, गुजराती, पंजाबी, बंगाली, तमिल और अंग्रेजी।\n\nबताइए — आपकी कौन सी फसल है और उसमें क्या समस्या आ रही है?`;
    }
    return `🤖 **JKrishi AI (Kisan Salahkar) — About Me:**\n\nI am AgriBharat's **multilingual AI agricultural advisor**, built specifically for Indian farmers.\n\n🌐 **What I can do:**\n• **Crop Disease Diagnosis:** Instantly detect foliar diseases from leaf scans\n• **Spray Dosage Calculator:** Provide exact chemical & organic treatment ratios (g or ml per liter)\n• **Fertilizer Management:** Balanced NPK nutrition, micronutrient advice (Zinc, Boron)\n• **Smart Irrigation:** Critical growth stage watering guidance to conserve water\n• **Govt Schemes:** PM-Kisan, PMFBY Crop Insurance, and Kisan Credit Card (KCC)\n• **Nearby Help:** Direct navigation to local Krishi Vigyan Kendra (KVK) centers\n\n🗣️ **Languages:** Hindi, Marathi, Gujarati, Punjabi, Bengali, Tamil, Telugu & English.\n\nTell me — what crop are you growing and what issue are you facing?`;
  }

  // 3. PESTS & INSECTS (कीट / इल्ली / सुंडी / माहू / थ्रिप्स / सफेद मक्खी)
  if (lower.includes("कीट") || lower.includes("कीड़ा") || lower.includes("सुंडी") || lower.includes("इल्ली") || lower.includes("माहू") || lower.includes("चेपा") || lower.includes("थ्रिप्स") || lower.includes("मक्खी") || lower.includes("pest") || lower.includes("insect") || lower.includes("worm") || lower.includes("aphid") || lower.includes("कीड")) {
    if (isHi) {
      return `🐛 **कीट व इल्ली नियंत्रण सलाह (Pest Control Advisory):**\n\n1. **जैविक रोकथाम (शुरुआती अवस्था):**\n   • नीम तेल 10,000 PPM @ 3 मिली प्रति लीटर पानी में थोड़ा शैम्पू मिलाकर शाम को छिड़कें।\n   • प्रति एकड़ 5-6 पीले व नीले चिपचिपे ट्रैप (Sticky Traps) लगाएं।\n\n2. **रस चूसक कीट (माहू, थ्रिप्स, सफेद मक्खी):**\n   • इमिडाक्लोप्रिड 17.8% SL @ 0.5 मिली/लीटर या एसिटामिप्रिड 20% SP @ 0.5 ग्राम/लीटर पानी।\n\n3. **इल्ली / सुंडी (Bollworm, Fruit/Stem Borer):**\n   • एमामेक्टिन बेंजोएट 5% SG @ 0.5 ग्राम प्रति लीटर या कोराजन (क्लोरेंट्रानिलिप्रोल) @ 0.3 मिली/लीटर पानी।\n\n⚠️ **सावधानी:** छिड़काव हमेशा सुबह 10 बजे से पहले या शाम 4 बजे के बाद करें।`;
    }
    if (isMr) {
      return `🐛 **कीड व अळी नियंत्रण सल्ला (Pest Control Advisory):**\n\n1. **सेंद्रिय उपाय:**\n   • ५% निंबोळी अर्क किंवा नीम तेल (१०,००० PPM) @ ३ मि.ली. प्रति लिटर पाण्यात मिसळून फवारा.\n   • एकरी ५ पिवळे व निळे चिकट सापळे लावा.\n\n2. **रसशोषक किडी (मावा, तुडतुडे, थ्रिप्स):**\n   • इमिडाक्लोप्रिड १७.८% SL @ ०.५ मि.ली./लिटर पाणी.\n\n3. **फळ किंवा खोडकिडी (अळी):**\n   • इमामेक्टिन बेन्झोएट ५% SG @ ०.५ ग्रॅम प्रति लिटर पाणी फवारा.\n\n⚠️ **काळजी:** फवारणी नेहमी सकाळी किंवा संध्याकाळी शांत हवेत करा.`;
    }
    return `🐛 **Pest & Insect Management Advisory:**\n\n1. **Organic / Biological Control:**\n   • Spray cold-pressed Neem Oil 10,000 PPM @ 3ml/L with mild soap water during evening hours.\n   • Install 5-6 yellow and blue sticky traps per acre.\n\n2. **Sucking Pests (Aphids, Thrips, Whiteflies):**\n   • Apply Imidacloprid 17.8% SL @ 0.5ml/L or Acetamiprid 20% SP @ 0.5g/L.\n\n3. **Caterpillars & Borers:**\n   • Apply Emamectin Benzoate 5% SG @ 0.5g/L or Chlorantraniliprole 18.5% SC @ 0.3ml/L.\n\n⚠️ Avoid spraying during high heat (11 AM – 3 PM) or windy conditions.`;
  }

  // 4. LEAF YELLOWING (पत्तियां पीली पड़ना / पिवळे पडणे / chlorosis)
  if (lower.includes("पीली") || lower.includes("पीला") || lower.includes("पिवळ") || lower.includes("yellow")) {
    if (isHi) {
      return `🍂 **पत्तियों के पीले पड़ने का कारण और उपचार:**\n\n1. **निचली पत्तियां पीली होना (नाइट्रोजन की कमी):**\n   • यूरिया 15-20 ग्राम प्रति लीटर पानी या 19:19:19 NPK @ 5 ग्राम/लीटर का पर्णीय छिड़काव करें।\n\n2. **नई ऊपरी पत्तियां पीली होना (आयरन या जिंक की कमी):**\n   • चिलेटेड जिंक (Chelated Zinc EDTA 12%) @ 1 ग्राम/लीटर या फेरस सल्फेट @ 2 ग्राम/लीटर का स्प्रे करें।\n\n3. **पत्ते मुड़कर पीले होना (वायरस / सफेद मक्खी):**\n   • सफेद मक्खी नियंत्रण के लिए डाइफेनथियुरॉन 50% WP @ 1.2 ग्राम/लीटर का छिड़काव करें।\n\n4. **जलभराव:** खेत से अतिरिक्त पानी तुरंत निकालें ताकि जड़ों को ऑक्सीजन मिल सके।`;
    }
    if (isMr) {
      return `🍂 **पाने पिवळी पडण्याची कारणे व उपाय:**\n\n1. **खालची पाने पिवळी पडणे (नत्राची कमतरता):**\n   • १९:१९:१९ विद्राव्य खत @ ५ ग्रॅम प्रति लिटर पाण्यात मिसळून फवारा.\n\n2. **नवीन वरची पाने पिवळी पडणे (लोह/झिंक कमतरता):**\n   • चिलेटेड झिंक किंवा फेरस सल्फेट @ १ ते २ ग्रॅम/लिटर फवारा.\n\n3. **पाणी साचणे:** मुळांना हवा मिळण्यासाठी शेतातील पाण्याचा निचरा त्वरित करा.`;
    }
    return `🍂 **Leaf Yellowing Diagnosis & Treatment:**\n\n1. **Lower Leaves Yellow First (Nitrogen Deficiency):**\n   • Foliar spray 19:19:19 NPK @ 5g/L or top-dress balanced urea.\n\n2. **Young Top Leaves Yellowing (Micronutrient Deficiency):**\n   • Apply Chelated Zinc (EDTA 12%) @ 1g/L or Ferrous Sulphate @ 2g/L.\n\n3. **Curling + Yellow Veins (Viral Mosaic via Whiteflies):**\n   • Spray Diafenthiuron 50% WP @ 1.2g/L or Imidacloprid to control vector insects.\n\n4. **Soil Waterlogging:** Ensure rapid field drainage to prevent root hypoxia.`;
  }

  // 5. WHEAT (गेहूं / गहू)
  if (lower.includes("गेहूं") || lower.includes("गहू") || lower.includes("wheat")) {
    if (isHi) {
      return `🌾 **गेहूं की फसल प्रबंधन सलाह (Wheat Care):**\n\n1. **पीला व भूरा रतुआ (Rust):** पत्तियों पर पीली/भूरे पाउडर की धारियां दिखने पर तुरंत **प्रोपिकोनाज़ोल (Tilt 25% EC)** @ 1 मिली/लीटर पानी में मिलाकर छिड़कें।\n2. **सिंचाई अवस्थाएं:** पहली सिंचाई बुवाई के 20-25 दिन बाद (CRI अवस्था) अवश्य करें। बालियां निकलते समय और दाना भरते समय पानी की कमी न होने दें।\n3. **उर्वरक:** पहली सिंचाई के समय 30-35 किग्रा यूरिया प्रति एकड़ दें।\n4. **दीमक नियंत्रण:** क्लोरपायरीफॉस 20% EC @ 1 लीटर प्रति एकड़ सिंचाई पानी के साथ दें।`;
    }
    return `🌾 **Wheat Crop Advisory:**\n\n1. **Yellow/Brown Rust:** If powdery stripes appear on leaves, immediately spray Propiconazole 25% EC (Tilt) @ 1ml/L of water.\n2. **Critical Irrigation:** Irrigate at Crown Root Initiation (CRI, 20-25 days after sowing), flowering, and milking stages.\n3. **Fertilizer:** Top-dress 30-35 kg Urea per acre during first irrigation.\n4. **Termite Control:** Apply Chlorpyrifos 20% EC with irrigation water.`;
  }

  // 6. TOMATO (टमाटर / टोमॅटो)
  if (lower.includes("टमाटर") || lower.includes("टोमॅटो") || lower.includes("tomato")) {
    if (isHi) {
      return `🍅 **टमाटर फसल प्रबंधन सलाह (Tomato Care):**\n\n1. **झुलसा (Early/Late Blight):** पत्तियों पर कत्थई छल्लेदार धब्बे दिखने पर कॉपर ऑक्सीक्लोराइड @ 2.5 ग्राम या रिडोमिल गोल्ड @ 2 ग्राम/लीटर का छिड़काव करें।\n2. **पत्ती मरोड़ रोग (Leaf Curl Virus):** यह सफेद मक्खी से फैलता है। नियंत्रण के लिए इमिडाक्लोप्रिड @ 0.5 मिली/लीटर छिड़कें।\n3. **फल छेदक इल्ली (Fruit Borer):** एमामेक्टिन बेंजोएट @ 0.5 ग्राम/लीटर का स्प्रे करें।\n4. **फल नीचे से काला पड़ना:** कैल्शियम की कमी से होता है; कैल्शियम नाइट्रेट @ 5 ग्राम/लीटर का छिड़काव करें।`;
    }
    return `🍅 **Tomato Crop Advisory:**\n\n1. **Early / Late Blight:** Spray Mancozeb @ 2.5g/L or Ridomil Gold @ 2g/L when concentric spots appear.\n2. **Leaf Curl Virus:** Control whitefly vectors with Imidacloprid @ 0.5ml/L.\n3. **Fruit Borer:** Spray Emamectin Benzoate 5% SG @ 0.5g/L.\n4. **Blossom End Rot:** Spray Calcium Nitrate @ 5g/L to remedy calcium deficiency.`;
  }

  // 7. RICE / PADDY (धान / भात / चावल)
  if (lower.includes("धान") || lower.includes("चावल") || lower.includes("भात") || lower.includes("rice") || lower.includes("paddy")) {
    if (isHi) {
      return `🌾 **धान (चावल) फसल प्रबंधन (Paddy Care):**\n\n1. **ब्लास्ट रोग (झोंका):** पत्तियों पर आंख के आकार के धब्बे दिखने पर ट्राइसाइक्लाज़ोल 75% WP (Baan) @ 0.6 ग्राम/लीटर का छिड़काव करें।\n2. **शीथ ब्लाइट:** वेलिडामाइसिन 3% L @ 2 मिली/लीटर पानी का छिड़काव तने के निचले हिस्से पर करें।\n3. **खैरा रोग (जिंक कमी):** जिंक सल्फेट 21% @ 5 किग्रा + 2.5 किग्रा बुझा चूना प्रति एकड़ छिड़कें।\n4. **तना छेदक (Stem Borer):** कार्बोफ्यूरॉन 3G @ 10 किग्रा/एकड़ या कारटाप हाइड्रोक्लोराइड का प्रयोग करें।`;
    }
    return `🌾 **Paddy / Rice Crop Advisory:**\n\n1. **Rice Blast:** Apply Tricyclazole 75% WP @ 0.6g/L when spindle-shaped lesions appear.\n2. **Sheath Blight:** Spray Validamycin 3% L @ 2ml/L targeted at lower tillers.\n3. **Khaira Disease:** Apply 5kg Zinc Sulphate + 2.5kg slaked lime per acre.\n4. **Stem Borer:** Broadcast Cartap Hydrochloride 4G granules @ 7-8 kg/acre in standing water.`;
  }

  // 8. FERTILIZER & NPK (खाद / यूरिया / डीएपी / पोटाश / उर्वरक)
  if (lower.includes("खाद") || lower.includes("उर्वरक") || lower.includes("यूरिया") || lower.includes("डीएपी") || lower.includes("पोटाश") || lower.includes("खत") || lower.includes("fertilizer") || lower.includes("npk") || lower.includes("dap") || lower.includes("urea")) {
    if (isHi) {
      return `🧪 **उर्वरक एवं NPK पोषण प्रबंधन सलाह:**\n\n1. **संतुलित अनुपात:** अधिकांश अनाज फसलों के लिए NPK 4:2:1 तथा दलहन फसलों के लिए 1:2:1 का अनुपात रखें।\n2. **बुवाई के समय (Basal Dose):** पूरी मात्रा फास्फोरस (DAP/SSP), पोटाश (MOP) और 1/3 नाइट्रोजन बुवाई के समय मिट्टी में नीचे डालें।\n3. **टॉप-ड्रेसिंग:** यूरिया को एक साथ न देकर 2-3 किस्तों में पहली व दूसरी सिंचाई के बाद दें।\n4. **पर्णीय स्प्रे (Foliar Nutrition):** फूल और फल बनते समय 00:52:34 या 13:00:45 @ 5 ग्राम/लीटर का छिड़काव करने से पैदावार 15-20% बढ़ती है।`;
    }
    return `🧪 **Fertilizer & Nutrition Management:**\n\n1. **Balanced NPK:** Maintain a 4:2:1 ratio for cereals and 1:2:1 for pulses.\n2. **Basal Application:** Apply all phosphorus (DAP/SSP), potassium (MOP), and 1/3 nitrogen at sowing.\n3. **Top Dressing:** Split remaining Nitrogen (Urea) into 2 applications timed with irrigations.\n4. **Foliar Nutrition:** Spray 00:52:34 or 13:00:45 @ 5g/L during flowering/fruit development to boost grain filling.`;
  }

  // 9. WATER & IRRIGATION (सिंचाई / पानी / ड्रिप)
  if (lower.includes("सिंचाई") || lower.includes("पानी") || lower.includes("पाणी") || lower.includes("ड्रिप") || lower.includes("water") || lower.includes("irrigation")) {
    if (isHi) {
      return `💧 **वैज्ञानिक सिंचाई प्रबंधन:**\n\n1. **सही समय:** सिंचाई सुबह जल्दी या शाम के समय करें। दोपहर की तेज धूप में पानी देने से पत्तियों पर फंगस और जड़ सड़न की संभावना बढ़ती है।\n2. **महत्वपूर्ण अवस्थाएं:** कल्ले फूटते समय, फूल आने पर और दाना भरते समय खेत में नमी की कमी नहीं होनी चाहिए।\n3. **ड्रिप / फव्वारा विधि:** ड्रिप पद्धति से 40-50% पानी की बचत होती है और दवा/खाद सीधे जड़ों तक पहुंचती है।\n4. **जलभराव से बचाव:** भारी बारिश या अधिक सिंचाई होने पर खेत से अतिरिक्त पानी निकालने की नाली हमेशा तैयार रखें।`;
    }
    return `💧 **Smart Irrigation Guidance:**\n\n1. **Timing:** Irrigate during early morning or evening hours to reduce evaporative losses.\n2. **Critical Growth Stages:** Never stress crops during tillering, flowering, or seed development.\n3. **Micro-Irrigation:** Use drip systems to save 40-50% water and enable fertigation.\n4. **Drainage:** Maintain clean runoff furrows to avoid root suffocation and fungal wilt.`;
  }

  // 10. MANDI & GOVERNMENT SCHEMES (मंडी / भाव / योजना / पीएम किसान)
  if (lower.includes("मंडी") || lower.includes("भाव") || lower.includes("रेट") || lower.includes("योजना") || lower.includes("pm kisan") || lower.includes("बीमा") || lower.includes("scheme") || lower.includes("mandi") || lower.includes("price")) {
    if (isHi) {
      return `🏛️ **सरकारी योजनाएं व मंडी जानकारी:**\n\n1. **PM-किसान सम्मान निधि:** पात्र किसानों को सालाना ₹6,000 (तीन किस्तों में ₹2,000) सीधे बैंक खाते में मिलते हैं।\n2. **प्रधानमंत्री फसल बीमा योजना (PMFBY):** खरीफ फसलों पर केवल 2% और रबी फसलों पर 1.5% प्रीमियम पर पूर्ण जोखिम सुरक्षा।\n3. **किसान क्रेडिट कार्ड (KCC):** समय पर भुगतान पर 4% की रियायती ब्याज दर पर कृषि ऋण।\n4. **ई-नाम (e-NAM):** देश की 1,000+ मंडियों से जुड़कर अपनी फसल का सर्वोत्तम भाव प्राप्त करें। नजदीकी APMC मंडी का ताजा भाव जानने के लिए अपनी फसल का नाम लिखकर पूछें।`;
    }
    return `🏛️ **Agricultural Schemes & Market Advisory:**\n\n1. **PM-Kisan Samman Nidhi:** ₹6,000 annual direct income support in 3 equal installments.\n2. **PMFBY Crop Insurance:** Comprehensive coverage against natural calamities at minimal premiums (1.5% - 2%).\n3. **Kisan Credit Card (KCC):** Subsidized working capital loans at effective 4% interest rate with prompt repayment.\n4. **e-NAM Integration:** Real-time transparent bidding across national wholesale markets.`;
  }

  // 11. GENERAL / RESILIENT FALLBACK (Customized per language)
  if (isMr) {
    return `🌾 **किसान सल्लागार कृषी मार्गदर्शन (Kisan Salahkar):**\n\nतुमच्या "${q}" या प्रश्नासाठी तज्ज्ञ सल्ला:\n• **पिकाचे आरोग्य:** रोगग्रस्त पाने किंवा फांद्या त्वरित काढून शेताबाहेर नष्ट करा.\n• **सेंद्रिय उपाय:** ५% निंबोळी अर्क किंवा नीम तेल (१०,००० PPM) ३ मि.ली./लिटर पाण्यात मिसळून फवारा.\n• **तज्ज्ञ संपर्क:** अचूक निदानासाठी नजीकच्या कृषी विज्ञान केंद्राशी (KVK) संपर्क साधा किंवा टोल-फ्री १८००-१८०-१५५१ वर कॉल करा.`;
  }

  if (isGu) {
    return `🌾 **ખેડૂત સલાહકાર માર્ગદર્શન (Kisan Salahkar):**\n\nતમારા પ્રશ્ન "${q}" માટે સલાહ:\n• **રોગ નિયંત્રણ:** રોગગ્રસ્ત પાંદડાં તાત્કાલિક દૂર કરી નાશ કરો.\n• **જૈવિક ઉપાય:** લીમડાનું તેલ (Neem Oil) ૩ મિલી/લિટર સાંજે છાંટો.\n• **ખાતર વ્યવસ્થા:** સંતુલિત NPK ખાતર જમીન ચકાસણી મુજબ આપો.\n• **હેલ્પલાઇન:** ૧૮૦૦-૧૮૦-૧૫૫૧ પર સંપર્ક કરો.`;
  }

  if (isBn) {
    return `🌾 **কৃষক উপদেষ্টা নির্দেশিকা (Kisan Salahkar):**\n\nআপনার "${q}" প্রশ্নের সমাধান:\n• **রোগ দমন:** আক্রান্ত পাতা অবিলম্বে কেটে ফেলে দিন।\n• **জৈব নিয়ন্ত্রণ:** নিম তেল (৩ মিলি/লিটার) বিকেলে স্প্রে করুন।\n• **সার ব্যবস্থাপনা:** সুষম NPK সার প্রয়োগ করুন।\n• **হেল্পলাইন:** ১৮০০-১৮০-১৫৫১ নম্বরে যোগাযোগ করুন।`;
  }

  if (isPa) {
    return `🌾 **ਕਿਸਾਨ ਸਲਾਹਕਾਰ ਅਗਵਾਈ (Kisan Salahkar):**\n\nਤੁਹਾਡੇ "${q}" ਸਵਾਲ ਦਾ ਹੱਲ:\n• **ਰੋਗ ਰੋਕਥਾਮ:** ਬਿਮਾਰ ਪੱਤਿਆਂ ਨੂੰ ਤੁਰੰਤ ਖੇਤ ਵਿੱਚੋਂ ਕੱਢ ਦਿਓ।\n• **ਜੈਵਿਕ ਉਪਾਅ:** ਨਿੰਮ ਦਾ ਤੇਲ (੩ ਮਿਲੀਲੀਟਰ/ਲਿਟਰ) ਸ਼ਾਮ ਨੂੰ ਛਿੜਕੋ।\n• **ਖਾਦ ਪ੍ਰਬੰਧਨ:** ਮਿੱਟੀ ਟੈਸਟ ਦੇ ਆਧਾਰ 'ਤੇ ਸੰਤੁਲਿਤ NPK ਪਾਓ।\n• **ਹੈਲਪਲਾਈਨ:** ੧੮੦੦-੧੮੦-੧੫੫੧ 'ਤੇ ਕਾਲ ਕਰੋ।`;
  }

  if (isHi) {
    return `🌾 **किसान सलाहकार कृषि मार्गदर्शन (Kisan Salahkar):**\n\nआपके प्रश्न "${q}" के लिए मुख्य कृषि सिफारिशें:\n• **रोग व कीट रोकथाम:** प्रभावित पत्तियों या पौधों को तुरंत अलग करें और शाम के समय 5% नीम तेल (3-5 मिली/लीटर) का छिड़काव करें।\n• **उर्वरक प्रबंधन:** संतुलित NPK (4:2:1) अपनाएं और रोग की स्थिति में यूरिया का अत्यधिक उपयोग न करें।\n• **सिंचाई ध्यान:** जड़ों में नमी बनाए रखें, दोपहर की तेज धूप में पानी देने से बचें।\n• **विशेषज्ञ सहायता:** अधिक जानकारी के लिए किसान कॉल सेंटर टोल-फ्री **1800-180-1551** पर संपर्क करें या पत्ते की फोटो स्कैन करें।`;
  }

  return `🌾 **Kisan Salahkar Agricultural Advisory:**\n\nRegarding your query "${q}":\n• **Crop Inspection:** Inspect leaf undersides and prune infected foliage.\n• **Organic Care:** Spray Neem Oil 10,000 PPM @ 3ml/L with soapy water during cooler evening hours.\n• **Nutrition:** Balance NPK and ensure proper field drainage.\n• **Direct Support:** Contact Kisan Call Centre toll-free at 1800-180-1551 or scan leaf photo for instant AI diagnosis.`;
}

/**
 * Calls the Python Gemini FAQ bot service (faq_bot.py).
 * Sends the user's question + full chat history to maintain context.
 * Falls back to our rich, specialized multilingual agricultural knowledge engine.
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
      // Do NOT forward raw internal service body — it may contain stack traces or internal hostnames.
      console.error(`[Chatbot] Python service returned HTTP ${res.status}`);
      throw new AppError("Chatbot service returned an error. Please try again later.", 502);
    }

    const data = (await res.json()) as ChatbotResponse;
    if (data && data.answer && data.answer.trim().length > 10) {
      return data;
    }
    throw new Error("Empty response from AI service");
  } catch (error) {
    console.warn("[ChatbotService] Using intelligent built-in agricultural advisory engine.");
    return {
      status: "fallback",
      answer: getIntelligentAdvisory(question, language),
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
