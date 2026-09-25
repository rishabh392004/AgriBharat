'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import {
  Bell,
  Bot,
  Camera,
  ClipboardList,
  Home,
  LogOut,
  MapPin,
  UserRound,
  ShieldCheck,
  MessageSquare,
  Play,
  Sparkles,
  Sprout,
  Search,
  X,
  Check,
  Clock,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  ChevronDown,
  Compass,
  FileText,
  UserCheck,
  Zap,
} from 'lucide-react'
import { LanguageSelector } from '@/components/language-selector'
import { LeafMark } from '@/components/leaf-mark'
import { FarmerTourVideoModal } from '@/components/farmer-tour-video-modal'
import { AboutUsModal } from '@/components/about-us-modal'
import { CottonBg } from '@/components/cotton-bg'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'

interface NavItem {
  href: string
  key: string
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
  dockLabel: string
  badge?: string
}

const navSections: { sectionTitleKey: string; items: NavItem[] }[] = [
  {
    sectionTitleKey: 'navSectionField',
    items: [
      { href: '/farmer', key: 'dashboard', icon: Home, dockLabel: 'Home' },
      { href: '/farmer/crop-health-passport', key: 'cropPassport', icon: ShieldCheck, dockLabel: 'Passport', badge: 'NEW' },
      { href: '/farmer/scan', key: 'scan', icon: Camera, dockLabel: 'Scan', badge: 'AI' },
      { href: '/farmer/whatsapp', key: 'whatsappChannel', icon: MessageSquare, dockLabel: 'WhatsApp' },
    ],
  },
  {
    sectionTitleKey: 'navSectionAdvisory',
    items: [
      { href: '/farmer/chat', key: 'assistant', icon: Bot, dockLabel: 'AI Chat' },
      { href: '/farmer/help', key: 'nearby', icon: MapPin, dockLabel: 'Help' },
      { href: '/farmer/history', key: 'history', icon: ClipboardList, dockLabel: 'History' },
    ],
  },
  {
    sectionTitleKey: 'navSectionAccount',
    items: [
      { href: '/farmer/profile', key: 'profile', icon: UserRound, dockLabel: 'Profile' },
    ],
  },
]

const allFarmerLinks = navSections.flatMap((s) => s.items)

// Quick search suggestions
interface QuickCommand {
  label: string
  sub: string
  href: string
  icon: React.ComponentType<{ size?: number }>
  tag: string
}

const QUICK_COMMANDS: QuickCommand[] = [
  { label: 'Instant Crop Leaf Scan', sub: 'Diagnose disease with 98.4% AI accuracy', href: '/farmer/scan', icon: Camera, tag: 'Scan' },
  { label: 'Voice Agronomist (Kisan Salahkar)', sub: 'Ask questions in 11 regional languages', href: '/farmer/chat', icon: Bot, tag: 'AI' },
  { label: 'Digital Crop Health Passport', sub: 'Verified QR-encoded field certificate', href: '/farmer/crop-health-passport', icon: ShieldCheck, tag: 'Passport' },
  { label: 'WhatsApp Diagnosis Helpline', sub: 'No-app zero-friction phone camera diagnosis', href: '/farmer/whatsapp', icon: MessageSquare, tag: 'WA' },
  { label: 'Nearby Krishi Vigyan Kendra (KVK)', sub: 'Find nearest agronomist center & phone', href: '/farmer/help', icon: MapPin, tag: 'KVK' },
  { label: 'Recent Diagnostic History', sub: 'View previous field scans & verified remedies', href: '/farmer/history', icon: ClipboardList, tag: 'Reports' },
]

interface ShellNotification {
  id: string
  title: string
  detail: string
  time: string
  type: 'urgent' | 'advisory' | 'success'
  read: boolean
}

const INITIAL_NOTIFICATIONS: ShellNotification[] = [
  {
    id: 'n1',
    title: 'Yellow Rust Spore Alert (Nashik)',
    detail: 'High humidity (>85%) in Niphad taluka. Preventive Neem/Mancozeb foliar spray recommended.',
    time: '18m ago',
    type: 'urgent',
    read: false,
  },
  {
    id: 'n2',
    title: 'Optimal Spray Window Active',
    detail: 'Wind speeds below 8 km/h. Best foliar application window today: 4:30 PM – 7:00 PM.',
    time: '1h ago',
    type: 'advisory',
    read: false,
  },
  {
    id: 'n3',
    title: 'Officer Verified Scan #SC-892',
    detail: 'Agricultural Officer Sanjay Deshmukh confirmed diagnosis with 96% accuracy.',
    time: '3h ago',
    type: 'success',
    read: false,
  },
]

export function FarmerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { t, locale } = useI18n()
  const { user, ready, farmer, signOut } = useAuth()

  // Interactive UI state
  const [tourOpen, setTourOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [notifsOpen, setNotifsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState<ShellNotification[]>(INITIAL_NOTIFICATIONS)

  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const isHindi = locale === 'hi'
  const isMarathi = locale === 'mr'

  // Keyboard shortcut Ctrl+K / Cmd+K for quick command bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((p) => !p)
      } else if (e.key === 'Escape') {
        setSearchOpen(false)
        setNotifsOpen(false)
        setProfileOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Auto-focus input when search palette opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }, [searchOpen])

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifsOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllNotifsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const filteredCommands = QUICK_COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.sub.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="shell">
      <CottonBg />

      {/* 1. Desktop Sidebar Navigation */}
      <aside className="side" style={{ boxShadow: '2px 0 20px rgba(0,0,0,0.06)', zIndex: 120 }}>
        {/* Brand Header */}
        <Link
          href="/farmer"
          className="brand"
          style={{
            padding: '12px 10px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            marginBottom: 12,
            textDecoration: 'none',
          }}
        >
          <span className="brand-mark" style={{ boxShadow: '0 4px 14px rgba(232, 200, 104, 0.4)' }}>
            <LeafMark />
          </span>
          <div>
            <strong style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              {t('brand')}
            </strong>
            <small style={{ color: '#c4ddcc', fontSize: 11, fontWeight: 600 }}>
              {t('tagline')}
            </small>
          </div>
        </Link>

        {/* Categorized Navigation Menu */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, overflowY: 'auto' }}>
          {navSections.map((sec) => (
            <div key={sec.sectionTitleKey}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.45)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '4px 12px',
                  marginBottom: 2,
                }}
              >
                {sec.sectionTitleKey === 'navSectionField'
                  ? (isHindi ? 'खेत एवं जांच' : 'Field & Scans')
                  : sec.sectionTitleKey === 'navSectionAdvisory'
                  ? (isHindi ? 'सलाह व केंद्र' : 'Advisory & Help')
                  : (isHindi ? 'खाता' : 'Account')}
              </div>

              <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {sec.items.map((item) => {
                  const isOn = active(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={isOn ? 'on' : ''}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 14px',
                        borderRadius: 12,
                        textDecoration: 'none',
                        color: isOn ? '#ffffff' : '#c8dec9',
                        background: isOn ? 'linear-gradient(90deg, rgba(46, 204, 113, 0.25), rgba(46, 204, 113, 0.08))' : 'transparent',
                        fontWeight: isOn ? 750 : 550,
                        fontSize: 13.5,
                        transition: 'all 0.16s ease',
                      }}
                    >
                      {isOn && (
                        <span
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 6,
                            bottom: 6,
                            width: 3.5,
                            borderRadius: '0 4px 4px 0',
                            background: '#e8c868',
                            boxShadow: '0 0 8px #e8c868',
                          }}
                        />
                      )}
                      <item.icon size={18} style={{ color: isOn ? '#e8c868' : '#a1c4a5' }} />
                      <span style={{ flex: 1 }}>{t(item.key)}</span>
                      {item.badge && (
                        <span
                          style={{
                            fontSize: 9.5,
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: 99,
                            background: item.badge === 'AI' ? '#10b981' : '#e8c868',
                            color: '#0d2817',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div
          className="side-foot"
          style={{
            paddingTop: 14,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {/* About Us button */}
          <button
            type="button"
            onClick={() => setAboutOpen(true)}
            style={{
              background: 'rgba(232, 200, 104, 0.12)',
              border: '1px solid rgba(232, 200, 104, 0.28)',
              color: '#e8c868',
              borderRadius: 12,
              padding: '8px 12px',
              fontSize: 12,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              width: '100%',
              justifyContent: 'flex-start',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={15} />
            <span>{isHindi ? 'हमारे बारे में' : 'About AgriBharat'}</span>
          </button>

          {/* Video Tour Guide */}
          <button
            type="button"
            onClick={() => setTourOpen(true)}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#e0ece2',
              borderRadius: 12,
              padding: '8px 12px',
              fontSize: 12,
              fontWeight: 650,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              width: '100%',
              justifyContent: 'flex-start',
            }}
          >
            <Play size={14} fill="currentColor" />
            <span>{isHindi ? 'वीडियो टूर चलाएं' : 'Play Video Guide'}</span>
          </button>

          <LanguageSelector align="left" />

          <button
            type="button"
            onClick={() => { signOut(); router.push('/login') }}
            style={{
              background: 'transparent',
              border: 0,
              color: '#fca5a5',
              padding: '8px 12px',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12.5,
              fontWeight: 650,
              cursor: 'pointer',
            }}
          >
            <LogOut size={16} /> {t('logout')}
          </button>
        </div>
      </aside>

      {/* 2. Main Stage with Glassmorphic Top Navigation Bar */}
      <div className="stage">
        <header
          className="top"
          style={{
            height: 70,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 253, 248, 0.94)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1.5px solid #dbe8df',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          {/* Left: Desktop Identity vs Mobile Brand Identity */}
          <div className="desktop-identity">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <strong style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>
                  {farmer.farmName}
                </strong>
                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.12)',
                    color: '#065f46',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    fontSize: 10,
                    fontWeight: 750,
                    padding: '1px 7px',
                    borderRadius: 999,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span className="pulse-beacon" style={{ background: '#10b981', width: 6, height: 6 }} />
                  {isHindi ? 'सक्रिय खेत' : 'Active Field'}
                </span>
              </div>
              <p className="loc" style={{ margin: '1px 0 0', fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <MapPin size={12} style={{ color: '#059669' }} /> {farmer.location}
                </span>
                <span style={{ color: 'var(--line)' }}>•</span>
                <span style={{ color: '#2b7a4d', fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Sprout size={12} style={{ color: '#16a34a' }} /> {farmer.primaryCrop || 'Wheat'}
                </span>
              </p>
            </div>
          </div>

          {/* Left: Mobile Brand & Identity */}
          <div className="mobile-brand-title">
            <Link href="/farmer" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #1b4d2e, #2b7a4d)',
                  color: '#e8c868',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 2px 8px rgba(43, 122, 77, 0.25)',
                  flexShrink: 0,
                }}
              >
                <LeafMark size={20} />
              </span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.2 }}>
                  Krishi Darpan
                </strong>
                <span style={{ fontSize: 10.5, color: '#2b7a4d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span className="pulse-beacon" style={{ background: '#10b981', width: 5, height: 5 }} />
                  {farmer.farmName}
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Global Command & Search Pill (Desktop Only) */}
          <div
            onClick={() => setSearchOpen(true)}
            className="top-search-pill-desktop hover:border-emerald-500 hover:bg-white"
            title="Global search (Ctrl+K)"
          >
            <Search size={14} style={{ color: '#2b7a4d' }} />
            <span style={{ fontSize: 12.5, flex: 1, color: '#4b6352' }}>
              {isHindi ? 'फसल, रोग, दवा या योजना खोजें...' : 'Search crops, diseases, remedies...'}
            </span>
            <kbd
              style={{
                fontSize: 10,
                background: '#ffffff',
                border: '1px solid #c8decb',
                borderRadius: 6,
                padding: '2px 6px',
                fontWeight: 750,
                color: '#2b7a4d',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              Ctrl K
            </kbd>
          </div>

          {/* Right: Quick Action Controls, Notifications, Language, Profile */}
          <div className="top-right">
            {/* Quick Mobile Search Icon Button */}
            <button
              type="button"
              className="top-search-icon-mobile"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search dialog"
              title="Search"
            >
              <Search size={16} />
            </button>

            {/* Quick 1-Click Scan Button (Desktop Only) */}
            <div className="top-scan-desktop">
              <Link
                href="/farmer/scan"
                style={{
                  background: 'linear-gradient(135deg, #1b4d2e, #2b7a4d)',
                  color: '#ffffff',
                  borderRadius: 999,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 750,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 8px rgba(43,122,77,0.25)',
                  transition: 'all 0.15s ease',
                }}
                className="hover:scale-103"
              >
                <Camera size={14} />
                <span>{t('scanCrop')}</span>
              </Link>
            </div>

            {/* Language Dropdown */}
            <LanguageSelector />

            {/* Interactive Notifications Bell */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifsOpen((p) => !p)}
                style={{
                  position: 'relative',
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  border: notifsOpen ? '2px solid #2b7a4d' : '1px solid var(--line)',
                  background: notifsOpen ? '#e8f7ec' : 'var(--card)',
                  color: 'var(--forest)',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                aria-label="Notifications"
                title="Field Alerts & Advisories"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#ef4444',
                      border: '1.5px solid #ffffff',
                    }}
                  />
                )}
              </button>

              {/* Notifications Popover Dropdown */}
              {notifsOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: 'min(330px, calc(100vw - 32px))',
                    background: '#ffffff',
                    borderRadius: 18,
                    border: '1.5px solid #d0e4d7',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.14)',
                    zIndex: 200,
                    overflow: 'hidden',
                    animation: 'slideDown 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <div
                    style={{
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, #1b4d2e, #235c39)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Bell size={14} style={{ color: '#e8c868' }} />
                      <strong style={{ fontSize: 13 }}>
                        {isHindi ? 'खेत अलर्ट व सूचनाएं' : 'Field Alerts & Advisories'}
                      </strong>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotifsRead}
                        style={{
                          background: 'rgba(255,255,255,0.15)',
                          border: 0,
                          borderRadius: 6,
                          padding: '2px 8px',
                          fontSize: 10,
                          fontWeight: 700,
                          color: '#ffffff',
                          cursor: 'pointer',
                        }}
                      >
                        {isHindi ? 'सभी पढ़ें' : 'Mark all read'}
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #f0f4f1',
                          background: n.read ? '#ffffff' : '#f4fbf6',
                          transition: 'background 0.12s',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <strong
                            style={{
                              fontSize: 12.5,
                              color: n.type === 'urgent' ? '#991b1b' : n.type === 'advisory' ? '#854d0e' : '#166534',
                            }}
                          >
                            {n.title}
                          </strong>
                          <span style={{ fontSize: 10, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                            {n.time}
                          </span>
                        </div>
                        <p style={{ margin: '3px 0 0', fontSize: 11.5, color: '#4b6352', lineHeight: 1.4 }}>
                          {n.detail}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '8px 14px', background: '#faf9f5', borderTop: '1px solid #e5ede8', textAlign: 'center' }}>
                    <Link
                      href="/farmer/history"
                      onClick={() => setNotifsOpen(false)}
                      style={{ fontSize: 11.5, fontWeight: 750, color: '#2b7a4d', textDecoration: 'none' }}
                    >
                      {isHindi ? 'सभी रिपोर्ट इतिहास देखें →' : 'View Full Diagnostic History →'}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive User Profile Menu Popover */}
            <div style={{ position: 'relative' }} ref={profileRef}>
              <div
                onClick={() => setProfileOpen((p) => !p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 10px 4px 4px',
                  borderRadius: 999,
                  border: profileOpen ? '1.5px solid #2b7a4d' : '1px solid var(--line)',
                  background: profileOpen ? '#e8f7ec' : 'var(--card)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  className="ava"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1b4d2e, #2b7a4d)',
                    color: '#ffffff',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 800,
                    fontSize: 12,
                  }}
                >
                  {farmer.initials}
                </span>
                <strong style={{ fontSize: 12.5, color: 'var(--ink)' }} className="hidden sm:inline">
                  {farmer.firstName}
                </strong>
                <ChevronDown size={13} style={{ color: 'var(--muted)', transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
              </div>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: 'min(250px, calc(100vw - 32px))',
                    background: '#ffffff',
                    borderRadius: 18,
                    border: '1.5px solid #d0e4d7',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.14)',
                    zIndex: 200,
                    padding: 8,
                    animation: 'slideDown 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {/* Summary Card */}
                  <div style={{ padding: '10px 12px', background: '#f5f9f6', borderRadius: 12, marginBottom: 6 }}>
                    <strong style={{ fontSize: 13, color: '#1b4d2e', display: 'block' }}>{farmer.name}</strong>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                      +91 {farmer.mobile} • {farmer.location}
                    </span>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                      <span style={{ background: '#dcfce7', color: '#166534', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99 }}>
                        {farmer.farmArea} Acres
                      </span>
                      <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99 }}>
                        {farmer.primaryCrop}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/farmer/profile"
                    onClick={() => setProfileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 10,
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: 'var(--ink)',
                      textDecoration: 'none',
                    }}
                    className="hover:bg-emerald-50"
                  >
                    <UserRound size={15} style={{ color: '#2b7a4d' }} />
                    <span>{t('profile')}</span>
                  </Link>

                  <Link
                    href="/farmer/crop-health-passport"
                    onClick={() => setProfileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 10,
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: 'var(--ink)',
                      textDecoration: 'none',
                    }}
                    className="hover:bg-emerald-50"
                  >
                    <ShieldCheck size={15} style={{ color: '#2b7a4d' }} />
                    <span>{t('cropPassport')}</span>
                  </Link>

                  <div style={{ height: 1, background: '#f0f4f1', margin: '4px 0' }} />

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false)
                      signOut()
                      router.push('/login')
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 10,
                      fontSize: 12.5,
                      fontWeight: 650,
                      color: '#dc2626',
                      background: 'transparent',
                      border: 0,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    className="hover:bg-rose-50"
                  >
                    <LogOut size={15} />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page">{children}</div>

        <FarmerTourVideoModal isOpen={tourOpen} onClose={() => setTourOpen(false)} />
        <AboutUsModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
      </div>

      {/* 3. Global Command & Quick Search Modal Overlay */}
      {searchOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(10, 24, 16, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'grid',
            placeItems: 'center',
            padding: '16px',
            animation: 'fadeIn 0.15s ease-out',
          }}
          onClick={() => setSearchOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 22,
              border: '1.5px solid #c8decb',
              width: '100%',
              maxWidth: 540,
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
              animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 20px',
                borderBottom: '1.5px solid #e3ede5',
                background: '#f9fcf9',
              }}
            >
              <Search size={18} style={{ color: '#2b7a4d' }} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isHindi ? 'फसल, रोग, निदान या उपकरण खोजें...' : 'Search features, crops, diseases, tools...'}
                style={{
                  border: 0,
                  outline: 0,
                  background: 'transparent',
                  width: '100%',
                  fontSize: 15,
                  fontWeight: 650,
                  color: 'var(--ink)',
                }}
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--muted)' }}
                >
                  <X size={16} />
                </button>
              ) : (
                <kbd
                  style={{
                    fontSize: 10,
                    background: '#ffffff',
                    border: '1px solid #c8decb',
                    borderRadius: 6,
                    padding: '2px 6px',
                    fontWeight: 700,
                    color: 'var(--muted)',
                  }}
                >
                  ESC
                </kbd>
              )}
            </div>

            {/* Quick Actions List */}
            <div style={{ maxHeight: 340, overflowY: 'auto', padding: '10px 12px' }}>
              <div style={{ fontSize: 11, fontWeight: 750, color: 'var(--muted)', padding: '6px 8px', textTransform: 'uppercase' }}>
                Quick Navigation & Tools
              </div>

              {filteredCommands.length > 0 ? (
                filteredCommands.map((cmd) => (
                  <Link
                    key={cmd.href + cmd.label}
                    href={cmd.href}
                    onClick={() => setSearchOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 12px',
                      borderRadius: 12,
                      textDecoration: 'none',
                      color: 'var(--ink)',
                      transition: 'background 0.12s',
                    }}
                    className="hover:bg-emerald-50"
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: '#e8f7ec',
                        color: '#1b4d2e',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <cmd.icon size={17} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: 13.5, color: '#1b4d2e', display: 'block' }}>
                        {cmd.label}
                      </strong>
                      <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                        {cmd.sub}
                      </span>
                    </div>
                    <span style={{ background: '#f0fdf4', color: '#166534', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 99 }}>
                      {cmd.tag}
                    </span>
                  </Link>
                ))
              ) : (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                  No matching tools found for "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Modern Mobile Bottom Dock with Elevated Central Scan Button */}
      {/* 4. Modern Mobile Bottom Dock with Elevated Central Scan Button */}
      <nav
        className="dock"
        aria-label="Mobile Navigation"
      >
        {/* Dock Item 1: Home */}
        <Link
          href="/farmer"
          style={{
            color: active('/farmer') && pathname === '/farmer' ? '#1b4d2e' : 'var(--muted)',
            fontWeight: active('/farmer') && pathname === '/farmer' ? 800 : 500,
          }}
        >
          <Home size={19} />
          <span>Home</span>
        </Link>

        {/* Dock Item 2: Passport */}
        <Link
          href="/farmer/crop-health-passport"
          style={{
            color: active('/farmer/crop-health-passport') ? '#1b4d2e' : 'var(--muted)',
            fontWeight: active('/farmer/crop-health-passport') ? 800 : 500,
          }}
        >
          <ShieldCheck size={19} />
          <span>Passport</span>
        </Link>

        {/* Dock Item 3: Center Elevated SCAN Floating Action Button */}
        <Link
          href="/farmer/scan"
          aria-label="Scan crop leaf"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            marginTop: -20,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1b4d2e 0%, #2b7a4d 100%)',
              color: '#ffffff',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 6px 18px rgba(43,122,77,0.4)',
              border: '3px solid #ffffff',
              transition: 'transform 0.15s ease',
            }}
          >
            <Camera size={22} />
          </div>
          <span style={{ fontSize: 9.5, fontWeight: 800, color: '#1b4d2e', marginTop: 2 }}>
            Scan
          </span>
        </Link>

        {/* Dock Item 4: AI Assistant */}
        <Link
          href="/farmer/chat"
          style={{
            color: active('/farmer/chat') ? '#1b4d2e' : 'var(--muted)',
            fontWeight: active('/farmer/chat') ? 800 : 500,
          }}
        >
          <Bot size={19} />
          <span>AI Chat</span>
        </Link>

        {/* Dock Item 5: WhatsApp Channel */}
        <Link
          href="/farmer/whatsapp"
          style={{
            color: active('/farmer/whatsapp') ? '#1b4d2e' : 'var(--muted)',
            fontWeight: active('/farmer/whatsapp') ? 800 : 500,
          }}
        >
          <MessageSquare size={19} />
          <span>WhatsApp</span>
        </Link>
      </nav>
    </div>
  )
}
