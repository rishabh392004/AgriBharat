'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useRef, useState, useEffect } from 'react'
import {
  ArrowLeft,
  ImagePlus,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Bot,
  Globe,
  AlertCircle,
} from 'lucide-react'
import { replyToChat, sendChatMessage } from '@/services/chatbotService'
import { useI18n, Locale, localeLabels } from '@/lib/i18n'
import type { ChatMessage } from '@/types'

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const BCP47_LANG_MAP: Record<Locale, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  pa: 'pa-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  as: 'as-IN',
}

const TOPICS = [
  { id: 'disease', icon: '🐛', labelEn: 'Disease Diagnosis', labelHi: 'रोग पहचान व दवा', labelMr: 'रोग ओळख व औषध', query: 'What disease could affect my crop?' },
  { id: 'fertilizer', icon: '🧪', labelEn: 'NPK & Fertilizer Dosage', labelHi: 'खाद व पोषण मात्रा', labelMr: 'खत व NPK प्रमाण', query: 'What fertilizer and NPK dosage should I use?' },
  { id: 'water', icon: '💧', labelEn: 'Irrigation & Spray Timing', labelHi: 'सिंचाई व छिड़काव समय', labelMr: 'पाणी व फवारणी वेळ', query: 'When should I water and spray my crop?' },
  { id: 'organic', icon: '🌿', labelEn: 'Organic Pest Control', labelHi: 'जैविक कीटनाशक', labelMr: 'सेंद्रिय कीड नियंत्रण', query: 'How can I prevent crop disease with organic neem spray?' },
  { id: 'schemes', icon: '🏛️', labelEn: 'Kisan Schemes & Mandi', labelHi: 'सरकारी योजना व मंडी', labelMr: 'शासकीय योजना व बाजारभाव', query: 'Tell me about PM Kisan and nearby Krishi Kendra support.' },
]

function ChatInner() {
  const { t, locale, setLocale } = useI18n()
  const params = useSearchParams()
  const disease = params.get('disease') || undefined
  const confidence = params.get('confidence')
  const fileRef = useRef<HTMLInputElement>(null)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [activeSuggestions, setActiveSuggestions] = useState<string[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const [isBackendConnected, setIsBackendConnected] = useState(true)
  const [voiceAgentActive, setVoiceAgentActive] = useState(false)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null)

  // Listen and cache speech synthesis voices across browser lifecycle
  useEffect(() => {
    if (typeof window === 'undefined') return
    if ('speechSynthesis' in window) {
      const updateVoices = () => {
        const v = window.speechSynthesis.getVoices()
        if (v && v.length > 0) {
          setAvailableVoices(v)
        }
      }
      updateVoices()
      window.speechSynthesis.onvoiceschanged = updateVoices
    }
  }, [])

  useEffect(() => {
    fetch('/api/backend-status')
      .then((res) => res.json())
      .then((data) => {
        setIsBackendConnected(data?.nodeBackend?.status === 'connected' || data?.chatbotAi?.status === 'connected')
      })
      .catch(() => setIsBackendConnected(false))
  }, [])

  // Opening message dynamically adapting to disease and selected native locale
  const getOpeningText = () => {
    if (disease && confidence) {
      if (locale === 'mr') {
        return `🌾 **पीक स्कॅन निदान:** तुमच्या शेतात **${disease}** (${confidence}% खात्री) चे संकेत आढळले आहेत.\n\nमी तुम्हाला त्वरित करावयाची फवारणी, सेंद्रिय उपाय आणि आवश्यक खबरदारीबद्दल मराठीत मार्गदर्शन करू शकतो.`
      }
      if (locale === 'hi') {
        return `🌾 **हालिया फसल स्कैन रिपोर्ट:** आपके खेत में **${disease}** (${confidence}% सटीकता) के संकेत मिले हैं।\n\nमैं आपको रोग के लक्षण, सही दवा की खुराक, जैविक उपाय और नजदीकी कृषि केंद्र ढूंढने में मदद कर सकता हूँ।`
      }
      if (locale === 'gu') {
        return `🌾 **પાક સ્કેન અહેવાલ:** તમારા ખેતરમાં **${disease}** (${confidence}% ચોકસાઈ) ના સંકેત મળ્યા છે.\n\nહું તમને દવાના છંટકાવ અને જૈવિક ઉપાય વિશે ગુજરાતીમાં માર્ગદર્શન આપી શકું છું.`
      }
      return `🌾 **Recent Crop Diagnostic Alert:** Possible **${disease}** detected with ${confidence}% confidence.\n\nI can guide you with exact chemical spray dosages, organic neem remedies, weather-safe spraying windows, and nearby assistance.`
    }

    const welcomeGreetings: Record<Locale, string> = {
      mr: '🌾 **नमस्कार शेतकरी मित्र!** मी तुमचा **AI व्हॉइस कृषी सल्लागार (Kisan Salahkar)** आहे. पिकावरील रोग, औषध फवारणीचे प्रमाण, खते किंवा पाणी नियोजनाबद्दल मराठीत विचारा किंवा बोला.',
      hi: '🌾 **नमस्ते किसान भाई!** मैं आपका **डिजिटल वॉइस कृषि सलाहकार (Kisan Salahkar)** हूँ। फसल रोग, दवा छिड़काव, खाद और मौसम से जुड़े सवाल पूछें या बोलकर बताएं।',
      en: '🌾 **Welcome to Kisan Salahkar Voice & AI Assistant!** Ask questions about crop diseases, spray dosages, organic treatments, or fertilizers. You can speak or type in any language.',
      gu: '🌾 **નમસ્તે ખેડૂત મિત્ર!** હું તમારો **કૃષિ સહાયક** છું. પાકના રોગ, દવાનો છંટકાવ અને ખાતર વ્યવસ્થાપન વિશે ગુજરાતીમાં પૂછો અથવા બોલો.',
      bn: '🌾 **নমস্কার কৃষক বন্ধু!** আমি আপনার **ডিজিটাল কৃষি উপদেষ্টা**। ফসলের রোগ, সার প্রয়োগ ও সেচ সম্পর্কে যে কোনো প্রশ্ন বাংলায় জিজ্ঞাসা করুন।',
      ta: '🌾 **வணக்கம் விவசாய தோழரே!** நான் உங்கள் **வேளாண் AI உதவியாளர்**. பயிர் நோய்கள், மருந்தளவு மற்றும் உரங்கள் பற்றி தமிழில் கேளுங்கள்.',
      te: '🌾 **రైతు సోదరులకు నమస్కారం!** నేను మీ **డిజిటల్ వ్యవసాయ సలహాదారుని**. పంట తెగుళ్లు, ఎరువులు మరియు మందుల గురించి తెలుగులో అడగండి.',
      pa: '🌾 **ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ!** ਮੈਂ ਤੁਹਾਡਾ **ਖੇਤੀਬਾੜੀ ਸਲਾਹਕਾਰ** ਹਾਂ। ਫ਼ਸਲ ਦੀਆਂ ਬਿਮਾਰੀਆਂ ਅਤੇ ਦਵਾਈਆਂ ਦੀ ਖੁਰਾਕ ਬਾਰੇ ਪੰਜਾਬੀ ਵਿੱਚ ਪੁੱਛੋ।',
      kn: '🌾 **ರೈತ ಮಿತ್ರರಿಗೆ ನಮಸ್ಕಾರ!** ಬೆಳೆ ರೋಗಗಳು ಮತ್ತು ಕೃಷಿ ಸಲಹೆಗಳಿಗಾಗಿ ಕನ್ನಡದಲ್ಲಿ ಕೇಳಿ.',
      ml: '🌾 **കർഷക സുഹൃത്തിന് സ്വാഗതം!** വിള രോഗങ്ങളെക്കുറിച്ചും മരുന്നുകളെക്കുറിച്ചും ചോദിക്കുക.',
      as: '🌾 **নমস্কাৰ কৃষক বন্ধু!** শস্যৰ ৰোগ আৰু কৃষি পৰামৰ্শৰ বাবে অসমীয়াত সোধক।',
    }

    return welcomeGreetings[locale] || welcomeGreetings.en
  }

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'hello', from: 'ai', time: now(), text: getOpeningText() },
  ])

  // Automatically adapt greeting when language changes if no user messages sent yet
  useEffect(() => {
    setMessages((prev) => {
      const hasUserMsg = prev.some((m) => m.from === 'user')
      if (!hasUserMsg) {
        return [{ id: 'hello', from: 'ai', time: now(), text: getOpeningText() }]
      }
      return prev
    })
  }, [locale, disease, confidence])

  // Auto scroll to bottom smoothly
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  // Intelligent Voice Selector with Graceful Regional Fallbacks
  const findBestVoice = (targetLocale: Locale, voiceList: SpeechSynthesisVoice[]) => {
    if (!voiceList || voiceList.length === 0) return null

    const bcp47 = BCP47_LANG_MAP[targetLocale] || 'hi-IN'
    const langPrefix = bcp47.split('-')[0].toLowerCase()

    // 1. Exact match e.g. 'mr-IN' or 'hi-IN'
    let v = voiceList.find((voice) => voice.lang.toLowerCase() === bcp47.toLowerCase())
    if (v) return v

    // 2. Prefix match e.g. 'mr' or 'hi'
    v = voiceList.find((voice) => voice.lang.toLowerCase().startsWith(langPrefix))
    if (v) return v

    // 3. Indian Voice Match with Devanagari Script Fallback:
    // If Windows lacks a dedicated Marathi/Gujarati voice pack, Hindi voices (Heera, Kalpana, Google हिन्दी)
    // read Devanagari Marathi and regional terms with 100% phonetic accuracy.
    const prioritizedKeywords = ['india', 'hindi', 'heera', 'ravi', 'kalpana', 'google']
    for (const kw of prioritizedKeywords) {
      const found = voiceList.find(
        (voice) => voice.name.toLowerCase().includes(kw) || voice.lang.toLowerCase().includes(kw)
      )
      if (found) return found
    }

    // 4. Default system voice
    return voiceList.find((voice) => voice.default) || voiceList[0]
  }

  // Text-To-Speech Reader (Voice Output in Native Accent)
  const speakMessage = (id: string, text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setVoiceNotice('Speech synthesis is not supported in this browser.')
      return
    }

    setVoiceNotice(null)

    // Toggle off if currently speaking this message
    if (speakingId === id) {
      window.speechSynthesis.cancel()
      setSpeakingId(null)
      return
    }

    // Resolve queue freeze on Windows/Chrome
    window.speechSynthesis.cancel()
    window.speechSynthesis.resume()

    const cleanText = text
      .replace(/[*#•_`~\[\]\(\)]/g, ' ')
      .replace(/https?:\/\/\S+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (!cleanText) return

    const utterance = new SpeechSynthesisUtterance(cleanText)
    const voiceList = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices()
    const bestVoice = findBestVoice(locale, voiceList)

    if (bestVoice) {
      utterance.voice = bestVoice
      utterance.lang = bestVoice.lang
    } else {
      utterance.lang = BCP47_LANG_MAP[locale] || 'hi-IN'
    }

    utterance.rate = 0.92
    utterance.pitch = 1.0

    utterance.onstart = () => {
      setSpeakingId(id)
    }

    utterance.onend = () => {
      setSpeakingId(null)
    }

    utterance.onerror = (e) => {
      setSpeakingId(null)
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('Speech synthesis playback notice:', e)
      }
    }

    // Delay 50ms to prevent Chrome race condition
    setTimeout(() => {
      window.speechSynthesis.speak(utterance)
    }, 50)
  }

  // Test Sound trigger
  const testVoice = () => {
    const testPhrases: Record<Locale, string> = {
      mr: 'नमस्कार शेतकरी मित्र! आवाज व्यवस्थित चालू आहे. तुम्ही मराठीत प्रश्न विचारू शकता.',
      hi: 'नमस्ते किसान भाई! आवाज चालू है। आप फसल का कोई भी सवाल पूछ सकते हैं।',
      en: 'Hello farmer! Voice is working clearly. You can ask your question now.',
      gu: 'નમસ્તે ખેડૂત મિત્ર! અવાજ ચાલુ છે. તમે પાક વિશે પૂછી શકો છો.',
      bn: 'নমস্কার কৃষক বন্ধু! ভয়েস চালু আছে। আপনি যে কোনো প্রশ্ন করতে পারেন।',
      ta: 'வணக்கம் விவசாய தோழரே! குரல் சேவை செயல்படுகிறது.',
      te: 'నమస్కారం రైతు సోదరా! వాయిస్ సేవ పనిచేస్తుంది.',
      pa: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! ਆਵਾਜ਼ ਸੇਵਾ ਚੱਲ ਰਹੀ ਹੈ।',
      kn: 'ನಮಸ್ಕಾರ ರೈತ ಮಿತ್ರರೆ! ಧ್ವನಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ.',
      ml: 'നമസ്കാരം കർഷക സുഹൃത്തേ! വോയ്‌സ് സേവനം പ്രവർത്തിക്കുന്നു.',
      as: 'নমস্কাৰ কৃষক বন্ধু! ভইচ সেৱা চলি আছে।',
    }
    speakMessage('test-voice', testPhrases[locale] || testPhrases.en)
  }

  const send = async (text: string, image?: string) => {
    if (!text.trim() && !image) return
    const userMsgText = text || '📷 Crop Image Attached'
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), from: 'user', text: userMsgText, time: now(), image },
    ])
    setInput('')
    setActiveSuggestions([])
    setTyping(true)

    const history = messages.map((m) => ({
      role: (m.from === 'user' ? 'user' : 'model') as 'user' | 'model',
      content: m.text,
    }))

    try {
      const reply = await sendChatMessage(userMsgText, disease, locale, history)
      setTyping(false)
      const msgId = crypto.randomUUID()
      setMessages((m) => [...m, { id: msgId, from: 'ai', text: reply.text, time: now() }])
      if (reply.suggestions && reply.suggestions.length > 0) {
        setActiveSuggestions(reply.suggestions)
      }
      // Auto Voice Agent playback
      if (voiceAgentActive) {
        speakMessage(msgId, reply.text)
      }
    } catch {
      setTyping(false)
      const fallback = replyToChat(userMsgText, disease, locale)
      const msgId = crypto.randomUUID()
      setMessages((m) => [...m, { id: msgId, from: 'ai', text: fallback.text, time: now() }])
      if (voiceAgentActive) {
        speakMessage(msgId, fallback.text)
      }
    }
  }

  // Copy Message to Clipboard
  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1800)
  }

  // Native Multilingual Voice Input (Speech-To-Text)
  const voice = () => {
    const win = window as any
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition
    if (!SpeechRec) {
      setVoiceNotice('Voice recognition is supported in Google Chrome or Microsoft Edge. Please open in Chrome.')
      return
    }

    setVoiceNotice(null)

    if (isListening) {
      if (win.__activeRecognition) {
        win.__activeRecognition.stop()
      }
      setIsListening(false)
      return
    }

    try {
      const rec = new SpeechRec()
      win.__activeRecognition = rec
      rec.continuous = false
      rec.interimResults = false
      rec.lang = BCP47_LANG_MAP[locale] || 'hi-IN'

      setIsListening(true)
      rec.onstart = () => setIsListening(true)
      rec.onend = () => setIsListening(false)
      rec.onerror = (event: any) => {
        setIsListening(false)
        console.warn('Speech recognition error event:', event)
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setVoiceNotice('⚠️ Microphone permission is blocked. Click the 🔒 lock icon in your browser address bar to allow microphone access.')
        } else if (event.error === 'no-speech') {
          setVoiceNotice('No speech was detected. Tap the mic and speak clearly.')
        } else if (event.error === 'network') {
          setVoiceNotice('Speech recognition requires an internet connection (Google Cloud Speech).')
        }
      }

      rec.onresult = (event: any) => {
        setIsListening(false)
        const transcript = event.results?.[0]?.[0]?.transcript
        if (transcript) send(transcript)
      }

      rec.start()
    } catch (err) {
      setIsListening(false)
      setVoiceNotice('Could not start microphone. Please check permissions.')
    }
  }

  return (
    <div className="chat animate-fadeIn">
      {/* Enhanced Chat Header */}
      <div
        className="chat-head"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--line)',
          borderRadius: 20,
          padding: '12px 18px',
          marginBottom: 10,
          boxShadow: '0 4px 16px rgba(43, 122, 77, 0.05)',
        }}
      >
        <Link className="ghost" href="/farmer" style={{ padding: '6px 10px', borderRadius: 10 }}>
          <ArrowLeft size={16} /> {t('back')}
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2b7a4d, #3ca068)',
              color: 'white',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Bot size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h1 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--forest)' }}>
                {t('chatTitle')}
              </h1>
              <span
                className="chip low"
                style={{
                  fontSize: 9,
                  padding: '2px 8px',
                  background: isBackendConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: isBackendConnected ? '#065f46' : '#92400e',
                  border: isBackendConnected ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                <span
                  className="pulse-beacon"
                  style={{ background: isBackendConnected ? '#10b981' : '#f59e0b', marginRight: 4 }}
                />
                {isBackendConnected ? 'Kisan Salahkar AI Online' : 'Local Mode'}
              </span>
            </div>
            <p className="muted" style={{ margin: 0, fontSize: 11 }}>
              {localeLabels[locale]} Voice & Agronomy Advisor • <strong>{BCP47_LANG_MAP[locale]}</strong>
            </p>
          </div>
        </div>

        <div className="chips" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Test Sound Button */}
          <button
            type="button"
            onClick={testVoice}
            className="ghost"
            style={{
              fontSize: 11,
              padding: '6px 10px',
              borderRadius: 999,
              border: '1px solid var(--line)',
              background: speakingId === 'test-voice' ? 'rgba(16, 185, 129, 0.15)' : 'var(--card)',
              color: speakingId === 'test-voice' ? '#065f46' : 'var(--forest)',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
            title="Test speaker sound"
          >
            <Volume2 size={13} />
            <span>{speakingId === 'test-voice' ? 'Speaking...' : 'Test Sound 🔊'}</span>
          </button>

          {/* Voice Agent Toggle Button */}
          <button
            type="button"
            onClick={() => {
              const next = !voiceAgentActive
              setVoiceAgentActive(next)
              if (!next && typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel()
                setSpeakingId(null)
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              borderRadius: 999,
              padding: '6px 12px',
              fontSize: 11.5,
              fontWeight: 750,
              border: voiceAgentActive ? '1.5px solid #10b981' : '1px solid var(--line)',
              background: voiceAgentActive ? 'rgba(16, 185, 129, 0.15)' : 'var(--card)',
              color: voiceAgentActive ? '#065f46' : 'var(--muted)',
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
            title="When active, AI speaks answers aloud in your chosen language"
          >
            {voiceAgentActive ? (
              <>
                <span style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
                  <span style={{ width: 3, height: 10, background: '#10b981', borderRadius: 2 }} />
                  <span style={{ width: 3, height: 14, background: '#10b981', borderRadius: 2 }} />
                  <span style={{ width: 3, height: 8, background: '#10b981', borderRadius: 2 }} />
                </span>
                🎙️ Voice Agent ON
              </>
            ) : (
              <>
                <Volume2 size={13} />
                🎙️ Voice Agent OFF
              </>
            )}
          </button>

          <button
            className="ghost"
            style={{ fontSize: 11, padding: '6px 10px' }}
            onClick={() => {
              setMessages([{ id: 'hello', from: 'ai', time: now(), text: getOpeningText() }])
              setActiveSuggestions([])
            }}
          >
            {t('clear')}
          </button>
        </div>
      </div>

      {/* Voice Warning Notice if Any */}
      {voiceNotice && (
        <div
          style={{
            background: '#fef2f2',
            border: '1.5px solid #ef4444',
            borderRadius: 14,
            padding: '10px 14px',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            color: '#991b1b',
            fontSize: 12.5,
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} />
            <span>{voiceNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setVoiceNotice(null)}
            style={{
              background: 'none',
              border: 0,
              cursor: 'pointer',
              color: '#991b1b',
              fontWeight: 800,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Multilingual Selector Strip */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--line)',
          borderRadius: 16,
          padding: '8px 12px',
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          overflowX: 'auto',
          boxShadow: '0 2px 8px rgba(43, 122, 77, 0.03)',
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 750,
            color: 'var(--forest)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            whiteSpace: 'nowrap',
            paddingRight: 4,
            borderRight: '1px solid var(--line)',
          }}
        >
          <Globe size={13} /> {locale === 'mr' ? 'भाषा निवडा:' : locale === 'hi' ? 'भाषा चुनें:' : 'Language:'}
        </span>
        {(Object.keys(localeLabels) as Locale[]).map((loc) => {
          const isActive = loc === locale
          return (
            <button
              key={loc}
              type="button"
              onClick={() => setLocale(loc)}
              style={{
                border: isActive ? '1.5px solid var(--forest)' : '1px solid var(--line)',
                background: isActive ? 'var(--forest)' : '#ffffff',
                color: isActive ? '#ffffff' : 'var(--ink)',
                borderRadius: 999,
                padding: '4px 10px',
                fontSize: 11.5,
                fontWeight: isActive ? 750 : 550,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isActive ? '0 2px 8px rgba(43, 122, 77, 0.25)' : 'none',
              }}
            >
              {localeLabels[loc]}
            </button>
          )
        })}
      </div>

      {/* Active Voice Listening Banner */}
      {isListening && (
        <div
          style={{
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            border: '1.5px solid #f59e0b',
            borderRadius: 16,
            padding: '10px 16px',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#dc2626',
                color: 'white',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Mic size={18} className="animate-pulse" />
            </div>
            <div>
              <strong style={{ fontSize: 13, color: '#92400e', display: 'block' }}>
                {locale === 'mr'
                  ? 'मराठीत बोला... आवाज रेकॉर्ड होत आहे'
                  : locale === 'hi'
                  ? 'बोलिए... आपकी आवाज सुनी जा रही है'
                  : `Listening in ${localeLabels[locale]} (${BCP47_LANG_MAP[locale]})...`}
              </strong>
              <span style={{ fontSize: 11, color: '#b45309' }}>
                {locale === 'mr'
                  ? 'बोलणे संपल्यावर उत्तर आपोआप मराठीत मिळेल'
                  : 'Speak your farming question naturally'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const win = window as any
              if (win.__activeRecognition) {
                win.__activeRecognition.stop()
              }
              setIsListening(false)
            }}
            style={{
              background: '#ffffff',
              border: '1px solid #f59e0b',
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 700,
              color: '#b45309',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Preset Category Topic Pills */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          paddingBottom: 4,
          marginBottom: 10,
        }}
      >
        {TOPICS.map((topic) => (
          <button
            key={topic.id}
            type="button"
            className="ghost"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--line)',
              borderRadius: 999,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 650,
              whiteSpace: 'nowrap',
              color: 'var(--forest)',
              transition: 'all 160ms ease',
            }}
            onClick={() => send(topic.query)}
          >
            <span>{topic.icon}</span>
            <span>
              {locale === 'mr' ? topic.labelMr : locale === 'hi' ? topic.labelHi : topic.labelEn}
            </span>
          </button>
        ))}
      </div>

      {/* Quick context pills if disease scan is present */}
      {disease && (
        <div className="quick" style={{ margin: '0 0 10px' }}>
          <button className="ghost" onClick={() => send(t('symptoms'))}>
            🔍 {t('symptoms')}
          </button>
          <button className="ghost" onClick={() => send(t('precautions'))}>
            🛡️ {t('precautions')}
          </button>
          <button className="ghost" onClick={() => send(t('nextSteps'))}>
            📋 {t('nextSteps')}
          </button>
          <Link className="ghost" href={`/farmer/help?for=${encodeURIComponent(disease)}`}>
            📍 {t('nearby')}
          </Link>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="bubbles" style={{ padding: '4px 2px' }}>
        {messages.map((msg) => {
          const isAi = msg.from === 'ai'
          const isCurrentlySpeaking = speakingId === msg.id

          return (
            <div
              className={`bubble ${msg.from}`}
              key={msg.id}
              style={{
                position: 'relative',
                animation: 'rise 300ms cubic-bezier(0.16, 1, 0.3, 1) both',
                background: isAi ? '#ffffff' : 'linear-gradient(135deg, #2b7a4d, #35925d)',
                color: isAi ? 'var(--ink)' : '#ffffff',
                border: isAi ? (isCurrentlySpeaking ? '1.5px solid #10b981' : '1px solid var(--line)') : 'none',
                boxShadow: isAi ? '0 4px 14px rgba(43, 122, 77, 0.04)' : '0 6px 18px rgba(43, 122, 77, 0.18)',
                borderRadius: isAi ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                padding: '14px 16px',
              }}
            >
              {isAi && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                    borderBottom: '1px solid #f0e8d8',
                    paddingBottom: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#e9f7ee',
                        color: 'var(--forest)',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 11,
                      }}
                    >
                      🤖
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 750, color: 'var(--forest)' }}>
                      Kisan Salahkar ({localeLabels[locale]})
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button
                      type="button"
                      style={{
                        background: isCurrentlySpeaking ? 'rgba(16, 185, 129, 0.15)' : 'none',
                        border: isCurrentlySpeaking ? '1px solid #10b981' : 0,
                        borderRadius: 6,
                        color: isCurrentlySpeaking ? '#065f46' : 'var(--muted)',
                        cursor: 'pointer',
                        padding: '3px 6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        fontSize: 11,
                        fontWeight: 650,
                      }}
                      title="Read aloud in native language voice"
                      onClick={() => speakMessage(msg.id, msg.text)}
                    >
                      {isCurrentlySpeaking ? (
                        <>
                          <VolumeX size={13} style={{ color: '#065f46' }} />
                          <span>{t('stopAudio')}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={13} />
                          <span>{t('listenAudio')}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 0,
                        color: 'var(--muted)',
                        cursor: 'pointer',
                        padding: 2,
                      }}
                      title="Copy response"
                      onClick={() => copyText(msg.id, msg.text)}
                    >
                      {copiedId === msg.id ? (
                        <Check size={14} style={{ color: 'var(--leaf)' }} />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {msg.image && (
                <img
                  src={msg.image}
                  alt="Crop upload"
                  style={{
                    borderRadius: 12,
                    marginBottom: 8,
                    maxHeight: 220,
                    objectFit: 'cover',
                    width: '100%',
                  }}
                />
              )}

              <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line', fontSize: 14 }}>
                {msg.text}
              </p>

              <small
                style={{
                  display: 'block',
                  textAlign: 'right',
                  marginTop: 6,
                  opacity: 0.7,
                  fontSize: 10,
                }}
              >
                {msg.time}
              </small>
            </div>
          )
        })}

        {/* Animated Typing Indicator */}
        {typing && (
          <div
            className="typing"
            aria-label="AI typing response"
            style={{
              background: 'white',
              border: '1px solid var(--line)',
              borderRadius: 16,
              padding: '10px 14px',
              width: 'fit-content',
            }}
          >
            <i />
            <i />
            <i />
          </div>
        )}

        {/* Dynamic Follow-up Suggestions from AI */}
        {activeSuggestions.length > 0 && !typing && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '8px 0' }}>
            {activeSuggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => send(sug)}
                style={{
                  border: '1px solid var(--line)',
                  background: '#ffffff',
                  borderRadius: 999,
                  padding: '6px 14px',
                  fontSize: 12,
                  color: 'var(--forest)',
                  fontWeight: 650,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(43, 122, 77, 0.05)',
                  animation: 'rise 240ms ease both',
                }}
              >
                💬 {sug}
              </button>
            ))}
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Composer Input Bar */}
      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        style={{
          background: 'var(--card)',
          border: '1.5px solid var(--line)',
          borderRadius: 20,
          padding: '8px 12px',
          boxShadow: '0 6px 20px rgba(43, 122, 77, 0.06)',
        }}
      >
        <button
          type="button"
          className="iconish"
          aria-label={t('attach')}
          onClick={() => fileRef.current?.click()}
          title="Attach crop leaf photo for AI analysis"
        >
          <ImagePlus size={18} />
        </button>
        <input
          ref={fileRef}
          hidden
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (!f) return
            send('📷 Please analyze this crop leaf photo.', URL.createObjectURL(f))
          }}
        />

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            locale === 'mr'
              ? 'मराठीत प्रश्न विचारा किंवा माइक दाबून बोला...'
              : locale === 'hi'
              ? 'हिन्दी में सवाल पूछें या माइक दबाकर बोलें...'
              : `Ask or speak in ${localeLabels[locale]}...`
          }
          style={{ fontSize: 14 }}
        />

        <button
          type="button"
          className={`iconish ${isListening ? 'listening' : ''}`}
          aria-label={t('voice')}
          onClick={voice}
          style={{
            background: isListening ? '#fef2f2' : undefined,
            color: isListening ? '#dc2626' : undefined,
            border: isListening ? '1.5px solid #dc2626' : undefined,
          }}
          title={isListening ? 'Stop listening' : `Speak in ${localeLabels[locale]}`}
        >
          {isListening ? <MicOff size={18} className="animate-pulse" /> : <Mic size={18} />}
        </button>

        <button
          className="btn btn-primary"
          style={{
            width: 'auto',
            padding: '10px 16px',
            borderRadius: 14,
          }}
          aria-label={t('send')}
        >
          <Send size={16} />
        </button>
      </form>

      <p className="note" style={{ marginTop: 10 }}>
        <Sparkles size={12} /> Kisan Salahkar Multilingual Voice Agent • Active Voice Language:{' '}
        <strong>{localeLabels[locale]} ({BCP47_LANG_MAP[locale]})</strong> • Powered by Krishi Darpan Agronomy Engine
      </p>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatInner />
    </Suspense>
  )
}
