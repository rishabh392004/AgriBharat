'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LanguageSelector } from '@/components/language-selector'
import { LeafMark } from '@/components/leaf-mark'
import { useI18n } from '@/lib/i18n'
import { ArrowRight, ShieldCheck, Sparkles, CloudSun, CheckCircle2 } from 'lucide-react'

export default function SplashPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [starting, setStarting] = useState(false)

  const handleStart = () => {
    setStarting(true)
    setTimeout(() => {
      router.push('/login')
    }, 280)
  }

  return (
    <main className="splash">
      {/* Top Bar for Language Switcher on Splash */}
      <div style={{ position: 'absolute', top: 20, right: 24, zIndex: 50 }}>
        <LanguageSelector />
      </div>

      {/* Background Ambient Depth Glows */}
      <div className="splash-bg-glow" />
      <div className="splash-glow-secondary" />

      <div className="splash-inner splash-visible">
        {/* Verification Pill */}
        <div className="splash-badge">
          <Sparkles size={13} className="text-[#e8c868]" />
          <span>AI Agricultural Intelligence · v2.4</span>
        </div>

        {/* Animated Brand Emblem */}
        <div className="logo-orb-wrap">
          <div className="logo-orb">
            <LeafMark />
          </div>
          <div className="logo-orb-ring" />
        </div>

        {/* Brand Name & Taglines */}
        <h1 className="splash-brand">{t('brand')}</h1>
        <p className="splash-tag">{t('tagline')}</p>
        <p className="splash-sub">{t('subtitle')}</p>

        {/* Feature Highlights Pill Row */}
        <div className="splash-features">
          <div className="splash-feat-item">
            <ShieldCheck size={14} className="text-[#e8c868]" />
            <span>Early Disease Scan</span>
          </div>
          <div className="splash-feat-item">
            <CloudSun size={14} className="text-[#e8c868]" />
            <span>10-Day Weather Advisory</span>
          </div>
          <div className="splash-feat-item">
            <CheckCircle2 size={14} className="text-[#e8c868]" />
            <span>Officer Verification</span>
          </div>
        </div>

        {/* Dual Portal Selection Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16, width: '100%', maxWidth: 640, margin: '22px 0 16px' }}>
          {/* Farmer Portal Card */}
          <div
            onClick={() => router.push('/farmer')}
            style={{
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              color: '#133a23',
              borderRadius: 20,
              padding: '20px 22px',
              textAlign: 'left',
              cursor: 'pointer',
              boxShadow: '0 12px 32px rgba(10, 35, 20, 0.22)',
              border: '1.5px solid rgba(167, 243, 208, 0.7)',
              transition: 'all 240ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="hover:scale-105"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 26 }}>🌱</span>
              <span className="chip low" style={{ fontSize: 10, padding: '2px 8px', background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>
                Farmer Access
              </span>
            </div>
            <strong style={{ fontSize: 17, display: 'block', marginBottom: 4, color: '#143823' }}>
              Farmer Portal
            </strong>
            <p style={{ margin: 0, fontSize: 12, color: '#475569', lineHeight: 1.45 }}>
              AI Leaf Diagnosis, Grad-CAM Heatmaps & PMFBY Digital Passport
            </p>
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: '#2b7a4d' }}>
              <span>Enter Portal</span>
              <ArrowRight size={15} />
            </div>
          </div>

          {/* Officer Portal Card */}
          <div
            onClick={() => router.push('/officer')}
            style={{
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              color: '#133a23',
              borderRadius: 20,
              padding: '20px 22px',
              textAlign: 'left',
              cursor: 'pointer',
              boxShadow: '0 12px 32px rgba(10, 35, 20, 0.22)',
              border: '1.5px solid rgba(253, 230, 138, 0.7)',
              transition: 'all 240ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="hover:scale-105"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 26 }}>🛡️</span>
              <span className="chip high" style={{ fontSize: 10, padding: '2px 8px', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                Officer Desk
              </span>
            </div>
            <strong style={{ fontSize: 17, display: 'block', marginBottom: 4, color: '#143823' }}>
              Officer & Insurer Desk
            </strong>
            <p style={{ margin: 0, fontSize: 12, color: '#475569', lineHeight: 1.45 }}>
              Outbreak Hotspots, Verification Queue & PMFBY Digital Signing
            </p>
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: '#8a6410' }}>
              <span>Officer Sign In</span>
              <ArrowRight size={15} />
            </div>
          </div>
        </div>

        {/* Start Button - Manual trigger only */}
        <button
          className={`splash-cta ${starting ? 'splash-cta-active' : ''}`}
          onClick={handleStart}
          type="button"
          id="splash-start-btn"
        >
          <span>{t('startApp')}</span>
          <ArrowRight size={18} className="splash-cta-icon" />
        </button>

        {/* Hints and Locale info */}
        <div className="splash-footer-info">
          <p className="splash-hint">Select a portal above or click Start to explore demo accounts</p>
          <div className="splash-dots" aria-hidden>
            <span /><span /><span />
          </div>
        </div>
      </div>
    </main>
  )
}
