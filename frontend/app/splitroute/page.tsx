'use client'

import React from 'react'
import Link from 'next/link'
import {
  MapPin,
  Navigation,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Car,
  FileText,
  Sliders,
  DollarSign,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react'
import { useSplitRoute } from '@/components/splitroute/split-context'

export default function SplitRouteOverviewPage() {
  const { ytdSavings, carbonAvoidedKg, sharedMiles, liveSession } = useSplitRoute()
  const isLiveActive = liveSession?.status === 'IN_PROGRESS'

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Active Ride Alert Banner (if trip is in progress) */}
      {isLiveActive && (
        <div className="bg-[#10343D] text-white p-4 sm:p-5 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-4 border border-[#164855]">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#E25C38] animate-ping shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white">Live Ride in Progress ({liveSession.tripId})</span>
                <span className="text-[10px] font-mono bg-white/15 px-2 py-0.5 rounded text-white/90">
                  {liveSession.speedMph} mph • {liveSession.currentLocation}
                </span>
              </div>
              <p className="text-xs text-white/70">
                Driver: {liveSession.driverName} ({liveSession.vehicle}) • ETA {liveSession.eta}
              </p>
            </div>
          </div>

          <Link
            href="/splitroute/live"
            className="px-4 py-2 bg-[#E25C38] hover:bg-[#CC4E2C] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 shrink-0"
          >
            <span>View Live Ride</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E8E1] shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF0EB] text-[#E25C38] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PRODUCTION MVP READY</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10343D] tracking-tight leading-tight">
            Fair-share commute matching.<br />
            Audited, wholesale mobility.
          </h1>

          <p className="text-sm sm:text-base text-[#646A72] leading-relaxed">
            SplitRoute re-engineers daily commuter travel by connecting riders on identical arterial routes with drivers already heading that way. Costs are split strictly down to the penny based on EPA fuel burn, actual bridge tolls, and IRS depreciation.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/splitroute/route-input"
              className="px-5 py-3 rounded-xl bg-[#10343D] hover:bg-[#164855] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <span>Setup Commute Route</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/splitroute/matches"
              className="px-5 py-3 rounded-xl bg-[#F4F4F0] hover:bg-[#EAEAE2] text-[#10343D] font-bold text-xs sm:text-sm border border-[#E8E8E1] transition-transform active:scale-95"
            >
              <span>Explore Carpools</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Cumulative Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8E8E1] shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-[#646A72] uppercase">Commute Savings YTD</span>
            <TrendingUp className="w-4 h-4 text-[#0D8A50]" />
          </div>
          <div className="text-3xl font-black text-[#10343D] tracking-tight">${ytdSavings.toFixed(2)}</div>
          <p className="text-[11px] text-[#0D8A50] font-semibold mt-1">Saved vs. Solo Driving & Uber</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E8E1] shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-[#646A72] uppercase">Carbon Footprint Avoided</span>
            <ShieldCheck className="w-4 h-4 text-[#0D8A50]" />
          </div>
          <div className="text-3xl font-black text-[#0D8A50] tracking-tight">{carbonAvoidedKg} kg</div>
          <p className="text-[11px] text-[#646A72] mt-1">~8 mature trees planted</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E8E1] shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-[#646A72] uppercase">Shared Miles</span>
            <Car className="w-4 h-4 text-[#E25C38]" />
          </div>
          <div className="text-3xl font-black text-[#10343D] tracking-tight">{sharedMiles} mi</div>
          <p className="text-[11px] text-[#646A72] mt-1">Across 26 verified shared corridors</p>
        </div>
      </div>

      {/* 5 Core Screens Showcase Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#10343D] tracking-tight">
              Application Architecture & Screens
            </h2>
            <p className="text-xs text-[#646A72]">Explore the 5 core user journey screens</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Card 1 */}
          <Link
            href="/splitroute/route-input"
            className="group bg-white rounded-2xl p-5 border border-[#E8E8E1] shadow-sm hover:shadow-md transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EAF2F2] text-[#10343D] flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#E25C38] uppercase">Screen 1</span>
              <h3 className="font-extrabold text-base text-[#10343D] group-hover:text-[#E25C38] transition-colors">
                Onboarding & Route Input
              </h3>
              <p className="text-xs text-[#646A72] mt-1">
                Enter origin and destination, adjust the detour slider, select departure time, and preview the animated corridor route.
              </p>
            </div>
            <div className="pt-2 text-xs font-bold text-[#10343D] flex items-center gap-1 group-hover:gap-2 transition-all">
              <span>Open Screen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 2 */}
          <Link
            href="/splitroute/matches"
            className="group bg-white rounded-2xl p-5 border border-[#E8E8E1] shadow-sm hover:shadow-md transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FEF0EB] text-[#E25C38] flex items-center justify-center font-bold">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#E25C38] uppercase">Screen 2</span>
              <h3 className="font-extrabold text-base text-[#10343D] group-hover:text-[#E25C38] transition-colors">
                Match Results & Fair Splits
              </h3>
              <p className="text-xs text-[#646A72] mt-1">
                Browse verified drivers, filter by detour time, and inspect the transparent itemized cost allocation formula.
              </p>
            </div>
            <div className="pt-2 text-xs font-bold text-[#10343D] flex items-center gap-1 group-hover:gap-2 transition-all">
              <span>Open Screen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 3 */}
          <Link
            href="/splitroute/live"
            className="group bg-white rounded-2xl p-5 border border-[#E8E8E1] shadow-sm hover:shadow-md transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E7F7EE] text-[#0D8A50] flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#0D8A50] uppercase">Screen 3</span>
              <h3 className="font-extrabold text-base text-[#10343D] group-hover:text-[#0D8A50] transition-colors">
                Live Ride & Cost Meter
              </h3>
              <p className="text-xs text-[#646A72] mt-1">
                Real-time GPS progression along the Bay Bridge span, live expense meter ticking, and instant co-rider escrow settlements.
              </p>
            </div>
            <div className="pt-2 text-xs font-bold text-[#10343D] flex items-center gap-1 group-hover:gap-2 transition-all">
              <span>Open Screen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 4 */}
          <Link
            href="/splitroute/history"
            className="group bg-white rounded-2xl p-5 border border-[#E8E8E1] shadow-sm hover:shadow-md transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F4F4F0] text-[#10343D] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#10343D] uppercase">Screen 4</span>
              <h3 className="font-extrabold text-base text-[#10343D] group-hover:text-[#E25C38] transition-colors">
                Savings Ledger & Receipts
              </h3>
              <p className="text-xs text-[#646A72] mt-1">
                Fintech dashboard with animated counters, itemized digital receipts with cryptographic verification seals, and CSV export.
              </p>
            </div>
            <div className="pt-2 text-xs font-bold text-[#10343D] flex items-center gap-1 group-hover:gap-2 transition-all">
              <span>Open Screen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 5 */}
          <Link
            href="/splitroute/design-system"
            className="group bg-white rounded-2xl p-5 border border-[#E8E8E1] shadow-sm hover:shadow-md transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FEF6E7] text-[#C26E00] flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#C26E00] uppercase">Screen 5</span>
              <h3 className="font-extrabold text-base text-[#10343D] group-hover:text-[#E25C38] transition-colors">
                Stitch Design System Showroom
              </h3>
              <p className="text-xs text-[#646A72] mt-1">
                Color tokens, typography scale tester, 8px spatial grid guidelines, and interactive UI component sandbox.
              </p>
            </div>
            <div className="pt-2 text-xs font-bold text-[#10343D] flex items-center gap-1 group-hover:gap-2 transition-all">
              <span>Open Screen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

        </div>
      </div>
    </div>
  )
}
