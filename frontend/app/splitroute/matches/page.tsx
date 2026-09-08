'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sliders, Filter, Sparkles, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { useSplitRoute, INITIAL_MATCHES, DriverMatch } from '@/components/splitroute/split-context'
import { SplitRouteMatchCard } from '@/components/splitroute/match-card'

export default function MatchesPage() {
  const router = useRouter()
  const { currentRoute, selectMatch } = useSplitRoute()

  const [sortBy, setSortBy] = useState<'cost' | 'detour' | 'rating'>('cost')
  const [showSkeleton, setShowSkeleton] = useState(false)
  const [filterVerified, setFilterVerified] = useState(true)

  const handleSelectMatch = (match: DriverMatch) => {
    selectMatch(match)
    router.push('/splitroute/live')
  }

  // Filter and sort matches
  const sortedMatches = [...INITIAL_MATCHES].sort((a, b) => {
    if (sortBy === 'cost') return a.estimatedSplit - b.estimatedSplit
    if (sortBy === 'detour') return a.detourMinutes - b.detourMinutes
    if (sortBy === 'rating') return b.rating - a.rating
    return 0
  })

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back Link & Corridor Status */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8E8E1] shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/splitroute/route-input"
              className="text-xs font-semibold text-[#646A72] hover:text-[#10343D] flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Modify Route</span>
            </Link>
            <span className="text-[#D1D1C7]">/</span>
            <span className="text-xs font-mono font-bold text-[#E25C38] uppercase">
              Screen 2 • Match Engine
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-[#10343D] tracking-tight">
            3 Verified Carpools Matching Your Commute
          </h2>
          <p className="text-xs text-[#646A72] mt-0.5">
            {currentRoute.origin.split(',')[0]} → {currentRoute.destination.split(',')[0]} • {currentRoute.departureTime}
          </p>
        </div>

        {/* Filter & Sort Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-[#F4F4F0] px-3 py-1.5 rounded-xl border border-[#E8E8E1]">
            <span className="text-[#646A72] font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-bold text-[#10343D] focus:outline-none cursor-pointer"
            >
              <option value="cost">Lowest Split Cost</option>
              <option value="detour">Minimal Detour</option>
              <option value="rating">Top Driver Rating</option>
            </select>
          </div>

          <button
            onClick={() => setShowSkeleton(!showSkeleton)}
            className="px-3 py-1.5 rounded-xl border border-[#E8E8E1] font-semibold text-[#646A72] hover:text-[#10343D] bg-[#F4F4F0] transition-colors"
          >
            {showSkeleton ? 'Show Real Cards' : 'Test Skeleton Shimmer'}
          </button>
        </div>
      </div>

      {/* SKELETON SHIMMER STATE (IF TOGGLED) */}
      {showSkeleton ? (
        <div className="space-y-4">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-[#E8E8E1] shadow-sm space-y-4 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#EAEAE2]" />
                <div className="space-y-2 flex-1">
                  <div className="w-44 h-4 rounded bg-[#EAEAE2]" />
                  <div className="w-64 h-3 rounded bg-[#EAEAE2]" />
                </div>
                <div className="w-28 h-9 rounded-xl bg-[#EAEAE2]" />
              </div>
              <div className="w-full h-10 rounded-xl bg-[#F4F4F0]" />
            </div>
          ))}
        </div>
      ) : (
        /* REAL MATCH CARDS LIST */
        <div className="space-y-4">
          {sortedMatches.map((match) => (
            <SplitRouteMatchCard
              key={match.id}
              match={match}
              onSelectMatch={handleSelectMatch}
            />
          ))}
        </div>
      )}

      {/* Trust & Guarantee Banner */}
      <div className="p-4 rounded-2xl bg-[#EAF2F2] border border-[#D5E6E6] flex flex-wrap items-center justify-between gap-4 text-xs text-[#10343D]">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[#0D8A50] shrink-0" />
          <div>
            <strong className="block font-bold">100% Escrow Protection Guarantee</strong>
            <span className="text-[#646A72] text-[11px]">
              Fare holds are only disbursed to the driver once your arrival at the destination is cryptographically verified by GPS.
            </span>
          </div>
        </div>

        <span className="font-mono text-[11px] font-bold text-[#0D8A50] bg-white px-3 py-1 rounded-lg border border-[#D5E6E6]">
          23 U.S.C. § 146 COMPLIANT
        </span>
      </div>
    </div>
  )
}
