'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  MessageSquare,
  Camera,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ShieldCheck,
  CheckCheck,
  Smartphone,
  ExternalLink,
  RotateCcw,
  Languages,
  FileText,
  PhoneCall,
  Headphones,
  CheckCircle2,
  Layers,
  Info,
  Bot,
  Sprout,
} from 'lucide-react'
import { getWhatsAppDeepLink, WHATSAPP_CONFIG } from '@/config/whatsapp'
import { CROPS, CROP_METADATA } from '@/services/cropService'
import { predictionsByCrop } from '@/data/mock'
import { useI18n } from '@/lib/i18n'

interface SimulatedMessage {
  id: string
  sender: 'user' | 'bot'
  time: string
  type: 'text' | 'image' | 'voice' | 'card'
  text?: string
  imageUrl?: string
  crop?: string
  disease?: string
  confidence?: number
  severity?: string
}

export default function WhatsAppPage() {
  const { t, locale } = useI18n()
  const [selectedCrop, setSelectedCrop] = useState<string>('Wheat')
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [farmerInput, setFarmerInput] = useState('')
  const [copiedWebhook, setCopiedWebhook] = useState(false)
  const [messages, setMessages] = useState<SimulatedMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      time: '10:00 AM',
      type: 'text',
      text: '🙏 **Namaste / Welcome to Krishi Darpan Official AI Helpline!**\n\n📸 Simply **send a photo of your diseased leaf or crop**, and receive instant diagnosis, ICAR spray recipe, and a voice advisory in your mother tongue.',
    },
  ])

  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    }
  }, [])

  const playVoice = (text: string) => {
    if (!('speechSynthesis' in window)) return

    if (isPlayingAudio) {
      window.speechSynthesis.cancel()
      setIsPlayingAudio(false)
      return
    }

    window.speechSynthesis.cancel()

    const clean = text.replace(/\*\*/g, '').replace(/[#•]/g, '')
    const utterance = new SpeechSynthesisUtterance(clean)
    utterance.lang = locale === 'hi' ? 'hi-IN' : locale === 'mr' ? 'mr-IN' : 'en-IN'
    utterance.rate = 0.95

    utterance.onstart = () => setIsPlayingAudio(true)
    utterance.onend = () => setIsPlayingAudio(false)
    utterance.onerror = () => setIsPlayingAudio(false)

    window.speechSynthesis.speak(utterance)
  }

  // Simulate sending a leaf photo via WhatsApp
  const handleSendLeafPhoto = () => {
    if (isTyping) return
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const base = predictionsByCrop[selectedCrop] ?? predictionsByCrop.Wheat
    const meta = CROP_METADATA[selectedCrop as keyof typeof CROP_METADATA]

    const userMsg: SimulatedMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      time: now,
      type: 'image',
      imageUrl: base.imageUrl || meta?.image,
      text: `Crop: ${selectedCrop}. Leaf photo from field. Please diagnose in ${locale.toUpperCase()}.`,
    }

    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const advisoryText =
        locale === 'hi'
          ? `🌾 **कृषि दर्पण AI निदान (${selectedCrop}):**\n\n• **रोग:** ${base.disease}\n• **आत्मविश्वास:** ${base.confidence}%\n• **गंभीरता:** ${base.severity}\n\n📋 **ICAR उपचार खुराक:**\n1. ${base.actions[0]}\n2. ${base.precautions[0]}`
          : locale === 'mr'
          ? `🌾 **कृषी दर्पण AI निदान (${selectedCrop}):**\n\n• **रोग:** ${base.disease}\n• **विश्वास:** ${base.confidence}%\n• **तीव्रता:** ${base.severity}\n\n📋 **उपचार सल्ला:**\n1. ${base.actions[0]}\n2. ${base.precautions[0]}`
          : `🌾 **Krishi Darpan AI Diagnosis (${selectedCrop}):**\n\n• **Disease:** ${base.disease}\n• **Confidence:** ${base.confidence}%\n• **Severity:** ${base.severity}\n\n📋 **ICAR Recommended Action:**\n1. ${base.actions[0]}\n2. ${base.precautions[0]}`

      const botReply: SimulatedMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        time: botTime,
        type: 'card',
        text: advisoryText,
        crop: selectedCrop,
        disease: base.disease,
        confidence: base.confidence,
        severity: base.severity,
      }

      setMessages((prev) => [...prev, botReply])
      playVoice(`Diagnosis for ${selectedCrop}: ${base.disease} with ${base.confidence} percent confidence. ${base.actions[0]}.`)
    }, 1400)
  }

  // Farmer sends custom text
  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault()
    if (!farmerInput.trim() || isTyping) return

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: SimulatedMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      time: now,
      type: 'text',
      text: farmerInput.trim(),
    }

    setMessages((prev) => [...prev, userMsg])
    setFarmerInput('')
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const botReply: SimulatedMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        time: botTime,
        type: 'text',
        text: `🌱 **Krishi Darpan Advisory:**\nFor best results, apply protective spray during the cool evening hours (after 4:00 PM). Avoid spraying before rain showers. For more field assistance, call toll-free **1800-180-1551**.`,
      }
      setMessages((prev) => [...prev, botReply])
    }, 900)
  }

  const liveWhatsAppUrl = getWhatsAppDeepLink(undefined, selectedCrop)

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ── Integration Status Panel ─────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: 20,
          padding: '18px 22px',
          border: '1.5px solid #334155',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Live Production Webhook Ready
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>
                Next.js Serverless Twilio Endpoint Active
              </div>
            </div>
          </div>

          {/* Copy Webhook Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)' }}>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#93c5fd' }}>
              https://agri-bharat-pgpc.vercel.app/api/whatsapp/webhook
            </span>
            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== 'undefined') {
                  navigator.clipboard.writeText('https://agri-bharat-pgpc.vercel.app/api/whatsapp/webhook')
                  setCopiedWebhook(true)
                  setTimeout(() => setCopiedWebhook(false), 2000)
                }
              }}
              style={{
                background: copiedWebhook ? '#22c55e' : '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {copiedWebhook ? '✓ Copied!' : 'Copy Webhook URL'}
            </button>
          </div>
        </div>

        {/* Status Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          {[
            { label: 'Interactive Demo Simulator', status: '✅ Live', color: '#22c55e', desc: 'Full chat & voice simulation running below' },
            { label: 'Serverless Webhook', status: '✅ Live on Vercel', color: '#22c55e', desc: 'POST /api/whatsapp/webhook active' },
            { label: 'ML → WhatsApp Pipeline', status: '✅ Ready', color: '#22c55e', desc: 'ResNet-34 + ICAR spray recipe chain active' },
            { label: 'Twilio WhatsApp Number', status: '✅ Verified', color: '#22c55e', desc: '+1 (415) 523-8886 (Twilio Sandbox)' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                padding: '10px 12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#cbd5e1' }}>{item.label}</span>
                <span style={{ fontSize: 10, fontWeight: 800, color: item.color }}>{item.status}</span>
              </div>
              <p style={{ margin: 0, fontSize: 10, color: '#64748b', lineHeight: 1.4 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Activation Guide Accordion ───────────────────────────────────── */}
      <div
        style={{
          background: '#f0fdf4',
          border: '1.5px solid #86efac',
          borderRadius: 16,
          padding: '16px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={18} color="#16a34a" />
            <strong style={{ fontSize: 13, color: '#15803d' }}>
              Final 2 Steps to Connect WhatsApp
            </strong>
          </div>
          <a
            href="https://console.twilio.com/us1/develop/sms/settings/whatsapp-sandbox"
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#047857',
              textDecoration: 'underline',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>Open Twilio WhatsApp Sandbox Settings</span>
            <ExternalLink size={12} />
          </a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
          {[
            {
              step: '1',
              title: 'Opt-in from your WhatsApp',
              desc: 'Message +1 415 523 8886 on WhatsApp with your sandbox join code (e.g. join <your-keyword>) from Twilio Console.',
              color: '#2563eb',
            },
            {
              step: '2',
              title: 'Paste Webhook URL in Twilio',
              desc: 'In Twilio Sandbox Settings, paste https://agri-bharat-pgpc.vercel.app/api/whatsapp/webhook into "WHEN A MESSAGE COMES IN" and click Save.',
              color: '#059669',
            },
            {
              step: '3',
              title: 'Send Leaf Photo',
              desc: 'Send any diseased crop photo to +1 415 523 8886. You will instantly receive the AI diagnosis, spray dosage, and precautions!',
              color: '#7c3aed',
            },
          ].map((s) => (
            <div key={s.step} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: s.color,
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 12,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {s.step}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{s.title}</div>
                <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.4 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          background: 'linear-gradient(135deg, #075E54 0%, #128C7E 100%)',
          borderRadius: 24,
          padding: '24px 28px',
          color: '#ffffff',
          boxShadow: '0 8px 30px rgba(7, 94, 84, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span
              style={{
                background: '#25D366',
                color: '#075E54',
                fontSize: 10,
                fontWeight: 900,
                padding: '3px 8px',
                borderRadius: 999,
                textTransform: 'uppercase',
              }}
            >
              Zero-App Access
            </span>
            <span style={{ fontSize: 12, color: '#dcf8c6' }}>
              WhatsApp Fallback Channel • Kisan IVR 1800-180-1551
            </span>
          </div>

          <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(22px, 3.5vw, 30px)', color: '#ffffff' }}>
            Krishi Darpan on WhatsApp (व्हाट्सएप सेवा)
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: '#e7fadc', maxWidth: 620, lineHeight: 1.5 }}>
            Designed for small & marginal farmers who prefer WhatsApp or have basic phones.
            Send a leaf photo directly to our official WhatsApp Business number to receive AI diagnosis, spray recipes, and voice notes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a
            href={liveWhatsAppUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              background: '#25D366',
              color: '#075E54',
              padding: '10px 18px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)',
            }}
          >
            <MessageSquare size={16} />
            <span>{t('launchWhatsAppLive')}</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* 2-Column Layout: Leaf Selector & Interactive Simulator */}
      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Left: Interactive Controls */}
        <div className="space-y-4">
          <section className="card">
            <h3 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 800 }}>
              1. Choose Leaf to Simulate Sending
            </h3>
            <p className="muted" style={{ margin: '0 0 14px', fontSize: 12 }}>
              Select a crop leaf sample to test how the WhatsApp AI channel classifies and replies:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
              {CROPS.slice(0, 8).map((c) => {
                const isSelected = selectedCrop === c
                const meta = CROP_METADATA[c]
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCrop(c)}
                    style={{
                      background: isSelected ? '#eef7ec' : '#ffffff',
                      border: isSelected ? '2px solid #2b7a4d' : '1px solid #dce8dd',
                      borderRadius: 12,
                      padding: '8px 6px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                  >
                    <img
                      src={meta?.image}
                      alt={c}
                      style={{ width: '100%', height: 55, objectFit: 'cover', borderRadius: 8, marginBottom: 4 }}
                    />
                    <strong style={{ fontSize: 11, display: 'block', color: '#1b3d2a' }}>{c}</strong>
                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>{predictionsByCrop[c]?.disease || 'Healthy'}</span>
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{
                marginTop: 16,
                background: '#25D366',
                borderColor: '#25D366',
                color: '#075E54',
                fontWeight: 800,
                fontSize: 14,
              }}
              onClick={handleSendLeafPhoto}
              disabled={isTyping}
            >
              <Camera size={16} />
              <span>Simulate Sending {selectedCrop} Photo</span>
            </button>
          </section>

          {/* 4-Step Diagram */}
          <section className="card">
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 800, color: '#1b3d2a' }}>
              WhatsApp Channel Architecture:
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f8faf7', borderRadius: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#e8f7ec', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Camera size={16} color="#1b432a" />
                </div>
                <div>
                  <strong>{t('farmerSendsPhoto')}</strong>
                  <div className="muted" style={{ fontSize: 11 }}>{t('viaWhatsAppHelpline')}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f8faf7', borderRadius: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#e8f7ec', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Bot size={16} color="#1b432a" />
                </div>
                <div>
                  <strong>{t('visionAiAnalyzes')}</strong>
                  <div className="muted" style={{ fontSize: 11 }}>{t('gradCamRecognition')}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f8faf7', borderRadius: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#e8f7ec', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Sprout size={16} color="#1b432a" />
                </div>
                <div>
                  <strong>{t('icarDosageCalculated')}</strong>
                  <div className="muted" style={{ fontSize: 11 }}>{t('knapsackMixingRatios')}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f8faf7', borderRadius: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#e8f7ec', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Volume2 size={16} color="#1b432a" />
                </div>
                <div>
                  <strong>{t('voiceAdvisoryDispatched')}</strong>
                  <div className="muted" style={{ fontSize: 11 }}>{t('spokenAudioMotherTongue')}</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right: Simulated WhatsApp Chat Window */}
        <div>
          <div
            style={{
              background: '#E5DDD5',
              borderRadius: 24,
              border: '1.5px solid #c4c4c4',
              boxShadow: '0 12px 36px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              height: 580,
            }}
          >
            {/* WhatsApp Top Header Bar */}
            <div
              style={{
                background: '#075E54',
                color: '#ffffff',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: '#ffffff',
                    color: '#075E54',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 800,
                    fontSize: 16,
                  }}
                >
                  🌿
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <strong style={{ fontSize: 14 }}>Krishi Darpan Official AI</strong>
                    <span style={{ fontSize: 11, color: '#25D366' }}>✓</span>
                  </div>
                  <small style={{ fontSize: 10, color: '#dcf8c6' }}>online • +91 800-KRISHI-01</small>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMessages([
                    {
                      id: 'm1',
                      sender: 'bot',
                      time: '10:00 AM',
                      type: 'text',
                      text: '🙏 **Namaste / Welcome to Krishi Darpan Official AI Helpline!**\n\n📸 Simply **send a photo of your diseased leaf or crop**, and receive instant diagnosis, ICAR spray recipe, and a voice advisory in your mother tongue.',
                    },
                  ])
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
                }}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 0,
                  color: '#ffffff',
                  borderRadius: 8,
                  padding: '5px 10px',
                  fontSize: 11,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>

            {/* Chat Body */}
            <div
              style={{
                flex: 1,
                padding: '14px 16px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {messages.map((m) => {
                const isUser = m.sender === 'user'
                return (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: isUser ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      background: isUser ? '#E7FFDB' : '#ffffff',
                      color: '#111827',
                      padding: '10px 14px',
                      borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                      fontSize: 12,
                      lineHeight: 1.5,
                      position: 'relative',
                    }}
                  >
                    {m.imageUrl && (
                      <img
                        src={m.imageUrl}
                        alt="Leaf"
                        style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 10, marginBottom: 6 }}
                      />
                    )}

                    <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>

                    {m.type === 'card' && (
                      <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px solid #e3ede5', display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => m.text && playVoice(m.text)}
                          style={{
                            background: '#075E54',
                            color: '#ffffff',
                            border: 0,
                            borderRadius: 8,
                            padding: '5px 10px',
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Volume2 size={12} />
                          <span>Play Spoken Voice Note</span>
                        </button>
                      </div>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 3,
                        marginTop: 4,
                        fontSize: 9,
                        color: 'var(--muted)',
                      }}
                    >
                      <span>{m.time}</span>
                      {isUser && <CheckCheck size={12} className="text-sky-500" />}
                    </div>
                  </div>
                )
              })}

              {isTyping && (
                <div
                  style={{
                    alignSelf: 'flex-start',
                    background: '#ffffff',
                    padding: '8px 14px',
                    borderRadius: 14,
                    fontSize: 11,
                    color: '#075E54',
                    fontStyle: 'italic',
                  }}
                >
                  Krishi Darpan AI is analyzing leaf image...
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Bottom Composer */}
            <form
              onSubmit={handleSendText}
              style={{
                background: '#F0F2F5',
                padding: '10px 12px',
                display: 'flex',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <button
                type="button"
                onClick={handleSendLeafPhoto}
                style={{
                  background: 'none',
                  border: 0,
                  color: '#54656F',
                  cursor: 'pointer',
                  padding: 6,
                }}
                title="Send Leaf Photo"
              >
                <Camera size={20} />
              </button>

              <input
                type="text"
                placeholder="Type a crop query or send leaf photo..."
                value={farmerInput}
                onChange={(e) => setFarmerInput(e.target.value)}
                style={{
                  flex: 1,
                  background: '#ffffff',
                  border: '1px solid #d1d7db',
                  borderRadius: 20,
                  padding: '8px 14px',
                  fontSize: 12,
                  outline: 'none',
                }}
              />

              <button
                type="submit"
                style={{
                  background: '#00A884',
                  border: 0,
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
