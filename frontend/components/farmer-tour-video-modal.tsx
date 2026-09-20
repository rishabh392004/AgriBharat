'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  ChevronRight,
  ChevronLeft,
  Camera,
  Bot,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Globe2,
  HelpCircle,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export type VoiceLanguage = 'hi' | 'en' | 'mr' | 'pa' | 'bn'

interface DemoStep {
  id: string
  title: Record<VoiceLanguage, string>
  narration: Record<VoiceLanguage, string>
  speechText: Record<VoiceLanguage, string>
  badge: string
  icon: typeof Camera
  highlightFeature: string
  uiPreviewType: 'scan' | 'crop_select' | 'ai_chat' | 'passport' | 'help_map'
}

const DEMO_STEPS: DemoStep[] = [
  {
    id: 'welcome',
    badge: 'Step 1 • Getting Started',
    icon: Sparkles,
    title: {
      en: 'Welcome to Krishi Darpan',
      hi: 'कृषि दर्पण में आपका स्वागत है',
      mr: 'कृषी दर्पण मध्ये आपले स्वागत आहे',
      pa: 'ਕ੍ਰਿਸ਼ੀ ਦਰਪਣ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ',
      bn: 'কৃষি দর্পণে আপনাকে স্বাগতম',
    },
    narration: {
      en: 'Krishi Darpan is your personal AI crop care companion. You can scan infected crop leaves, chat with Krishi AI in your local language, track health with a tamper-evident Crop Health Passport, and find nearby agricultural centers instantly.',
      hi: 'कृषि दर्पण आपका व्यक्तिगत एआई फसल साथी है। आप बीमार पत्तियों को स्कैन कर सकते हैं, अपनी भाषा में कृषि एआई से बात कर सकते हैं, डिजिटल क्रॉप पासपोर्ट देख सकते हैं और नजदीकी कृषि सेवा केंद्र खोज सकते हैं।',
      mr: 'कृषी दर्पण हा आपला वैयक्तिक एआय पीक साथीदार आहे. आपण आजारी पाने स्कॅन करू शकता, स्वतःच्या भाषेत कृषी एआय शी बोलू शकता, डिजिटल क्रॉप हेल्थ पासपोर्ट मिळवू शकता आणि जवळील कृषी केंद्र शोधू शकता.',
      pa: 'ਕ੍ਰਿਸ਼ੀ ਦਰਪਣ ਤੁਹਾਡਾ ਨਿੱਜੀ ਏਆਈ ਫ਼ਸਲ ਸਾਥੀ ਹੈ। ਤੁਸੀਂ ਬਿਮਾਰ ਪੱਤਿਆਂ ਨੂੰ ਸਕੈਨ ਕਰ ਸਕਦੇ ਹੋ, ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਏਆਈ ਨਾਲ ਗੱਲ ਕਰ ਸਕਦੇ ਹੋ ਅਤੇ ਨੇੜਲੇ ਖੇਤੀਬਾੜੀ ਕੇਂਦਰ ਲੱਭ ਸਕਦੇ ਹੋ।',
      bn: 'কৃষি দর্পণ আপনার নিজস্ব এআই ফসল সুরক্ষা সহায়ক। এখানে আপনি রোগের পাতা স্ক্যান করতে পারেন, নিজের ভাষায় কৃষি এআই এর সাথে কথা বলতে পারেন এবং নিকটস্থ কৃষি কেন্দ্র খুঁজে পেতে পারেন।',
    },
    speechText: {
      en: 'Welcome to Krishi Darpan. Your personal AI companion to detect crop diseases and protect yields.',
      hi: 'कृषि दर्पण में आपका स्वागत है। अपनी फसल को रोगों से बचाने के लिए यह आपका स्मार्ट एआई साथी है।',
      mr: 'कृषी दर्पण मध्ये आपले स्वागत आहे. पिकांचे रोग वेळीच ओळखून संरक्षण करण्यासाठी हा आपला स्मार्ट साथीदार आहे.',
      pa: 'ਕ੍ਰਿਸ਼ੀ ਦਰਪਣ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ। ਆਪਣੀ ਫ਼ਸਲ ਨੂੰ ਰੋਗਾਂ ਤੋਂ ਬਚਾਉਣ ਲਈ ਇਹ ਤੁਹਾਡਾ ਸਮਾਰਟ ਸਾਥੀ ਹੈ।',
      bn: 'কৃষি দর্পণে স্বাগতম। ফসলের রোগ শনাক্ত করতে এবং সুরক্ষা দিতে এটি আপনার নির্ভরযোগ্য সহকারী।',
    },
    highlightFeature: 'Dashboard & Multilingual Companion',
    uiPreviewType: 'crop_select',
  },
  {
    id: 'how_to_scan',
    badge: 'Step 2 • Camera & Scanning',
    icon: Camera,
    title: {
      en: 'How to Scan an Infected Leaf',
      hi: 'फसल की पत्ती को कैसे स्कैन करें',
      mr: 'पिकाचे पान कसे स्कॅन करावे',
      pa: 'ਫ਼ਸਲ ਦੇ ਪੱਤੇ ਨੂੰ ਕਿਵੇਂ ਸਕੈਨ ਕਰੀਏ',
      bn: 'আক্রান্ত পাতা কীভাবে স্ক্যান করবেন',
    },
    narration: {
      en: 'Go to the Scan tab. Select your crop from 16 verified varieties like Wheat, Rice, or Tomato. Tap "Open Live Camera" or upload a clear photo in good daylight. Make sure the diseased spot is centered inside the reticle frame, then tap Analyze.',
      hi: 'स्कैन पेज पर जाएं। गेहूँ, धान, टमाटर जैसी 16 फसलों में से अपनी फसल चुनें। लाइव कैमरा खोलें या दिन की रोशनी में साफ फोटो खींचें। धब्बे को फ्रेम के बीच में रखें और विश्लेषण पर क्लिक करें।',
      mr: 'स्कॅन पेजवर जा. गहू, भात, टोमॅटो यांसारख्या 16 पिकांमधून आपले पीक निवडा. थेट कॅमेरा उघडा किंवा दिवसाच्या प्रकाशात फोटो काढा. पानाचा रोगट भाग फ्रेमच्या मध्यभागी ठेवून विश्लेषण बटण दाबा.',
      pa: 'ਸਕੈਨ ਪੰਨੇ ਤੇ ਜਾਓ। ਕਣਕ, ਝੋਨਾ, ਟਮਾਟਰ ਵਿੱਚੋਂ ਆਪਣੀ ਫ਼ਸਲ ਚੁਣੋ। ਲਾਈਵ ਕੈਮਰਾ ਖੋਲ੍ਹੋ ਜਾਂ ਸਾਫ਼ ਫੋਟੋ ਲਓ ਅਤੇ ਵਿਸ਼ਲੇਸ਼ਣ ਬਟਨ ਦਬਾਓ।',
      bn: 'স্ক্যান পেজে যান। গম, ধান, টমেটো সহ ১৬টি ফসলের মধ্য থেকে আপনার ফসল নির্বাচন করুন। পরিষ্কার আলোয় পাতার ছবি তুলুন এবং বিশ্লেষণ বাটনে চাপুন।',
    },
    speechText: {
      en: 'Go to Scan. Select your crop, center the diseased leaf under daylight, and tap Analyze for instant AI detection.',
      hi: 'स्कैन पर जाएं। अपनी फसल चुनें, दिन के उजाले में पत्ती की साफ फोटो लें और तुरंत एआई परिणाम के लिए विश्लेषण पर टैप करें।',
      mr: 'स्कॅनवर जा. आपले पीक निवडा, दिवसाच्या उजेडात पानाचा स्पष्ट फोटो घ्या आणि तात्काळ परिणामासाठी विश्लेषण वर टॅप करा.',
      pa: 'ਸਕੈਨ ਤੇ ਜਾਓ। ਆਪਣੀ ਫ਼ਸਲ ਚੁਣੋ, ਪੱਤੇ ਦੀ ਸਾਫ਼ ਫੋਟੋ ਲਓ ਅਤੇ ਤੁਰੰਤ ਨਤੀਜੇ ਲਈ ਵਿਸ਼ਲੇਸ਼ਣ ਤੇ ਟੈਪ ਕਰੋ।',
      bn: 'স্ক্যানে যান। ফসল নির্বাচন করুন, পরিষ্কার ছবি তুলুন এবং দ্রুত ফলাফলের জন্য বিশ্লেষণ নির্বাচন করুন।',
    },
    highlightFeature: 'AI Leaf Diagnosis & ICAR Recommendations',
    uiPreviewType: 'scan',
  },
  {
    id: 'ai_assistant',
    badge: 'Step 3 • AI Krishi Assistant',
    icon: Bot,
    title: {
      en: 'Ask Krishi AI Anything in Your Voice',
      hi: 'कृषि एआई से बोलकर या लिखकर पूछें',
      mr: 'कृषी एआय ला बोलून किंवा लिहून प्रश्न विचारा',
      pa: 'ਕ੍ਰਿਸ਼ੀ ਏਆਈ ਨੂੰ ਬੋਲ ਕੇ ਜਾਂ ਲਿਖ ਕੇ ਸਵਾਲ ਪੁੱਛੋ',
      bn: 'কৃষি এআই কে কথা বলে বা লিখে প্রশ্ন করুন',
    },
    narration: {
      en: 'Have questions about spray dosage, organic treatments, or fertilizer timing? Tap the AI Assistant. You can speak into your microphone or type in Hindi, Marathi, Punjabi, or English to get instant agronomist-verified answers.',
      hi: 'दवा की मात्रा, जैविक कीटनाशक या खाद के समय को लेकर कोई भी सवाल हो, कृषि एआई पर जाएं। माइक दबाकर अपनी भाषा में बोलें या टाइप करें, आपको तुरंत वैज्ञानिक सलाह मिलेगी।',
      mr: 'औषधांची मात्रा, सेंद्रिय उपाय किंवा खतांच्या वेळांबद्दल प्रश्न असल्यास कृषी एआय उघडा. माइक दाबून मराठीत बोला किंवा टाइप करा, आपल्याला अचूक कृषी सल्ला मिळेल.',
      pa: 'ਕੀਟਨਾਸ਼ਕ ਦੀ ਮਾਤਰਾ ਜਾਂ ਦੇਸੀ ਉਪਾਅ ਬਾਰੇ ਕੋਈ ਵੀ ਸਵਾਲ ਹੋਵੇ, ਏਆਈ ਸਹਾਇਕ ਖੋਲ੍ਹੋ। ਮਾਈਕ ਰਾਹੀਂ ਬੋਲ ਕੇ ਪੁੱਛੋ ਅਤੇ ਤੁਰੰਤ ਸਹੀ ਜਵਾਬ ਪ੍ਰਾਪਤ ਕਰੋ।',
      bn: 'কীটনাশকের সঠিক মাত্রা বা জৈব প্রতিকার জানতে এআই সহকারী খুলুন। মাইকে কথা বলুন বা লিখুন, তাৎক্ষণিক বৈজ্ঞানিক সমাধান পাবেন।',
    },
    speechText: {
      en: 'Tap AI Assistant to ask spray dosages, prevention tips, or organic remedies in your regional language.',
      hi: 'दवा की मात्रा या जैविक उपायों के लिए कृषि एआई पर माइक दबाकर अपनी भाषा में पूछें।',
      mr: 'औषध फवारणी आणि सेंद्रिय उपायांसाठी कृषी एआय ला आपल्या मातृभाषेत बोलून विचारा.',
      pa: 'ਦਵਾਈਆਂ ਅਤੇ ਦੇਸੀ ਉਪਾਵਾਂ ਬਾਰੇ ਜਾਣਨ ਲਈ ਏਆਈ ਸਹਾਇਕ ਨਾਲ ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਗੱਲ ਕਰੋ।',
      bn: 'কীটনাশক বা জৈব পরামর্শের জন্য এআই সহকারীর সাথে নিজের ভাষায় কথা বলুন।',
    },
    highlightFeature: 'Voice-First Multilingual Agricultural Intelligence',
    uiPreviewType: 'ai_chat',
  },
  {
    id: 'passport',
    badge: 'Step 4 • Crop Health Passport',
    icon: ShieldCheck,
    title: {
      en: 'Digital Crop Health Passport & Verification',
      hi: 'डिजिटल क्रॉप हेल्थ पासपोर्ट और क्यूआर सत्यापन',
      mr: 'डिजिटल पीक आरोग्य पासपोर्ट आणि क्यूआर पडताळणी',
      pa: 'ਡਿਜੀਟਲ ਫ਼ਸਲ ਹੈਲਥ ਪਾਸਪੋਰਟ ਅਤੇ ਕਿਊਆਰ ਤਸਦੀਕ',
      bn: 'ডিজিটাল ক্রপ হেলথ পাসপোর্ট ও কিউআর যাচাই',
    },
    narration: {
      en: 'Every scan and officer diagnosis is recorded on your official Crop Health Passport. You can download an ICAR-compliant PDF report, or share your QR verification link with bank officers for crop loans or buyers in mandis to prove your crop quality.',
      hi: 'आपके हर स्कैन और कृषि अधिकारी के निरीक्षण का रिकॉर्ड क्रॉप हेल्थ पासपोर्ट में सुरक्षित रहता है। आप पीडीएफ रिपोर्ट डाउनलोड कर सकते हैं या बैंक लोन और मंडी में खरीदारों को क्यूआर कोड दिखाकर फसल की गुणवत्ता साबित कर सकते हैं।',
      mr: 'प्रत्येक स्कॅन आणि कृषी अधिकाऱ्यांच्या तपासणीचा अहवाल क्रॉप हेल्थ पासपोर्टमध्ये नोंदवला जातो. आपण पीडीएफ डाउनलोड करू शकता किंवा बँक कर्ज आणि बाजारात व्यापाऱ्यांना क्यूआर कोड दाखवून पिकाची उच्च गुणवत्ता सिद्ध करू शकता.',
      pa: 'ਹਰੇਕ ਸਕੈਨ ਦਾ ਰਿਕਾਰਡ ਤੁਹਾਡੇ ਫ਼ਸਲ ਹੈਲਥ ਪਾਸਪੋਰਟ ਵਿੱਚ ਸੁਰੱਖਿਅਤ ਰਹਿੰਦਾ ਹੈ। ਤੁਸੀਂ ਬੈਂਕ ਲੋਨ ਜਾਂ ਮੰਡੀ ਲਈ ਪੀਡੀਐਫ ਜਾਂ ਕਿਊਆਰ ਕੋਡ ਸਾਂਝਾ ਕਰ ਸਕਦੇ ਹੋ।',
      bn: 'আপনার প্রতিটি স্ক্যান ও অফিসারের পরামর্শ ক্রপ হেলথ পাসপোর্টে লিপিবদ্ধ থাকে। ব্যাংক লোন বা মান্ডিতে প্রমাণের জন্য পিডিএফ বা কিউআর কোড ব্যবহার করুন।',
    },
    speechText: {
      en: 'Your tamper-evident Crop Health Passport proves field health for bank loans and mandi sales with a verifiable QR code.',
      hi: 'क्रॉप हेल्थ पासपोर्ट आपके खेत का डिजिटल प्रमाण पत्र है, जिसे आप बैंक लोन या मंडी में क्यूआर कोड से सत्यापित कर सकते हैं।',
      mr: 'क्रॉप हेल्थ पासपोर्ट हे आपल्या शेतीचे डिजिटल प्रमाणपत्र आहे, ज्याद्वारे बँक कर्ज व बाजारात क्यूआर कोडद्वारे पडताळणी होते.',
      pa: 'ਫ਼ਸਲ ਹੈਲਥ ਪਾਸਪੋਰਟ ਨਾਲ ਬੈਂਕ ਲੋਨ ਅਤੇ ਮੰਡੀ ਵਿੱਚ ਕਿਊਆਰ ਕੋਡ ਰਾਹੀਂ ਆਪਣੀ ਫ਼ਸਲ ਦੀ ਸਿਹਤ ਸਾਬਤ ਕਰੋ।',
      bn: 'ক্রপ হেলথ পাসপোর্টের কিউআর কোড দ্বারা ব্যাংক লোন এবং হাটে ফসলের গুণমান সহজেই প্রমাণ করুন।',
    },
    highlightFeature: 'Government & Mandi Shareable Agronomic Ledger',
    uiPreviewType: 'passport',
  },
  {
    id: 'nearby_help',
    badge: 'Step 5 • Nearby Help & KVKs',
    icon: MapPin,
    title: {
      en: 'Nearby Agricultural Centers & Direct Help',
      hi: 'नजदीकी कृषि विज्ञान केंद्र और त्वरित सहायता',
      mr: 'जवळील कृषी विज्ञान केंद्र आणि थेट मदत',
      pa: 'ਨੇੜਲੇ ਖੇਤੀਬਾੜੀ ਕੇਂਦਰ ਅਤੇ ਸਿੱਧੀ ਸਹਾਇਤਾ',
      bn: 'নিকটস্থ কৃষি বিজ্ঞান কেন্দ্র ও সহায়তা',
    },
    narration: {
      en: 'Need physical support or subsidized fertilizers? Tap Nearby Help. The interactive GIS map locates Krishi Vigyan Kendras, certified pesticide stores, and taluka agriculture offices with direct calling and GPS navigation.',
      hi: 'दवा, बीज या कृषि अधिकारी से प्रत्यक्ष सहायता चाहिए? नजदीकी सहायता (Nearby Help) पर टैप करें। यह जीपीएस मैप आपके नजदीकी केवीके, प्रमाणित दवा दुकानों और तालुका कृषि कार्यालयों का फोन नंबर और रास्ता दिखाता है।',
      mr: 'औषधे, खते किंवा कृषी अधिकाऱ्यांची प्रत्यक्ष मदत हवी असल्यास जवळील मदत (Nearby Help) वर टॅप करा. हे जीआयएस नकाशावर जवळचे कृषी विज्ञान केंद्र, कृषी सेवा केंद्र आणि त्यांचे फोन नंबर दाखवते.',
      pa: 'ਦਵਾਈਆਂ ਜਾਂ ਮਾਹਰਾਂ ਦੀ ਲੋੜ ਹੋਵੇ ਤਾਂ ਨੇੜਲੇ ਕੇਂਦਰਾਂ ਤੇ ਟੈਪ ਕਰੋ। ਜੀਪੀਐਸ ਨਕਸ਼ੇ ਰਾਹੀਂ ਨੇੜਲੇ ਕੇਵੀਕੇ ਅਤੇ ਦੁਕਾਨਾਂ ਦੇ ਨੰਬਰ ਅਤੇ ਰਸਤਾ ਲੱਭੋ।',
      bn: 'কীটনাশক বা কৃষি কর্মকর্তার সরাসরি সহায়তা দরকার? নিকটস্থ সহায়তা বিভাগে যান। জিপিএস মানচিত্রের মাধ্যমে কৃষি বিজ্ঞান কেন্দ্র ও দোকানের ঠিকানা এবং ফোন নম্বর পান।',
    },
    speechText: {
      en: 'Find certified Krishi Vigyan Kendras, certified pesticide shops, and taluka offices near your farm with direct calling.',
      hi: 'नजदीकी सहायता में अपने खेत के पास स्थित कृषि विज्ञान केंद्र, प्रमाणित खाद-बीज दुकान और अधिकारियों के नंबर तुरंत पाएं।',
      mr: 'जवळील मदत विभागात आपल्या शेताजवळ असणारी कृषी विज्ञान केंद्रे, अधिकृत दुकाने आणि त्यांचे फोन नंबर त्वरित मिळवा.',
      pa: 'ਆਪਣੇ ਖੇਤ ਨੇੜੇ ਪ੍ਰਮਾਣਿਤ ਖੇਤੀ ਕੇਂਦਰਾਂ ਅਤੇ ਦੁਕਾਨਾਂ ਦੇ ਫ਼ੋਨ ਨੰਬਰ ਅਤੇ ਰਸਤਾ ਤੁਰੰਤ ਪ੍ਰਾਪਤ ਕਰੋ।',
      bn: 'নিকটস্থ সহায়তায় আপনার খামারের কাছের অনুমোদিত কৃষি কেন্দ্র ও সার-কীটনাশকের দোকানের ফোন নম্বর পান।',
    },
    highlightFeature: 'GIS Offline-Ready Agricultural Directory',
    uiPreviewType: 'help_map',
  },
]

const VOICE_OPTIONS: { code: VoiceLanguage; label: string; bcp47: string; flag: string }[] = [
  { code: 'hi', label: 'हिन्दी (Hindi)', bcp47: 'hi-IN', flag: '🇮🇳' },
  { code: 'en', label: 'English (Indian Accent)', bcp47: 'en-IN', flag: '🌐' },
  { code: 'mr', label: 'मराठी (Marathi)', bcp47: 'mr-IN', flag: '🌾' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)', bcp47: 'pa-IN', flag: '🚜' },
  { code: 'bn', label: 'বাংলা (Bengali)', bcp47: 'bn-IN', flag: '🍃' },
]

// Intelligent voice selector with graceful Indian voice fallback
function findBestVoiceForLang(bcp47: string, voiceList: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voiceList || voiceList.length === 0) return null
  const langPrefix = bcp47.split('-')[0].toLowerCase()

  // 1. Exact match e.g. 'hi-IN'
  let v = voiceList.find((voice) => voice.lang.toLowerCase() === bcp47.toLowerCase())
  if (v) return v

  // 2. Prefix match e.g. 'hi' matches 'hi-IN', 'hi-IN-x-google'
  v = voiceList.find((voice) => voice.lang.toLowerCase().startsWith(langPrefix))
  if (v) return v

  // 3. For Devanagari languages (mr, hi), try Hindi voices as they read Marathi correctly
  if (langPrefix === 'mr' || langPrefix === 'hi') {
    const devanagariKeywords = ['heera', 'kalpana', 'ravi', 'hindi', 'india']
    for (const kw of devanagariKeywords) {
      const found = voiceList.find((voice) =>
        voice.name.toLowerCase().includes(kw) || voice.lang.toLowerCase().includes('hi')
      )
      if (found) return found
    }
  }

  // 4. Any Indian accent voice as ultimate fallback
  const indianFallback = voiceList.find((voice) =>
    voice.lang.toLowerCase().includes('-in') ||
    voice.name.toLowerCase().includes('india') ||
    voice.name.toLowerCase().includes('hindi')
  )
  if (indianFallback) return indianFallback

  return voiceList.find((v) => v.default) || voiceList[0]
}

export function FarmerTourVideoModal({
  isOpen,
  onClose,
  initialStepIndex = 0,
}: {
  isOpen: boolean
  onClose: () => void
  initialStepIndex?: number
}) {
  const { locale } = useI18n()
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStepIndex)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [voiceLang, setVoiceLang] = useState<VoiceLanguage>(() => {
    if (['hi', 'mr', 'pa', 'bn'].includes(locale)) return locale as VoiceLanguage
    return 'hi'
  })
  const [progress, setProgress] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const voiceListRef = useRef<SpeechSynthesisVoice[]>([])

  // Pre-load voice list (async in some browsers)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const load = () => {
      const v = window.speechSynthesis.getVoices()
      if (v.length > 0) voiceListRef.current = v
    }
    load()
    window.speechSynthesis.onvoiceschanged = load
  }, [])

  const step = DEMO_STEPS[currentStepIndex] || DEMO_STEPS[0]
  const stepDuration = 9000 // 9 seconds per step animation

  // Text-To-Speech execution with intelligent voice selection
  const speakStep = (stepItem: DemoStep, lang: VoiceLanguage) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()

    if (isMuted) return

    const textToSpeak = stepItem.speechText[lang] || stepItem.speechText.en
    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    utteranceRef.current = utterance

    const langConfig = VOICE_OPTIONS.find((v) => v.code === lang)
    const bcp47 = langConfig?.bcp47 || 'hi-IN'
    utterance.lang = bcp47
    utterance.rate = lang === 'en' ? 0.92 : 0.88
    utterance.pitch = 1.05

    // Intelligent voice selection: exact → prefix → Indian fallback
    const voices = voiceListRef.current.length > 0
      ? voiceListRef.current
      : window.speechSynthesis.getVoices()
    const bestVoice = findBestVoiceForLang(bcp47, voices)
    if (bestVoice) {
      utterance.voice = bestVoice
      utterance.lang = bestVoice.lang
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = (e) => {
      setIsSpeaking(false)
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('Tour TTS error:', e.error)
      }
    }

    // Small delay to prevent Chrome race condition
    setTimeout(() => window.speechSynthesis.speak(utterance), 60)
  }

  // Handle step change
  useEffect(() => {
    if (!isOpen) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      return
    }

    setProgress(0)
    speakStep(step, voiceLang)

    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)

    if (isPlaying) {
      const stepIntervalMs = 100
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            // Advance to next step or loop
            if (currentStepIndex < DEMO_STEPS.length - 1) {
              setCurrentStepIndex((curr) => curr + 1)
            } else {
              setIsPlaying(false)
            }
            return 0
          }
          return prev + (stepIntervalMs / stepDuration) * 100
        })
      }, stepIntervalMs)
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [isOpen, currentStepIndex, voiceLang, isPlaying, isMuted])

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const handleNext = () => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1)
    } else {
      setCurrentStepIndex(0)
    }
  }

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1)
    }
  }

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false)
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.pause()
      }
    } else {
      setIsPlaying(true)
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume()
        } else {
          speakStep(step, voiceLang)
        }
      }
    }
  }

  const toggleMute = () => {
    if (!isMuted) {
      setIsMuted(true)
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    } else {
      setIsMuted(false)
      speakStep(step, voiceLang)
    }
  }

  if (!isOpen) return null

  // ---------- MINIMIZED BOTTOM BAR ----------
  if (isMinimized) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: 'rgba(9, 22, 14, 0.97)',
          backdropFilter: 'blur(14px)',
          borderTop: '1.5px solid rgba(232, 200, 104, 0.5)',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
        }}
      >
        {/* Left: Play/pause + current step info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={togglePlay}
            type="button"
            style={{
              background: '#e8c868',
              border: 0,
              color: '#122c1d',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: '#e8c868', fontWeight: 700 }}>
              {step.badge} — {isPlaying ? '▶ Playing' : '⏸ Paused'}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: '#fff', fontWeight: 600 }}>
              {step.title[voiceLang] || step.title.en}
            </p>
          </div>
        </div>

        {/* Center: progress bar */}
        <div style={{ flex: 1, maxWidth: 400, height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 99, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${((currentStepIndex + progress / 100) / DEMO_STEPS.length) * 100}%`,
              background: 'linear-gradient(90deg, #34d399, #e8c868)',
              transition: 'width 0.1s linear',
            }}
          />
        </div>

        {/* Right: expand + close */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setIsMinimized(false)}
            type="button"
            style={{
              background: 'rgba(232, 200, 104, 0.15)',
              border: '1px solid rgba(232,200,104,0.4)',
              color: '#e8c868',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ↑ Expand Guide
          </button>
          <button
            onClick={onClose}
            type="button"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: 0,
              color: '#9ca3af',
              borderRadius: '50%',
              width: 30,
              height: 30,
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(7, 18, 11, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          background: '#0d2216',
          border: '1px solid rgba(232, 200, 104, 0.35)',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 40px rgba(46, 125, 50, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            background: 'rgba(255, 255, 255, 0.04)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #e8c868, #2e7d32)',
                display: 'grid',
                placeItems: 'center',
                color: '#0d2216',
                flexShrink: 0,
              }}
            >
              <Play size={16} fill="#0d2216" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, color: '#fefefe', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                Krishi Darpan • Interactive Audio-Visual Guide
                <span
                  style={{
                    background: isSpeaking ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    color: isSpeaking ? '#34d399' : '#d1d5db',
                    fontSize: 10,
                    padding: '2px 8px',
                    borderRadius: 99,
                    border: '1px solid rgba(255,255,255,0.15)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: isSpeaking ? '#34d399' : '#9ca3af',
                      animation: isSpeaking ? 'pulse 1s infinite' : 'none',
                    }}
                  />
                  {isSpeaking ? 'Narrating Live Voice' : 'Voice Ready'}
                </span>
              </h3>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255, 255, 255, 0.55)' }}>
                Step-by-step interactive walkthrough • {DEMO_STEPS.length} steps
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* Voice Language Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Globe2 size={14} style={{ color: '#e8c868', flexShrink: 0 }} />
              <select
                value={voiceLang}
                onChange={(e) => {
                  const next = e.target.value as VoiceLanguage
                  setVoiceLang(next)
                  // Immediately re-speak in the new language
                  setTimeout(() => speakStep(step, next), 80)
                }}
                style={{
                  background: 'rgba(232, 200, 104, 0.12)',
                  border: '1px solid rgba(232, 200, 104, 0.5)',
                  color: '#e8c868',
                  borderRadius: 10,
                  padding: '5px 10px',
                  fontSize: 12,
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {VOICE_OPTIONS.map((v) => (
                  <option key={v.code} value={v.code} style={{ background: '#122c1d', color: '#e8c868' }}>
                    {v.flag} {v.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimize button */}
            <button
              onClick={() => setIsMinimized(true)}
              type="button"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.7)',
                width: 30,
                height: 30,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 700,
              }}
              title="Minimize to bar (continue browsing)"
            >
              ↓
            </button>

            <button
              onClick={onClose}
              type="button"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 0,
                color: '#fff',
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
              }}
              title="Close Guide"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Video / Animated Simulation Screen */}
        <div
          style={{
            position: 'relative',
            height: 'clamp(280px, 42vw, 420px)',
            background: 'radial-gradient(circle at center, #163824 0%, #08160e 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            padding: '24px',
          }}
        >
          {/* Subtle Grid Background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
          />

          {/* Interactive Screen Simulation according to step */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              width: '100%',
              maxWidth: 680,
              background: 'rgba(10, 25, 16, 0.85)',
              border: '1.5px solid rgba(232, 200, 104, 0.4)',
              borderRadius: 20,
              padding: '22px',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: 'rgba(232, 200, 104, 0.15)',
                    border: '1px solid rgba(232, 200, 104, 0.3)',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#e8c868',
                  }}
                >
                  <step.icon size={20} />
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#e8c868', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {step.badge}
                  </span>
                  <h2 style={{ margin: 0, fontSize: 18, color: '#ffffff' }}>
                    {step.title[voiceLang] || step.title.en}
                  </h2>
                </div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  background: 'rgba(46, 125, 50, 0.3)',
                  color: '#86efac',
                  padding: '4px 10px',
                  borderRadius: 99,
                  fontWeight: 600,
                  border: '1px solid rgba(74, 222, 128, 0.25)',
                }}
              >
                {step.highlightFeature}
              </span>
            </div>

            {/* Dynamic Interactive UI Simulation Box */}
            <div
              style={{
                minHeight: 140,
                background: 'rgba(0, 0, 0, 0.35)',
                borderRadius: 14,
                border: '1px solid rgba(255, 255, 255, 0.06)',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {step.uiPreviewType === 'scan' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, width: '100%', justifyContent: 'space-around' }}>
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 14,
                      border: '2px dashed #e8c868',
                      position: 'relative',
                      display: 'grid',
                      placeItems: 'center',
                      background: 'rgba(232, 200, 104, 0.05)',
                    }}
                  >
                    <Camera size={36} style={{ color: '#e8c868', opacity: 0.8 }} />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 4,
                        border: '1px solid rgba(232,200,104,0.4)',
                        borderRadius: 10,
                        animation: 'pulse 2s infinite',
                      }}
                    />
                    <span style={{ position: 'absolute', bottom: 6, fontSize: 9, color: '#e8c868', fontWeight: 700 }}>
                      VIEWFINDER
                    </span>
                  </div>
                  <div style={{ display: 'grid', gap: 6, flex: 1, maxWidth: 320 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#86efac', fontSize: 13, fontWeight: 650 }}>
                      <CheckCircle2 size={16} /> 1. Daylight Leaf Photography
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#86efac', fontSize: 13, fontWeight: 650 }}>
                      <CheckCircle2 size={16} /> 2. Hold Phone 15cm from Leaf
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#86efac', fontSize: 13, fontWeight: 650 }}>
                      <CheckCircle2 size={16} /> 3. Instant AI Detection (94% Accuracy)
                    </div>
                  </div>
                </div>
              )}

              {step.uiPreviewType === 'crop_select' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                  {['🌾 Wheat', '🌾 Rice', '🍅 Tomato', '🥔 Potato', '🌽 Maize', '🍌 Banana', '☁️ Cotton'].map((c, i) => (
                    <div
                      key={c}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 12,
                        background: i === 0 ? 'rgba(232, 200, 104, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                        border: i === 0 ? '1.5px solid #e8c868' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: i === 0 ? '#e8c868' : '#e5e7eb',
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {c}
                    </div>
                  ))}
                </div>
              )}

              {step.uiPreviewType === 'ai_chat' && (
                <div style={{ width: '100%', display: 'grid', gap: 10 }}>
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      borderRadius: 12,
                      padding: '10px 14px',
                      fontSize: 13,
                      color: '#d1d5db',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <Bot size={18} style={{ color: '#34d399' }} />
                    <span>&quot;नमस्ते किसान भाई! गेहूँ में पीलापन है तो क्या करें?&quot;</span>
                  </div>
                  <div
                    style={{
                      background: 'rgba(52, 211, 153, 0.12)',
                      border: '1px solid rgba(52, 211, 153, 0.3)',
                      borderRadius: 12,
                      padding: '10px 14px',
                      fontSize: 13,
                      color: '#a7f3d0',
                    }}
                  >
                    🌱 <b>Krishi AI:</b> यह पीला रतुआ (Yellow Rust) हो सकता है। प्रोपिकोनाजोल 25% EC का 1ml प्रति लीटर पानी में छिड़काव करें।
                  </div>
                </div>
              )}

              {step.uiPreviewType === 'passport' && (
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <span style={{ fontSize: 11, color: '#e8c868', textTransform: 'uppercase', fontWeight: 800 }}>
                      Kharif 2026 Season Certificate
                    </span>
                    <h4 style={{ margin: '2px 0 0', color: '#fff', fontSize: 15 }}>Verified Crop Health Passport</h4>
                    <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                      Official Officer Seal: Dr. Sanjay Deshmukh (Taluka Agriculture Officer)
                    </p>
                  </div>
                  <div
                    style={{
                      padding: '8px 14px',
                      borderRadius: 12,
                      background: '#15803d',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <ShieldCheck size={16} /> Official QR Certified
                  </div>
                </div>
              )}

              {step.uiPreviewType === 'help_map' && (
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                  <div style={{ display: 'grid', gap: 4 }}>
                    <strong style={{ color: '#fff', fontSize: 14 }}>📍 Krishi Vigyan Kendra, Nashik</strong>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Distance: 4.8 km • Open Today till 5:00 PM</span>
                    <span style={{ color: '#86efac', fontSize: 12 }}>📞 Free Expert Call: +91 253 2501234</span>
                  </div>
                  <div
                    style={{
                      background: 'rgba(232, 200, 104, 0.2)',
                      border: '1px solid #e8c868',
                      color: '#e8c868',
                      padding: '6px 12px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    Get GPS Directions
                  </div>
                </div>
              )}
            </div>

            {/* Narration Caption */}
            <p
              style={{
                margin: 0,
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: 14,
                lineHeight: 1.55,
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '10px 14px',
                borderRadius: 12,
                borderLeft: '3px solid #e8c868',
              }}
            >
              {step.narration[voiceLang] || step.narration.en}
            </p>
          </div>
        </div>

        {/* Video Progress Bar */}
        <div style={{ height: 4, width: '100%', background: 'rgba(255, 255, 255, 0.1)', position: 'relative' }}>
          <div
            style={{
              height: '100%',
              width: `${((currentStepIndex + progress / 100) / DEMO_STEPS.length) * 100}%`,
              background: 'linear-gradient(90deg, #34d399, #e8c868)',
              transition: 'width 0.1s linear',
            }}
          />
        </div>

        {/* Bottom Playback & Step Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 22px',
            background: 'rgba(255, 255, 255, 0.03)',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {/* Play/Pause/Mute */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={togglePlay}
              type="button"
              style={{
                background: '#e8c868',
                border: 0,
                color: '#122c1d',
                borderRadius: 99,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 750,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              <span>{isPlaying ? 'Pause' : 'Play Tour'}</span>
            </button>

            <button
              onClick={toggleMute}
              type="button"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                borderRadius: 99,
                padding: '8px 12px',
                fontSize: 12,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span>{isMuted ? 'Muted' : 'Voice On'}</span>
            </button>

            <button
              onClick={() => {
                setCurrentStepIndex(0)
                setProgress(0)
                setIsPlaying(true)
              }}
              type="button"
              style={{
                background: 'transparent',
                border: 0,
                color: 'rgba(255, 255, 255, 0.65)',
                fontSize: 12,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <RotateCcw size={14} /> Restart
            </button>
          </div>

          {/* Stepper Dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {DEMO_STEPS.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setCurrentStepIndex(idx)
                  setProgress(0)
                }}
                style={{
                  width: currentStepIndex === idx ? 28 : 10,
                  height: 10,
                  borderRadius: 99,
                  background: currentStepIndex === idx ? '#e8c868' : 'rgba(255,255,255,0.2)',
                  border: 0,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                title={`Step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Prev / Next Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              type="button"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 0,
                color: '#fff',
                borderRadius: 10,
                padding: '8px 12px',
                fontSize: 12,
                fontWeight: 600,
                cursor: currentStepIndex === 0 ? 'not-allowed' : 'pointer',
                opacity: currentStepIndex === 0 ? 0.4 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <ChevronLeft size={16} /> Back
            </button>

            <button
              onClick={handleNext}
              type="button"
              style={{
                background: 'rgba(46, 125, 50, 0.8)',
                border: '1px solid rgba(74, 222, 128, 0.3)',
                color: '#fff',
                borderRadius: 10,
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>{currentStepIndex === DEMO_STEPS.length - 1 ? 'Start Over' : 'Next Step'}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
