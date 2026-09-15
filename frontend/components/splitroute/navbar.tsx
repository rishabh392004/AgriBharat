'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Navigation, Radio, CheckCircle2, ShieldCheck, Activity } from 'lucide-react'
import { useSplitRoute } from './split-context'

export function SplitRouteNavBar() {
  const pathname = usePathname()
  const { liveSession } = useSplitRoute()
  const isTripActive = liveSession?.status === 'IN_PROGRESS'

  const navItems = [
    { label: 'Overview', href: '/splitroute' },
    { label: '1. Route Setup', href: '/splitroute/route-input' },
    { label: '2. Matches', href: '/splitroute/matches' },
    {
      label: '3. Live Ride',
      href: '/splitroute/live',
      badge: isTripActive ? 'LIVE' : undefined,
    },
    { label: '4. Savings Ledger', href: '/splitroute/history' },
    { label: '5. Design System', href: '/splitroute/design-system' },
  ]

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E8E8E1] px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand & Editorial Masthead */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/splitroute" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#10343D] flex items-center justify-center text-white font-bold shadow-sm transition-transform group-hover:scale-105">
              <Navigation className="w-4 h-4 text-white -rotate-45" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-[#10343D]">SplitRoute</span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-[#E25C38] px-1.5 py-0.5 rounded bg-[#FEF0EB] border border-[#FCD9CE]">
                MVP
              </span>
            </div>
          </Link>
        </div>

        {/* Center Nav Tabs */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-[#EFEFE9] rounded-xl border border-[#E8E8E1] text-xs">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-[#10343D] shadow-sm'
                    : 'text-[#646A72] hover:text-[#10343D]'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="flex items-center gap-1 px-1.5 py-0.2 bg-[#E25C38] text-white text-[9px] font-bold rounded-full animate-pulse">
                    <span className="w-1 h-1 rounded-full bg-white" />
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right Status Corridor Pill */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 bg-[#FFFFFF] px-2.5 py-1 rounded-full border border-[#E8E8E1] text-xs font-medium text-[#10343D]">
            <span className="w-2 h-2 rounded-full bg-[#0D8A50] animate-pulse" />
            <span>SF Bay FastTrak Corridor</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/splitroute/live"
              className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-[#EAF2F2] text-[#10343D] border border-[#D5E6E6] hover:bg-[#DCECEE] transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-[#10343D]" />
              <span className="hidden sm:inline">Trip Status:</span>
              <span className={isTripActive ? 'text-[#E25C38]' : 'text-[#0D8A50]'}>
                {isTripActive ? 'En Route' : 'Ready'}
              </span>
            </Link>

            <div className="w-8 h-8 rounded-full bg-[#10343D] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              AR
            </div>
          </div>
        </div>

      </div>

      {/* Mobile Screen Horizontal Scroll Bar */}
      <div className="flex md:hidden items-center gap-1.5 pt-2 pb-1 overflow-x-auto text-xs no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                isActive
                  ? 'bg-[#10343D] text-white'
                  : 'bg-[#EFEFE9] text-[#646A72]'
              }`}
            >
              {item.label}
              {item.badge && <span className="ml-1 text-[10px] text-[#E25C38]">●</span>}
            </Link>
          )
        })}
      </div>
    </header>
  )
}
