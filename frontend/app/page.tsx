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

      {/* Background Animated Glows and Ambient Lights */}
      <div className="splash-bg-glow" />
      <div className="splash-glow-secondary" />

      {/* Floating Particle Accents */}
      <div className="splash-particle p1" aria-hidden />
      <div className="splash-particle p2" aria-hidden />
      <div className="splash-particle p3" aria-hidden />

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, width: '100%', maxWidth: 620, margin: '20px 0 14px' }}>
          {/* Farmer Portal Card */}
          <div
            onClick={() => router.push('/farmer')}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#133a23',
              borderRadius: 18,
              padding: '18px 20px',
              textAlign: 'left',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
              border: '2px solid #a7f3d0',
              transition: 'all 200ms ease',
            }}
            className="hover:scale-105"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>🌱</span>
              <span className="chip low" style={{ fontSize: 10, padding: '2px 8px' }}>
                Farmer Access
              </span>
            </div>
            <strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
              Farmer Portal
            </strong>
            <p style={{ margin: 0, fontSize: 11, color: '#475569', lineHeight: 1.4 }}>
              AI Leaf Diagnosis, Grad-CAM Heatmaps & PMFBY Digital Passport
            </p>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#2b7a4d' }}>
              <span>Enter Portal</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* Officer Portal Card */}
          <div
            onClick={() => router.push('/officer')}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#133a23',
              borderRadius: 18,
              padding: '18px 20px',
              textAlign: 'left',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
              border: '2px solid #fde68a',
              transition: 'all 200ms ease',
            }}
            className="hover:scale-105"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>🛡️</span>
              <span className="chip high" style={{ fontSize: 10, padding: '2px 8px' }}>
                Officer Desk
              </span>
            </div>
            <strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
              Officer & Insurer Desk
            </strong>
            <p style={{ margin: 0, fontSize: 11, color: '#475569', lineHeight: 1.4 }}>
              Outbreak Hotspots, Verification Queue & PMFBY Digital Signing
            </p>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#8a6410' }}>
              <span>Officer Sign In</span>
              <ArrowRight size={14} />
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
