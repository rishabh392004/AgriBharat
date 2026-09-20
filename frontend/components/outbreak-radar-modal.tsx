'use client'

import { OutbreakMap } from '@/components/outbreak-map'
import { useI18n } from '@/lib/i18n'
import {
  Bot,
  Compass,
  ShieldAlert,
  X
} from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

interface OutbreakRadarModalProps {
  isOpen: boolean
  onClose: () => void
}

export function OutbreakRadarModal({ isOpen, onClose }: OutbreakRadarModalProps) {
  const { locale } = useI18n()
  const isHindi = locale === 'hi'
  const isMarathi = locale === 'mr'

  // Close on Escape key press & prevent background scrolling when open
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    // Save previous overflow style
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(12, 26, 18, 0.78)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 24,
          border: '1.5px solid #fecaca',
          width: '100%',
          maxWidth: 1080,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(220, 38, 38, 0.25), 0 0 0 1px rgba(220,38,38,0.08)',
          overflow: 'hidden',
          animation: 'scaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip */}
        <div
          style={{
            background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%)',
            padding: '18px 24px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            borderBottom: '1px solid rgba(254, 202, 202, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              <Compass size={24} className="text-rose-200 animate-spin" style={{ animationDuration: '12s' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    background: '#fee2e2',
                    color: '#991b1b',
                    fontSize: 10,
                    fontWeight: 850,
                    padding: '2px 8px',
                    borderRadius: 999,
                    letterSpacing: 0.6,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#dc2626',
                      animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }}
                  />
                  LIVE 15 KM RADAR
                </span>
                <span style={{ fontSize: 11, color: '#fca5a5', fontWeight: 600 }}>
                  Telemetry Sync: Active
                </span>
              </div>
              <h2 style={{ margin: '3px 0 0', fontSize: 19, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                {isHindi
                  ? 'भू-स्थानिक प्रकोप रडार एवं सक्रिय रोग क्लस्टर'
                  : 'Geospatial Outbreak Radar & Pathogen Clusters'}
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#fecaca', opacity: 0.92 }}>
                {isHindi
                  ? 'आस-पास के 15 किमी क्षेत्र में फसलों के संक्रमण, क्लस्टर घनत्व व ICAR क्वारंटाइन निर्देश'
                  : '15 km radius contagion tracking, neighbor farm pathogen alerts & ICAR containment protocols'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            background: '#fafaf9',
          }}
        >
          {/* Embedded Outbreak Map */}
          <OutbreakMap />
        </div>

        {/* Footer Bar */}
        <div
          style={{
            padding: '14px 24px',
            background: '#ffffff',
            borderTop: '1px solid #e7e5e4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#44403c' }}>
            <ShieldAlert size={16} className="text-amber-600 flex-shrink-0" />
            <span>
              {isHindi
                ? 'यदि आपके खेत में लक्षण दिखें तो तुरंत कृषि वैज्ञानिक (KVK) को सूचित करें।'
                : 'High-risk cluster proximity: report initial yellowing within 24h to prevent spore travel.'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link
              href="/farmer/chat"
              onClick={onClose}
              style={{
                background: '#f3f4f6',
                color: '#1f2937',
                border: '1px solid #d1d5db',
                borderRadius: 12,
                padding: '9px 15px',
                fontSize: 13,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Bot size={15} className="text-emerald-700" />
              <span>{isHindi ? 'कृषि एआई से सलाह लें' : 'Consult AI Agronomist'}</span>
            </Link>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'linear-gradient(135deg, #b91c1c, #991b1b)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 12,
                padding: '9px 18px',
                fontSize: 13,
                fontWeight: 750,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(185, 28, 28, 0.25)',
                transition: 'all 0.15s ease',
              }}
            >
              {isHindi ? 'रडार बंद करें' : 'Close Radar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
