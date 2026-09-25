'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Bell,
  ClipboardCheck,
  Home,
  LogOut,
  Map,
  ShieldCheck,
  Building2,
  Lock,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
} from 'lucide-react'
import { LanguageSelector } from '@/components/language-selector'
import { LeafMark } from '@/components/leaf-mark'
import { DEMO_OFFICER } from '@/data/farmer'
import { CottonBg } from '@/components/cotton-bg'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { KrishiDarpanLogo } from '@/components/krishi-darpan-logo'

const links = [
  { href: '/officer', key: 'officerDash', icon: Home, dockLabel: 'Home' },
  { href: '/officer/review-queue', key: 'reviewQueue', icon: ClipboardCheck, dockLabel: 'Queue' },
  { href: '/officer/map', key: 'diseaseMap', icon: Map, dockLabel: 'Map' },
  { href: '/officer/reports', key: 'recentReports', icon: ShieldCheck, dockLabel: 'Reports' },
]

export function OfficerShell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n()
  const { user, ready, signIn, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [loggingInDemo, setLoggingInDemo] = useState(false)

  // 1-Click Instant Demo Login as Agriculture Extension Officer
  const handleInstantOfficerAccess = () => {
    setLoggingInDemo(true)
    signIn({
      name: DEMO_OFFICER.name,
      role: 'officer',
      phone: DEMO_OFFICER.mobile,
    })
    setTimeout(() => {
      setLoggingInDemo(false)
    }, 400)
  }

  // Loading state
  if (!ready) {
    return (
      <div className="boot">
        <div className="boot-inner">
          <div className="boot-mark">
            <LeafMark />
          </div>
          Krishi Darpan
        </div>
      </div>
    )
  }

  // If user is not authenticated as an officer, display the Officer Access Gate
  if (!user || user.role !== 'officer') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0e2a1f] via-[#1a3d2e] to-[#0a1f16] text-white flex flex-col justify-between p-4 sm:p-8 font-['Inter',system-ui,sans-serif]">
        {/* Top brand header */}
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between py-4">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <KrishiDarpanLogo size={38} showText={true} variant="light" />
          </Link>
          <Link
            href="/"
            className="text-xs sm:text-sm font-semibold text-white/80 hover:text-white px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 transition-all"
          >
            ← Back to Homepage
          </Link>
        </div>

        {/* Center Access Gate Card */}
        <div className="max-w-md w-full mx-auto my-auto bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#E8B84B] text-[#213026] flex items-center justify-center mx-auto mb-5 shadow-lg">
            <ShieldCheck className="w-9 h-9" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8B84B]/20 text-[#E8B84B] border border-[#E8B84B]/30 text-xs font-bold mb-3">
            <Lock className="w-3 h-3" />
            <span>Govt / SIH 2026 Secured Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-white tracking-tight">
            Agriculture Officer Desk
          </h1>
          <p className="text-[#C98F1E] font-['Noto_Sans_Devanagari'] font-bold text-sm sm:text-base mt-1">
            कृषि अधिकारी पोर्टल
          </p>

          <p className="text-xs sm:text-sm text-white/75 mt-3 leading-relaxed">
            Restricted workspace for District Agriculture Officers & KVK scientists to track disease outbreaks, validate diagnosis passports, and issue spray advisories.
          </p>

          {/* District badge */}
          <div className="my-5 p-3 rounded-xl bg-white/5 border border-white/10 text-xs flex items-center justify-center gap-2 text-white/90">
            <MapPin className="w-4 h-4 text-[#E8B84B]" />
            <span>Station: <strong>Nashik District Command Center</strong></span>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleInstantOfficerAccess}
              disabled={loggingInDemo}
              className="w-full py-3.5 px-5 bg-[#E8B84B] hover:bg-[#F2C862] text-[#213026] font-bold text-sm sm:text-base rounded-2xl shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#213026]" />
              <span>{loggingInDemo ? 'Opening Dashboard...' : 'Enter as Demo Officer (Dr. A. Patil)'}</span>
              <ArrowRight className="w-4 h-4 text-[#213026]" />
            </button>

            <Link
              href="/login?role=officer"
              className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors block text-center border border-white/10"
            >
              Sign In with Officer Password
            </Link>

            <Link
              href="/farmer"
              className="w-full py-2.5 px-4 text-white/60 hover:text-white text-xs block text-center transition-colors"
            >
              Continue to Farmer Portal instead
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="max-w-5xl mx-auto w-full text-center text-[11px] text-white/40 py-4">
          Integrated with ICAR, KVK Ludhiana/Nashik, and Department of Agriculture & Farmers Welfare
        </div>
      </div>
    )
  }

  const active = (href: string) => pathname === href || (href !== '/officer' && pathname.startsWith(href))

  return (
    <div className="shell officer">
      <CottonBg />
      {/* Desktop Sidebar */}
      <aside className="side">
        <Link href="/officer" className="brand">
          <span className="brand-mark">
            <LeafMark />
          </span>
          <span>
            <strong>{t('brand')}</strong>
            <small>{DEMO_OFFICER.district}</small>
          </span>
        </Link>
        <nav>
          {links.map((item) => (
            <Link key={item.href} href={item.href} className={active(item.href) ? 'on' : ''}>
              {active(item.href) && <span className="nav-pill" aria-hidden />}
              <item.icon size={18} />
              {t(item.key)}
              {item.key === 'reviewQueue' && (
                <span className="nav-badge">4</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="side-foot">
          <LanguageSelector align="left" />
          <button type="button" onClick={() => { signOut(); router.push('/login') }}>
            <LogOut size={16} /> {t('logout')}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="stage">
        <header className="top">
          <div>
            <p className="crumb">{t('officer')}</p>
            <p className="loc">📍 {DEMO_OFFICER.district}</p>
          </div>
          <div className="top-right">
            <LanguageSelector />
            <button className="notif-btn" aria-label="Notifications" type="button">
              <Bell size={18} />
              <span className="notif-dot" aria-hidden />
            </button>
            <div className="who">
              <span className="ava">{DEMO_OFFICER.initials}</span>
              <strong>{DEMO_OFFICER.name}</strong>
            </div>
          </div>
        </header>
        <div className="page">{children}</div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="dock">
        {links.map((item) => (
          <Link key={item.href} href={item.href} className={active(item.href) ? 'on' : ''}>
            <span className="dock-icon">
              <item.icon size={20} />
              {active(item.href) && <span className="dock-active-ring" aria-hidden />}
            </span>
            <span>{t(item.key)}</span>
          </Link>
        ))}
        <button type="button" onClick={() => { signOut(); router.push('/login') }}>
          <span className="dock-icon"><LogOut size={20} /></span>
          <span>{t('logout')}</span>
        </button>
      </nav>
    </div>
  )
}
