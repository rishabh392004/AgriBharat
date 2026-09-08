'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useMemo, useRef, useState, useEffect } from 'react'
import {
  ArrowLeft,
  ImagePlus,
  Mic,
  MicOff,
  Send,
  Sparkles,
  MapPin,
  CheckCircle2,
  Volume2,
  Copy,
  Check,
  Bot,
  User,
  ShieldCheck,
  Sprout,
  Droplets,
  HelpCircle,
} from 'lucide-react'
import { replyToChat } from '@/services/chatbotService'
import { useI18n, Locale } from '@/lib/i18n'
import type { ChatMessage } from '@/types'

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const TOPICS = [
  { id: 'disease', icon: '🐛', labelEn: 'Disease Diagnosis', labelHi: 'रोग पहचान व दवा', query: 'What disease could affect my crop?' },
  { id: 'fertilizer', icon: '🧪', labelEn: 'NPK & Fertilizer Dosage', labelHi: 'खाद व पोषण मात्रा', query: 'What fertilizer and NPK dosage should I use?' },
  { id: 'water', icon: '💧', labelEn: 'Irrigation & Spray Timing', labelHi: 'सिंचाई व छिड़काव समय', query: 'When should I water and spray my crop?' },
  { id: 'organic', icon: '🌿', labelEn: 'Organic Pest Control', labelHi: 'जैविक कीटनाशक', query: 'How can I prevent crop disease with organic neem spray?' },
  { id: 'schemes', icon: '🏛️', labelEn: 'Kisan Schemes & Mandi', labelHi: 'सरकारी योजना व मंडी', query: 'Tell me about PM Kisan and nearby Krishi Kendra support.' },
]

function ChatInner() {
  const { t, locale } = useI18n()
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

  // Opening message dynamically adapting to disease and locale
  const getOpeningText = () => {
    if (disease && confidence) {
      if (locale === 'hi') {
        return `🌾 **हालिया फसल स्कैन रिपोर्ट:** आपके खेत में **${disease}** (${confidence}% सटीकता) के संकेत मिले हैं।\n\nमैं आपको रोग के लक्षण, सही दवा की खुराक, जैविक उपाय और नजदीकी कृषि केंद्र ढूंढने में मदद कर सकता हूँ। नीचे दिए गए विकल्पों में से चुनें या अपना प्रश्न पूछें।`
      }
      if (locale === 'mr') {
        return `🌾 **पीक स्कॅन निदान:** तुमच्या शेतात **${disease}** (${confidence}% खात्री) चे संकेत आढळले आहेत.\n\nमी तुम्हाला त्वरित करावयाची फवारणी, जैविक उपचार आणि आवश्यक खबरदारीबद्दल मार्गदर्शन करू शकतो.`
      }
      return `🌾 **Recent Crop Diagnostic Alert:** Possible **${disease}** detected with ${confidence}% confidence.\n\nI can guide you with exact chemical spray dosages, organic neem remedies, weather-safe spraying windows, and nearby assistance.`
    }
    return t('chatHello')
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

  // Animated reply effect
  const streamAiResponse = (fullText: string, suggestions?: string[]) => {
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      const msgId = crypto.randomUUID()
      setMessages((m) => [...m, { id: msgId, from: 'ai', text: fullText, time: now() }])
      if (suggestions && suggestions.length > 0) {
        setActiveSuggestions(suggestions)
      } else {
        setActiveSuggestions([
          locale === 'hi' ? 'दवा की सही मात्रा क्या है?' : 'What is the dosage?',
          locale === 'hi' ? 'जैविक उपाय बताएं' : 'Organic remedy',
          locale === 'hi' ? 'नजदीकी दुकान ढूंढें' : 'Find nearby center',
        ])
      }
    }, 450)
  }

  const send = (text: string, image?: string) => {
    if (!text.trim() && !image) return
    const userMsgText = text || '📷 Crop Image Attached'
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), from: 'user', text: userMsgText, time: now(), image },
    ])
    setInput('')
    setActiveSuggestions([])

    const reply = replyToChat(userMsgText, disease, locale)
    streamAiResponse(reply.text, reply.suggestions)
  }

  // Text-To-Speech Reader
  const speakMessage = (id: string, text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    if (speakingId === id) {
      window.speechSynthesis.cancel()
      setSpeakingId(null)
      return
    }

    window.speechSynthesis.cancel()
    const cleanText = text.replace(/[*#•]/g, '')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    const langMap: Record<Locale, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
      bn: 'bn-IN',
      gu: 'gu-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      pa: 'pa-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      as: 'as-IN',
    }
    utterance.lang = langMap[locale] || 'hi-IN'
    utterance.rate = 0.95

    utterance.onend = () => setSpeakingId(null)
    utterance.onerror = () => setSpeakingId(null)

    setSpeakingId(id)
    window.speechSynthesis.speak(utterance)
  }

  // Copy Message to Clipboard
  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1800)
  }

  // Multilingual Voice Input
  const voice = () => {
    const win = window as any
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition
    if (!SpeechRec) {
      setInput(t('voiceStop'))
      return
    }

    try {
      const rec = new SpeechRec()
      rec.continuous = false
      rec.interimResults = false

      const langMap: Record<Locale, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        mr: 'mr-IN',
        bn: 'bn-IN',
        gu: 'gu-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        pa: 'pa-IN',
        kn: 'kn-IN',
        ml: 'ml-IN',
        as: 'as-IN',
      }
      rec.lang = langMap[locale] || 'hi-IN'

      setIsListening(true)
      rec.onstart = () => setIsListening(true)
      rec.onend = () => setIsListening(false)
      rec.onerror = () => setIsListening(false)

      rec.onresult = (event: any) => {
        setIsListening(false)
        const transcript = event.results?.[0]?.[0]?.transcript
        if (transcript) send(transcript)
      }

      rec.start()
    } catch {
      setIsListening(false)
      setInput(t('voiceStop'))
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
          marginBottom: 12,
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
              <span className="chip low" style={{ fontSize: 9, padding: '1px 6px' }}>
                <span className="pulse-beacon" style={{ background: '#347044', marginRight: 4 }} />
                Online
              </span>
            </div>
            <p className="muted" style={{ margin: 0, fontSize: 11 }}>
              {t('chatSub')} • <strong>{locale.toUpperCase()}</strong>
            </p>
          </div>
        </div>

        <div className="chips" style={{ marginLeft: 'auto' }}>
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
          <button
            className="ghost"
            style={{ fontSize: 11, padding: '6px 10px' }}
            onClick={() => {
              setMessages([{ id: crypto.randomUUID(), from: 'ai', time: now(), text: getOpeningText() }])
              setActiveSuggestions([])
            }}
          >
            {t('newChat')}
          </button>
        </div>
      </div>

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
            <span>{locale === 'hi' ? topic.labelHi : topic.labelEn}</span>
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
          return (
            <div
              className={`bubble ${msg.from}`}
              key={msg.id}
              style={{
                position: 'relative',
                animation: 'rise 300ms cubic-bezier(0.16, 1, 0.3, 1) both',
                background: isAi ? '#ffffff' : 'linear-gradient(135deg, #2b7a4d, #35925d)',
                color: isAi ? 'var(--ink)' : '#ffffff',
                border: isAi ? '1px solid var(--line)' : 'none',
                boxShadow: isAi ? '0 4px 14px rgba(43, 122, 77, 0.04)' : '0 6px 18px rgba(43, 122, 77, 0.18)',
                borderRadius: isAi ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                padding: '14px 16px',
              }}
            >
              {isAi && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, borderBottom: '1px solid #f0e8d8', paddingBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#e9f7ee', color: 'var(--forest)', display: 'grid', placeItems: 'center', fontSize: 11 }}>
                      🤖
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 750, color: 'var(--forest)' }}>Krishi AI</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button
                      type="button"
                      style={{ background: 'none', border: 0, color: 'var(--muted)', cursor: 'pointer', padding: 2 }}
                      title="Read aloud in your language"
                      onClick={() => speakMessage(msg.id, msg.text)}
                    >
                      <Volume2 size={14} style={{ color: speakingId === msg.id ? 'var(--forest)' : undefined }} />
                    </button>
                    <button
                      type="button"
                      style={{ background: 'none', border: 0, color: 'var(--muted)', cursor: 'pointer', padding: 2 }}
                      title="Copy response"
                      onClick={() => copyText(msg.id, msg.text)}
                    >
                      {copiedId === msg.id ? <Check size={14} style={{ color: 'var(--leaf)' }} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              )}

              {msg.image && (
                <img
                  src={msg.image}
                  alt="Crop upload"
                  style={{ borderRadius: 12, marginBottom: 8, maxHeight: 220, objectFit: 'cover', width: '100%' }}
                />
              )}

              <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line', fontSize: 14 }}>
                {msg.text}
              </p>

              <small style={{ display: 'block', textAlign: 'right', marginTop: 6, opacity: 0.7, fontSize: 10 }}>
                {msg.time}
              </small>
            </div>
          )
        })}

        {/* Animated Typing Indicator */}
        {typing && (
          <div className="typing" aria-label="AI typing response" style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 16, padding: '10px 14px', width: 'fit-content' }}>
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
          placeholder={t('askPlaceholder')}
          style={{ fontSize: 14 }}
        />

        <button
          type="button"
          className={`iconish ${isListening ? 'listening' : ''}`}
          aria-label={t('voice')}
          onClick={voice}
          style={{
            background: isListening ? '#f7dfd4' : undefined,
            color: isListening ? '#a4462f' : undefined,
          }}
          title={isListening ? 'Listening...' : 'Speak in your language'}
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
        <Sparkles size={12} /> Krishi AI Assistant • Active Language: <strong>{locale.toUpperCase()}</strong> • Powered by KrishiRakshak Agronomy Engine
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
