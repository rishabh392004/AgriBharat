'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MapPin,
  Clock,
  Users,
  Sliders,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  RotateCw,
} from 'lucide-react'
import { useSplitRoute } from '@/components/splitroute/split-context'
import { SplitRouteMapView } from '@/components/splitroute/map-view'
import { SplitRouteMathBreakdown } from '@/components/splitroute/math-breakdown'

export default function RouteInputPage() {
  const router = useRouter()
  const { currentRoute, updateRoute } = useSplitRoute()

  const [origin, setOrigin] = useState(currentRoute.origin)
  const [destination, setDestination] = useState(currentRoute.destination)
  const [departureTime, setDepartureTime] = useState(currentRoute.departureTime)
  const [seats, setSeats] = useState(currentRoute.seats)
  const [role, setRole] = useState<'passenger' | 'driver'>(currentRoute.role)
  const [detourTolerance, setDetourTolerance] = useState(currentRoute.detourTolerance)

  const handleApplyPreset = (o: string, d: string) => {
    setOrigin(o)
    setDestination(d)
    updateRoute({ origin: o, destination: d })
  }

  const handleFindMatches = () => {
    updateRoute({
      origin,
      destination,
      departureTime,
      seats,
      role,
      detourTolerance,
    })
    router.push('/splitroute/matches')
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Corridor Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E8E8E1] shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#E25C38] bg-[#FEF0EB] px-2 py-0.5 rounded uppercase">
            Screen 1 • Route Configuration
          </span>
          <span className="text-xs font-semibold text-[#10343D]">SF Bay Transit Corridor</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#646A72]">
          <span>Quick Corridors:</span>
          <button
            onClick={() =>
              handleApplyPreset('420 Guerrero St, Mission District, SF', '1955 Broadway, City Center, Oakland')
            }
            className="text-[11px] font-semibold text-[#10343D] hover:underline bg-[#F4F4F0] px-2 py-1 rounded-md"
          >
            SF ⇄ Oakland
          </button>
          <button
            onClick={() =>
              handleApplyPreset('500 Howard St, SoMa, SF', '2100 Shattuck Ave, Downtown Berkeley')
            }
            className="text-[11px] font-semibold text-[#10343D] hover:underline bg-[#F4F4F0] px-2 py-1 rounded-md"
          >
            SF ⇄ Berkeley
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Route Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Editorial Headline */}
          <div className="bg-white rounded-2xl p-6 border border-[#E8E8E1] shadow-sm space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10343D] tracking-tight leading-tight">
              Share your route.<br />Split the true cost.
            </h1>
            <p className="text-xs sm:text-sm text-[#646A72] leading-relaxed">
              No surge pricing or hidden middleman cuts. Costs are split strictly down to the penny based on actual EPA fuel rates, FastTrak tolls, and IRS depreciation.
            </p>

            {/* Commuter Role Switcher */}
            <div className="pt-3">
              <label className="text-[11px] font-bold text-[#646A72] uppercase tracking-wider block mb-2">
                My Commute Role
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#F4F4F0] rounded-xl border border-[#E8E8E1]">
                <button
                  type="button"
                  onClick={() => setRole('passenger')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                    role === 'passenger' ? 'bg-white text-[#10343D] shadow-sm' : 'text-[#646A72]'
                  }`}
                >
                  Need a Ride
                </button>
                <button
                  type="button"
                  onClick={() => setRole('driver')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                    role === 'driver' ? 'bg-white text-[#10343D] shadow-sm' : 'text-[#646A72]'
                  }`}
                >
                  Offering Seats
                </button>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#E8E8E1] shadow-sm space-y-4">
            <div className="relative space-y-3">
              <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-[#E8E8E1]" />

              {/* Origin */}
              <div>
                <label className="text-[11px] font-bold text-[#646A72] uppercase tracking-wider block mb-1">
                  Pickup Origin
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 w-2.5 h-2.5 rounded-full bg-[#10343D] ring-4 ring-[#EAF2F2]" />
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#FBFBFA] border border-[#E8E8E1] rounded-xl text-xs font-semibold text-[#15181B] focus:outline-none focus:border-[#10343D] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Destination */}
              <div>
                <label className="text-[11px] font-bold text-[#646A72] uppercase tracking-wider block mb-1">
                  Dropoff Destination
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 w-2.5 h-2.5 rounded-full bg-[#E25C38] ring-4 ring-[#FEF0EB]" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#FBFBFA] border border-[#E8E8E1] rounded-xl text-xs font-semibold text-[#15181B] focus:outline-none focus:border-[#10343D] focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Schedule & Seats */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[11px] font-bold text-[#646A72] uppercase tracking-wider block mb-1">
                  Departure Time
                </label>
                <select
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FBFBFA] border border-[#E8E8E1] rounded-xl text-xs font-medium text-[#15181B] focus:outline-none focus:border-[#10343D]"
                >
                  <option>Today, 8:30 AM</option>
                  <option>Today, 8:45 AM</option>
                  <option>Today, 9:00 AM</option>
                  <option>Today, 5:30 PM (Return)</option>
                  <option>Recurring M-F Commute Pod</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#646A72] uppercase tracking-wider block mb-1">
                  Seats Requested
                </label>
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#FBFBFA] border border-[#E8E8E1] rounded-xl">
                  <button
                    type="button"
                    onClick={() => setSeats(Math.max(1, seats - 1))}
                    className="text-[#646A72] hover:text-[#10343D] text-sm font-bold px-1"
                  >
                    −
                  </button>
                  <span className="text-xs font-bold text-[#10343D]">
                    {seats} {seats === 1 ? 'Seat' : 'Seats'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSeats(Math.min(4, seats + 1))}
                    className="text-[#646A72] hover:text-[#10343D] text-sm font-bold px-1"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Detour Tolerance Slider */}
            <div className="pt-2 border-t border-[#E8E8E1]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-[#15181B]">Max Detour Tolerance</span>
                <span className="text-xs font-mono font-bold text-[#E25C38] bg-[#FEF0EB] px-2 py-0.5 rounded">
                  +{detourTolerance} min
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="20"
                step="2"
                value={detourTolerance}
                onChange={(e) => setDetourTolerance(Number(e.target.value))}
                className="w-full accent-[#E25C38] cursor-pointer"
              />
              <p className="text-[11px] text-[#646A72] mt-1">
                Accepting +{detourTolerance} min detour unlocks <strong>4 extra drivers</strong> and saves <strong>$3.20</strong> per trip.
              </p>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleFindMatches}
              className="w-full py-3 px-4 rounded-xl bg-[#10343D] hover:bg-[#164855] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98]"
            >
              <span>Find Matching Carpools</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Guarantee Badge */}
          <div className="bg-[#F4F4F0] rounded-xl p-4 border border-[#E8E8E1] flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#10343D] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#10343D]">Audited Fair-Share Math</h4>
              <p className="text-[11px] text-[#646A72] leading-normal">
                Drivers cannot markup prices. Split calculated automatically: (Gas + Bridge Toll $7.00 + Vehicle Wear) ÷ Total Occupants.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Map Preview & Math Formula (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <SplitRouteMapView mode="preview" />
          <SplitRouteMathBreakdown
            fuel={1.40}
            toll={7.00}
            wear={1.15}
            occupants={2}
            fuelLabel="Electric (0.32 kWh/mi @ $0.31/kWh)"
            totalSplit={4.75}
          />
        </div>

      </div>
    </div>
  )
}
