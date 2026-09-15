'use client'

import React, { useState } from 'react'
import { ArrowRight, CheckCircle2, Star, Shield, Car, ChevronDown, ChevronUp } from 'lucide-react'
import type { DriverMatch } from './split-context'

interface MatchCardProps {
  match: DriverMatch
  onSelectMatch: (match: DriverMatch) => void
}

export function SplitRouteMatchCard({ match, onSelectMatch }: MatchCardProps) {
  const [showMath, setShowMath] = useState(false)

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E8E8E1] shadow-sm hover:shadow-md transition-all duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        
        {/* Column 1: Driver Profile (4 cols) */}
        <div className="lg:col-span-4 flex items-start gap-3.5">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full bg-[#164855] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {match.driverAvatar}
            </div>
            {match.verified && (
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0D8A50] text-white flex items-center justify-center text-[10px] ring-2 ring-white shadow-sm"
                title="Verified Commuter"
              >
                ✓
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-[#10343D] truncate">{match.driverName}</h3>
              <span className="text-xs font-mono font-bold text-[#15181B] flex items-center gap-0.5 shrink-0">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{match.rating.toFixed(2)}</span>
              </span>
            </div>

            <p className="text-xs text-[#646A72] font-medium truncate">{match.driverRole}</p>

            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[10px] font-mono bg-[#F4F4F0] text-[#15181B] px-2 py-0.5 rounded font-medium">
                {match.vehicle}
              </span>
              <span className="text-[10px] font-mono bg-[#E7F7EE] text-[#0D8A50] px-2 py-0.5 rounded font-bold">
                {match.availableSeats} {match.availableSeats === 1 ? 'Seat Left' : 'Seats Left'}
              </span>
            </div>
          </div>
        </div>

        {/* Column 2: Route Compatibility (4 cols) */}
        <div className="lg:col-span-4 space-y-2 py-2 lg:py-0 border-y lg:border-y-0 lg:border-x border-[#E8E8E1] lg:px-5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10343D]" />
              <span className="font-semibold text-[#15181B]">Pickup {match.pickupTime}</span>
            </div>
            <span className="text-[#646A72] text-[11px] font-mono">{match.pickupWalk}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E25C38]" />
              <span className="font-semibold text-[#15181B]">Dropoff {match.dropoffTime}</span>
            </div>
            <span className="text-[#646A72] text-[11px] font-mono">{match.dropoffWalk}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-[#646A72]">Route Overlap:</span>
            <span className="font-bold text-[#10343D]">{match.routeOverlapPct}% Direct</span>
            <span
              className={`font-semibold px-1.5 py-0.5 rounded ${
                match.detourMinutes === 0
                  ? 'bg-[#E7F7EE] text-[#0D8A50]'
                  : 'bg-[#FEF0EB] text-[#E25C38]'
              }`}
            >
              +{match.detourMinutes} min detour
            </span>
          </div>
        </div>

        {/* Column 3: Split Cost & CTA (4 cols) */}
        <div className="lg:col-span-4 flex items-center justify-between lg:justify-end gap-5">
          <div className="text-left lg:text-right">
            <div className="text-[10px] font-mono text-[#646A72] uppercase tracking-wider">Your Split Share</div>
            <div className="flex items-baseline lg:justify-end gap-1.5">
              <span className="text-2xl font-black text-[#10343D] tracking-tight">
                ${match.estimatedSplit.toFixed(2)}
              </span>
              <span className="text-xs text-[#646A72] line-through">${match.soloCost.toFixed(2)}</span>
            </div>
            <div className="text-[10px] font-bold text-[#0D8A50]">
              Saves ${match.savings.toFixed(2)} vs Solo
            </div>
          </div>

          <div className="flex flex-col gap-1.5 shrink-0">
            <button
              onClick={() => onSelectMatch(match)}
              className="py-2.5 px-4 rounded-xl bg-[#E25C38] hover:bg-[#CC4E2C] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-[0.98]"
            >
              <span>Join Ride</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowMath(!showMath)}
              className="text-[11px] font-medium text-[#10343D] hover:underline text-center flex items-center justify-center gap-0.5"
            >
              <span>Audit Math</span>
              {showMath ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

      </div>

      {/* Collapsible Math Audit */}
      {showMath && (
        <div className="mt-4 pt-4 border-t border-[#E8E8E1] text-xs bg-[#FBFBFA] p-3.5 rounded-xl space-y-2 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-center">
            <div className="p-2 border-r border-[#E8E8E1]">
              <div className="text-[#646A72] text-[10px] uppercase font-mono">Fuel / Energy</div>
              <div className="font-bold text-[#15181B]">${match.breakdown.fuel.toFixed(2)}</div>
            </div>
            <div className="p-2 border-r border-[#E8E8E1]">
              <div className="text-[#646A72] text-[10px] uppercase font-mono">Bay Bridge Toll</div>
              <div className="font-bold text-[#15181B]">${match.breakdown.toll.toFixed(2)}</div>
            </div>
            <div className="p-2 border-r border-[#E8E8E1]">
              <div className="text-[#646A72] text-[10px] uppercase font-mono">IRS Amort. Wear</div>
              <div className="font-bold text-[#15181B]">${match.breakdown.wear.toFixed(2)}</div>
            </div>
            <div className="p-2 bg-white rounded-lg border border-[#E8E8E1]">
              <div className="text-[#0D8A50] font-bold text-[10px] uppercase font-mono">Verified Result</div>
              <div className="font-black text-xs text-[#0D8A50]">${match.estimatedSplit.toFixed(2)} / seat</div>
            </div>
          </div>
          <p className="text-[11px] text-[#646A72] text-center font-mono">
            {match.breakdown.formulaText}
          </p>
        </div>
      )}
    </div>
  )
}
