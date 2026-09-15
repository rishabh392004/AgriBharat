'use client'

import React, { useState } from 'react'
import {
  X,
  MessageSquare,
  Camera,
  Sparkles,
  Volume2,
  VolumeX,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  Smartphone,
  Check,
} from 'lucide-react'
import { getWhatsAppDeepLink, WHATSAPP_CONFIG, WHATSAPP_FLOW_STEPS } from '@/config/whatsapp'
import { useI18n } from '@/lib/i18n'

interface WhatsAppGuideModalProps {
  onClose: () => void
}

export const WhatsAppGuideModal: React.FC<WhatsAppGuideModalProps> = ({ onClose }) => {
  const { t, locale } = useI18n()
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const whatsappUrl = getWhatsAppDeepLink()

  const handlePlaySampleVoice = () => {
    if (!('speechSynthesis' in window)) return

    if (isPlayingAudio) {
      window.speechSynthesis.cancel()
      setIsPlayingAudio(false)
      return
    }

    window.speechSynthesis.cancel()

    const sampleText =
      locale === 'hi'
        ? 'नमस्ते किसान भाई। कृषि दर्पण AI ने आपकी गेहूं की पत्ती में गेरुआ रोग पहचाना है। रोकथाम के लिए मैंकोजेब 75% दवा 2 ग्राम प्रति लीटर पानी में मिलाकर 4 बजे के बाद छिड़काव करें।'
        : locale === 'mr'
        ? 'नमस्कार शेतकरी बंधूंनो. कृषी दर्पण AI ने आपल्या गव्हाच्या पानावरील तांबेरा रोग ओळखला आहे. उपचारासाठी मॅन्कोझेब ७५% औषध २ ग्रॅम प्रति लिटर पाण्यात मिसळून फवारावे.'
        : 'Namaste. Krishi Darpan AI detected Leaf Rust in your wheat crop with 94% confidence. Spray Mancozeb 75 WP at 2 grams per litre of water after 4 PM.'

    const utterance = new SpeechSynthesisUtterance(sampleText)
    utterance.lang = locale === 'hi' ? 'hi-IN' : locale === 'mr' ? 'mr-IN' : 'en-IN'
    utterance.rate = 0.95

    utterance.onstart = () => setIsPlayingAudio(true)
    utterance.onend = () => setIsPlayingAudio(false)
    utterance.onerror = () => setIsPlayingAudio(false)

    window.speechSynthesis.speak(utterance)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(10, 26, 17, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if ('speechSynthesis' in window) window.speechSynthesis.cancel()
          onClose()
        }
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 28,
          border: '1.5px solid #25D366',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)',
          maxWidth: 620,
          width: '100%',
          overflow: 'hidden',
          animation: 'fadeIn 200ms ease',
        }}
      >
        {/* Modal Top Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #075E54 0%, #128C7E 100%)',
            color: '#ffffff',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#25D366',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              <MessageSquare size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>
                  Krishi Darpan on WhatsApp
                </h3>
                <span
                  style={{
                    background: '#25D366',
                    color: '#075E54',
                    fontSize: 10,
                    fontWeight: 900,
                    padding: '2px 6px',
                    borderRadius: 4,
                  }}
                >
                  OFFICIAL
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#dcf8c6' }}>
                Zero smartphone barrier • Spoken voice & text diagnosis
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel()
              onClose()
            }}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 0,
              color: '#ffffff',
              borderRadius: '50%',
              width: 34,
              height: 34,
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 24px 20px', maxHeight: '75vh', overflowY: 'auto' }}>
          {/* Explanation Banner */}
          <div
            style={{
              background: '#f0fbf3',
              border: '1px solid #c2ebd0',
              borderRadius: 16,
              padding: '12px 16px',
              marginBottom: 20,
              fontSize: 13,
              color: '#1b3d2a',
              lineHeight: 1.5,
            }}
          >
            <strong>🌾 For farmers with basic phones or who prefer WhatsApp:</strong>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#2d5336' }}>
              No website login required. Send your crop leaf photo to our verified WhatsApp number and receive instant AI diagnosis with a spoken voice note in your native dialect.
            </p>
          </div>

          {/* 4-Step Visual Flow Diagram */}
          <h4 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 800, color: '#1b3d2a' }}>
            How It Works (4 Simple Steps):
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Step 1 */}
            <div
              style={{
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
                background: '#ffffff',
                padding: '12px 16px',
                borderRadius: 16,
                border: '1px solid #e3ede5',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#e8f7ec',
                  color: '#075E54',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                1
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 14, color: '#1b3d2a', display: 'block' }}>
                  {t('whatsappStep1Title')} ({WHATSAPP_CONFIG.displayNumber})
                </strong>
                <span style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>
                  {t('whatsappStep1Desc')}
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div
              style={{
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
                background: '#ffffff',
                padding: '12px 16px',
                borderRadius: 16,
                border: '1px solid #e3ede5',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#e8f7ec',
                  color: '#075E54',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                2
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 14, color: '#1b3d2a', display: 'block' }}>
                  {t('whatsappStep2Title')}
                </strong>
                <span style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>
                  {t('whatsappStep2Desc')}
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div
              style={{
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
                background: '#ffffff',
                padding: '12px 16px',
                borderRadius: 16,
                border: '1px solid #e3ede5',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#e8f7ec',
                  color: '#075E54',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                3
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 14, color: '#1b3d2a', display: 'block' }}>
                  {t('whatsappStep3Title')}
                </strong>
                <span style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>
                  {t('whatsappStep3Desc')}
                </span>
              </div>
            </div>

            {/* Step 4 */}
            <div
              style={{
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
                background: '#ffffff',
                padding: '12px 16px',
                borderRadius: 16,
                border: '1px solid #e3ede5',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#e8f7ec',
                  color: '#075E54',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                4
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 14, color: '#1b3d2a', display: 'block' }}>
                  {t('whatsappStep4Title')}
                </strong>
                <span style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>
                  {t('whatsappStep4Desc')}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Voice Note Demo Card */}
          <div
            style={{
              marginTop: 18,
              background: '#f6fbf7',
              border: '1.5px solid #25D366',
              borderRadius: 18,
              padding: '14px 18px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: '#075E54' }}>
                <Volume2 size={16} />
                <span>{t('sampleVoiceNote')} ({locale.toUpperCase()})</span>
              </div>

              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>0:24 sec</span>
            </div>

            <p style={{ margin: '0 0 10px', fontSize: 12, color: '#2d5336' }}>
              {t('voiceAdvisorySub')}
            </p>

            <button
              type="button"
              onClick={handlePlaySampleVoice}
              style={{
                background: isPlayingAudio ? '#dc2626' : '#075E54',
                color: '#ffffff',
                border: 0,
                padding: '8px 18px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {isPlayingAudio ? <VolumeX size={15} /> : <Volume2 size={15} />}
              <span>{isPlayingAudio ? t('pauseVoice') : `🔊 ${t('playVoice')}`}</span>
            </button>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div
          style={{
            padding: '16px 24px 20px',
            background: '#f8faf7',
            borderTop: '1px solid #e3ede5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>
            Toll-Free: <strong>1800-180-1551</strong>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="ghost"
              onClick={onClose}
              style={{ fontSize: 12, padding: '8px 16px' }}
            >
              {t('cancel')}
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                background: '#25D366',
                color: '#075E54',
                padding: '9px 20px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                textDecoration: 'none',
                boxShadow: '0 2px 10px rgba(37, 211, 102, 0.4)',
              }}
            >
              <span>{t('continueOnWhatsApp')}</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
