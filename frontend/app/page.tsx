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

        {/* Start Button - Manual trigger only */}
        <button
          className={`splash-cta ${starting ? 'splash-cta-active' : ''}`}
          onClick={handleStart}
          type="button"
          id="splash-start-btn"
        >
          <span>Start KrishiRakshak AI</span>
          <ArrowRight size={18} className="splash-cta-icon" />
        </button>

        {/* Hints and Locale info */}
        <div className="splash-footer-info">
          <p className="splash-hint">Click Start to enter Demo Portals (Farmer & Officer)</p>
          <div className="splash-dots" aria-hidden>
            <span /><span /><span />
          </div>
        </div>
      </div>
    </main>
  )
}
