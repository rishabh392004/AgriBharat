'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Bell, ClipboardCheck, Home, LogOut, Map, ShieldCheck } from 'lucide-react'
import { LanguageSelector } from '@/components/language-selector'
import { LeafMark } from '@/components/leaf-mark'
import { DEMO_OFFICER } from '@/data/farmer'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'

const links = [
  { href: '/officer', key: 'officerDash', icon: Home, dockLabel: 'Home' },
  { href: '/officer/review-queue', key: 'reviewQueue', icon: ClipboardCheck, dockLabel: 'Queue' },
  { href: '/officer/map', key: 'diseaseMap', icon: Map, dockLabel: 'Map' },
  { href: '/officer/reports', key: 'recentReports', icon: ShieldCheck, dockLabel: 'Reports' },
]

export function OfficerShell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n()
  const { user, ready, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!ready) return
    if (!user) router.replace('/login')
    else if (user.role !== 'officer') router.replace('/farmer')
  }, [ready, user, router])

  if (!ready || !user || user.role !== 'officer') return (
    <div className="boot">
      <div className="boot-inner">
        <div className="boot-mark"><LeafMark /></div>
        KrishiRakshak AI
      </div>
    </div>
  )

  const active = (href: string) => pathname === href || (href !== '/officer' && pathname.startsWith(href))

  return (
    <div className="shell officer">
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
            <span>{item.dockLabel}</span>
          </Link>
        ))}
        <button type="button" onClick={() => { signOut(); router.push('/login') }}>
          <span className="dock-icon"><LogOut size={20} /></span>
          <span>Logout</span>
        </button>
      </nav>
    </div>
  )
}
