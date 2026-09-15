'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  MessageSquare,
  ArrowRight,
  ExternalLink,
  Volume2,
  Sparkles,
  Camera,
  ShieldCheck,
  CheckCircle2,
  Info,
} from 'lucide-react'
import { getWhatsAppDeepLink, WHATSAPP_CONFIG } from '@/config/whatsapp'
import { useI18n } from '@/lib/i18n'
import { WhatsAppGuideModal } from './WhatsAppGuideModal'

interface WhatsAppBannerProps {
  className?: string
  compact?: boolean
}

export const WhatsAppBanner: React.FC<WhatsAppBannerProps> = ({
  className = '',
  compact = false,
}) => {
  const { t } = useI18n()
  const [showModal, setShowModal] = useState(false)
  const whatsappUrl = getWhatsAppDeepLink()

  if (compact) {
    return (
      <>
        <div
          className={`whatsapp-banner-compact ${className}`}
          style={{
            background: 'linear-gradient(135deg, #123d24 0%, #1c5232 100%)',
            color: '#ffffff',
            borderRadius: 18,
            padding: '14px 18px',
            border: '1.5px solid #25D366',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#25D366',
                color: '#075e54',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <MessageSquare size={20} />
            </div>
            <div>
              <strong style={{ fontSize: 13, display: 'block', color: '#ffffff' }}>
                {t('whatsappEntrySub')}
              </strong>
              <span style={{ fontSize: 11, color: '#c4e8ce' }}>
                {t('whatsappDescription')}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#ffffff',
                borderRadius: 10,
                padding: '6px 12px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {t('howItWorks')}
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                background: '#25D366',
                color: '#075e54',
                borderRadius: 10,
                padding: '6px 14px',
                fontSize: 11,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                textDecoration: 'none',
              }}
            >
              <span>{t('continueOnWhatsApp')}</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
        {showModal && <WhatsAppGuideModal onClose={() => setShowModal(false)} />}
      </>
    )
  }

  return (
    <>
      <div
        className={`whatsapp-banner-card ${className}`}
        style={{
          background: 'linear-gradient(135deg, #0f301d 0%, #18482b 60%, #1f5734 100%)',
          borderRadius: 24,
          border: '1.5px solid #2db85e',
          color: '#ffffff',
          padding: '22px 24px',
          boxShadow: '0 8px 30px rgba(15, 48, 29, 0.18)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Decorative Background Elements */}
        <div
          style={{
            position: 'absolute',
            top: -24,
            right: -24,
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37, 211, 102, 0.15) 0%, rgba(37, 211, 102, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 640 }}>
            {/* Tag Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <span
                style={{
                  background: '#25D366',
                  color: '#053e29',
                  fontSize: 10,
                  fontWeight: 900,
                  padding: '3px 9px',
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <MessageSquare size={12} />
                {t('whatsappOfficialHelpline')}
              </span>
              <span style={{ fontSize: 11, color: '#a7dbb6', fontWeight: 600 }}>
                {t('whatsappHeroTag')}
              </span>
            </div>

            {/* Main Headline */}
            <h2 style={{ margin: '0 0 6px', fontSize: 'clamp(20px, 3.2vw, 26px)', color: '#ffffff', letterSpacing: '-0.02em' }}>
              {t('whatsappEntryTitle')}
            </h2>
            <p style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 700, color: '#e8c868' }}>
              {t('whatsappEntrySub')}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: '#d3edd8', lineHeight: 1.55 }}>
              {t('whatsappDescription')}
            </p>

            {/* Quick 4-step Pill Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 14,
                flexWrap: 'wrap',
                fontSize: 12,
                color: '#e5f6e8',
              }}
            >
              <span style={{ background: 'rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                📷 {t('step1SendPhoto')}
              </span>
              <span>→</span>
              <span style={{ background: 'rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                🤖 {t('step2AiDiagnosis')}
              </span>
              <span>→</span>
              <span style={{ background: 'rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                🌱 {t('step3IcarRemedy')}
              </span>
              <span>→</span>
              <span style={{ background: 'rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                🔊 {t('step4VoiceNote')}
              </span>
            </div>
          </div>

          {/* Right Action Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignSelf: 'center', minWidth: 200 }}>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                background: '#25D366',
                color: '#075e54',
                padding: '12px 22px',
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(37, 211, 102, 0.4)',
                transition: 'all 160ms ease',
              }}
              className="active:scale-98 hover:brightness-105"
            >
              <MessageSquare size={18} />
              <span>{t('continueOnWhatsApp')}</span>
              <ExternalLink size={14} />
            </a>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.14)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: '#ffffff',
                  padding: '9px 12px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {t('howItWorks')}
              </button>

              <Link
                href="/farmer/whatsapp"
                style={{
                  flex: 1,
                  background: 'rgba(232, 200, 104, 0.2)',
                  border: '1px solid rgba(232, 200, 104, 0.4)',
                  color: '#f0d57e',
                  padding: '9px 12px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: 'none',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}
              >
                <span>{t('interactiveHub')}</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Step Interactive Explainer Modal */}
      {showModal && <WhatsAppGuideModal onClose={() => setShowModal(false)} />}
    </>
  )
}
