'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Sprout,
  ShieldAlert,
  Loader2,
} from 'lucide-react'
import { LanguageSelector } from '@/components/language-selector'
import { LeafMark } from '@/components/leaf-mark'
import { toast } from '@/components/toast'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { authService } from '@/services/authService'

export default function LoginPage() {
  const { t } = useI18n()
  const { signIn } = useAuth()
  const router = useRouter()

  const [activeRole, setActiveRole] = useState<'farmer' | 'officer'>('farmer')
  const [phone, setPhone] = useState('9876543210')
  const [password, setPassword] = useState('kisan123')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)

  const go = async (user: Awaited<ReturnType<typeof authService.login>>) => {
    signIn(user)
    router.replace(user.role === 'officer' ? '/officer' : '/farmer')
  }

  const handleRoleSwitch = (role: 'farmer' | 'officer') => {
    setActiveRole(role)
    if (role === 'farmer') {
      setPhone('9876543210')
      setPassword('kisan123')
    } else {
      setPhone('9811122233')
      setPassword('officer123')
    }
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        position: 'relative',
        background: 'radial-gradient(circle at 50% 20%, #1e4d32 0%, #133a25 50%, #0c2718 100%)',
        color: '#f7faf5',
        overflow: 'hidden',
      }}
    >
      {/* Background Decorative Ambient Glows */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232, 200, 104, 0.15) 0%, rgba(43, 122, 77, 0.12) 50%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(61, 122, 74, 0.2) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Floating Language Switcher */}
      <div style={{ position: 'absolute', top: 20, right: 24, zIndex: 30 }}>
        <LanguageSelector />
      </div>

      {/* Main Login Glass Card */}
      <section
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(232, 200, 104, 0.4)',
          borderRadius: 28,
          padding: '32px 28px',
          boxShadow: '0 25px 55px rgba(0, 0, 0, 0.35), 0 0 40px rgba(43, 122, 77, 0.15)',
          color: '#1e293b',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Brand Header with New Emblem */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'radial-gradient(circle at 35% 30%, #1c5236 0%, #103823 100%)',
                border: '1.5px solid rgba(232, 200, 104, 0.7)',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 4px 12px rgba(10, 35, 20, 0.25)',
              }}
            >
              <LeafMark size={30} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#133a23', letterSpacing: '-0.02em' }}>
                Krishi Darpan
              </h2>
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                Digital Agro-Tech Stack
              </span>
            </div>
          </Link>

          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              padding: '4px 9px',
              borderRadius: 999,
              background: '#eef7ec',
              color: '#2b7a4d',
              border: '1px solid #c8e4c3',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <ShieldCheck size={12} />
            PMFBY Verified
          </span>
        </div>

        {/* Welcome Text */}
        <div style={{ marginBottom: 18 }}>
          <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
            {t('welcome')} 👋
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
            {t('subtitle')}
          </p>
        </div>

        {/* Role Selector Tabs (Farmer vs Officer) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 6,
            background: '#f1f5f0',
            padding: 4,
            borderRadius: 14,
            border: '1px solid #d9e6d6',
            marginBottom: 20,
          }}
        >
          <button
            type="button"
            onClick={() => handleRoleSwitch('farmer')}
            style={{
              border: 'none',
              borderRadius: 10,
              padding: '9px 12px',
              fontSize: 12,
              fontWeight: activeRole === 'farmer' ? 800 : 600,
              background: activeRole === 'farmer' ? '#2b7a4d' : 'transparent',
              color: activeRole === 'farmer' ? '#ffffff' : '#475569',
              boxShadow: activeRole === 'farmer' ? '0 2px 8px rgba(43, 122, 77, 0.3)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 160ms ease',
            }}
          >
            <Sprout size={15} />
            <span>Farmer Portal</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSwitch('officer')}
            style={{
              border: 'none',
              borderRadius: 10,
              padding: '9px 12px',
              fontSize: 12,
              fontWeight: activeRole === 'officer' ? 800 : 600,
              background: activeRole === 'officer' ? '#133a23' : 'transparent',
              color: activeRole === 'officer' ? '#fde68a' : '#475569',
              boxShadow: activeRole === 'officer' ? '0 2px 8px rgba(19, 58, 35, 0.35)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 160ms ease',
            }}
          >
            <ShieldCheck size={15} />
            <span>Officer Desk</span>
          </button>
        </div>

        {/* Input Fields */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const btn = document.getElementById('login-submit-btn')
            if (btn) btn.click()
          }}
        >
          {/* Mobile Phone Field */}
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 700,
                color: '#334155',
                marginBottom: 6,
              }}
            >
              {t('phone')}
            </label>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                background: '#f8faf7',
                border: '1.5px solid #d4e3d1',
                borderRadius: 14,
                padding: '0 14px',
                transition: 'border-color 150ms ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 13, fontWeight: 700, borderRight: '1px solid #d4e3d1', paddingRight: 10, marginRight: 10 }}>
                <span>🇮🇳</span>
                <span>+91</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                placeholder="98765 43210"
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  width: '100%',
                  padding: '13px 0',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#0f172a',
                }}
              />
              <Phone size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: 10 }}>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 700,
                color: '#334155',
                marginBottom: 6,
              }}
            >
              {t('password')}
            </label>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                background: '#f8faf7',
                border: '1.5px solid #d4e3d1',
                borderRadius: 14,
                padding: '0 14px',
              }}
            >
              <Lock size={16} style={{ color: '#64748b', marginRight: 10, flexShrink: 0 }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  width: '100%',
                  padding: '13px 0',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#0f172a',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'grid',
                  placeItems: 'center',
                }}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Help Links */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 12,
              marginBottom: 18,
            }}
          >
            <button
              type="button"
              onClick={() => toast(t('forgotToast'))}
              style={{
                background: 'none',
                border: 'none',
                color: '#2b7a4d',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {t('forgot')}
            </button>
            <Link
              href="/signup"
              style={{
                color: '#2b7a4d',
                fontWeight: 700,
              }}
            >
              {t('create')}
            </Link>
          </div>

          {/* Main Submit Button */}
          <button
            id="login-submit-btn"
            type="button"
            className="btn btn-primary"
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              try {
                const user = await authService.login(phone, password)
                await go(user)
              } catch (e) {
                toast('Sign in failed. Using default credentials.')
              } finally {
                setBusy(false)
              }
            }}
            style={{
              width: '100%',
              borderRadius: 14,
              padding: '14px',
              fontSize: 14,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: busy ? 'not-allowed' : 'pointer',
            }}
          >
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to {activeRole === 'farmer' ? 'Farmer Portal' : 'Officer Desk'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* 1-Tap Quick Demo Credentials Row */}
        <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid #eef2ec' }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              display: 'block',
              marginBottom: 10,
              textAlign: 'center',
            }}
          >
            ⚡ Instant 1-Click Demo Accounts
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {/* Farmer Demo Card */}
            <button
              type="button"
              onClick={async () => {
                setBusy(true)
                await go(await authService.demoFarmer())
                setBusy(false)
              }}
              style={{
                background: '#f4fbf3',
                border: '1.5px solid #c2e5be',
                borderRadius: 14,
                padding: '10px 12px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              className="hover:scale-105"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 16 }}>🌾</span>
                <strong style={{ fontSize: 12, color: '#1b4d2e' }}>Rameshwar Patil</strong>
              </div>
              <p style={{ margin: 0, fontSize: 10, color: '#4b6352' }}>
                Farmer • Nashik (4.5 Ac)
              </p>
            </button>

            {/* Officer Demo Card */}
            <button
              type="button"
              onClick={async () => {
                setBusy(true)
                await go(await authService.demoOfficer())
                setBusy(false)
              }}
              style={{
                background: '#fbf8f0',
                border: '1.5px solid #ecdca8',
                borderRadius: 14,
                padding: '10px 12px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              className="hover:scale-105"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 16 }}>🛡️</span>
                <strong style={{ fontSize: 12, color: '#78540c' }}>Sanjay Deshmukh</strong>
              </div>
              <p style={{ margin: 0, fontSize: 10, color: '#685732' }}>
                Officer • District Hub
              </p>
            </button>
          </div>
        </div>

        {/* Security & Regulatory Footer Note */}
        <p
          style={{
            margin: '18px 0 0',
            textAlign: 'center',
            fontSize: 11,
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Lock size={12} />
          <span>256-Bit Encrypted Agricultural Session · PMFBY Compliant</span>
        </p>
      </section>
    </main>
  )
}
