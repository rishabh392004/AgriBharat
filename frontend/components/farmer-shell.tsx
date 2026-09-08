'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Bell, Bot, Camera, ClipboardList, Home, LogOut, MapPin, UserRound, ShieldCheck, MessageSquare } from 'lucide-react'
import { LanguageSelector } from '@/components/language-selector'
import { LeafMark } from '@/components/leaf-mark'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'

const farmerLinks = [
  { href: '/farmer', key: 'dashboard', icon: Home, dockLabel: 'Home' },
  { href: '/farmer/crop-health-passport', key: 'cropPassport', icon: ShieldCheck, dockLabel: 'Passport' },
  { href: '/farmer/scan', key: 'scan', icon: Camera, dockLabel: 'Scan' },
  { href: '/farmer/whatsapp', key: 'whatsappChannel', icon: MessageSquare, dockLabel: 'WhatsApp' },
  { href: '/farmer/chat', key: 'assistant', icon: Bot, dockLabel: 'AI' },
  { href: '/farmer/help', key: 'nearby', icon: MapPin, dockLabel: 'Help' },
  { href: '/farmer/history', key: 'history', icon: ClipboardList, dockLabel: 'History' },
  { href: '/farmer/profile', key: 'profile', icon: UserRound, dockLabel: 'Profile' },
]

// On mobile dock show top primary items
const dockLinks = farmerLinks.filter((l) => l.key !== 'nearby' && l.key !== 'profile')

export function FarmerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useI18n()
  const { user, ready, farmer, signOut } = useAuth()

  useEffect(() => {
    if (!ready) return
    if (!user) router.replace('/login')
    else if (user.role === 'officer') router.replace('/officer')
  }, [ready, user, router])

  if (!ready || !user || user.role !== 'farmer') {
    return (
      <div className="boot">
        <div className="boot-inner">
          <div className="boot-mark"><LeafMark /></div>
          Krishi Darpan
        </div>
      </div>
    )
  }

  const active = (href: string) => (href === '/farmer' ? pathname === '/farmer' : pathname.startsWith(href))

  return (
    <div className="shell">
      {/* Desktop Sidebar */}
      <aside className="side">
        <Link href="/farmer" className="brand">
          <span className="brand-mark">
            <LeafMark />
          </span>
          <span>
            <strong>{t('brand')}</strong>
            <small>{t('tagline')}</small>
          </span>
        </Link>
        <nav>
          {farmerLinks.map((item) => (
            <Link key={item.href} href={item.href} className={active(item.href) ? 'on' : ''}>
              {active(item.href) && <span className="nav-pill" aria-hidden />}
              <item.icon size={18} />
              {t(item.key)}
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
            <p className="crumb">{farmer.farmName}</p>
            <p className="loc">📍 {farmer.location}</p>
          </div>
          <div className="top-right">
            <LanguageSelector />
            <button className="notif-btn" aria-label="Notifications" type="button">
              <Bell size={18} />
              <span className="notif-dot" aria-hidden />
            </button>
            <Link href="/farmer/profile" className="who">
              <span className="ava">{farmer.initials}</span>
              <strong>{farmer.name}</strong>
            </Link>
          </div>
        </header>
        <div className="page">{children}</div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="dock">
        {dockLinks.map((item) => (
          <Link key={item.href} href={item.href} className={active(item.href) ? 'on' : ''}>
            <span className="dock-icon">
              <item.icon size={20} />
              {active(item.href) && <span className="dock-active-ring" aria-hidden />}
            </span>
            <span>{t(item.key)}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
