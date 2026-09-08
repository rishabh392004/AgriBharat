'use client'

import React, { useState } from 'react'
import { RotateCw, Navigation, MapPin, Gauge } from 'lucide-react'

interface MapViewProps {
  mode?: 'preview' | 'live'
  carProgressPct?: number
  speedMph?: number
  locationLabel?: string
  onStepSimulation?: () => void
}

export function SplitRouteMapView({
  mode = 'preview',
  carProgressPct = 62,
  speedMph = 54,
  locationLabel = 'Bay Bridge Center Span',
  onStepSimulation,
}: MapViewProps) {
  const [animationKey, setAnimationKey] = useState(0)

  const handleReplot = () => {
    setAnimationKey((prev) => prev + 1)
  }

  // Calculate car position along the path based on progress percentage
  // Coordinates for the path: A(100, 280) -> B(220, 180) -> C(380, 180) -> D(560, 110)
  const getCarCoordinates = (pct: number) => {
    if (pct <= 30) {
      const t = pct / 30
      return { x: 100 + (220 - 100) * t, y: 280 + (180 - 280) * t }
    } else if (pct <= 70) {
      const t = (pct - 30) / 40
      return { x: 220 + (380 - 220) * t, y: 180 }
    } else {
      const t = (pct - 70) / 30
      return { x: 380 + (560 - 380) * t, y: 180 + (110 - 180) * t }
    }
  }

  const carPos = getCarCoordinates(carProgressPct)

  return (
    <div className="bg-white rounded-2xl border border-[#E8E8E1] shadow-sm overflow-hidden relative">
      {/* Top Map Bar */}
      <div className="p-3.5 sm:p-4 border-b border-[#E8E8E1] flex items-center justify-between bg-white/95 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0D8A50] animate-pulse" />
          <span className="text-xs font-bold text-[#10343D]">
            {mode === 'live' ? 'GPS Telemetry Active' : 'Bay Bridge Corridor Route'}
          </span>
          <span className="text-[11px] font-mono text-[#646A72] bg-[#F4F4F0] px-2 py-0.5 rounded">
            {mode === 'live' ? `Speed: ${speedMph} mph` : 'I-80 Eastbound'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {mode === 'preview' ? (
            <button
              onClick={handleReplot}
              className="text-[11px] font-semibold text-[#10343D] px-2.5 py-1 bg-[#F4F4F0] hover:bg-[#EAEAE2] rounded-lg border border-[#E8E8E1] flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <RotateCw className="w-3 h-3 text-[#10343D]" />
              <span>Re-plot Route</span>
            </button>
          ) : (
            onStepSimulation && (
              <button
                onClick={onStepSimulation}
                className="text-[11px] font-semibold text-[#10343D] px-2.5 py-1 bg-[#F4F4F0] hover:bg-[#EAEAE2] rounded-lg border border-[#E8E8E1] flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <Gauge className="w-3 h-3 text-[#10343D]" />
                <span>Step GPS</span>
              </button>
            )
          )}
          <div className="text-[11px] font-mono font-medium text-[#646A72] hidden sm:block">
            14.2 mi • 26 min
          </div>
        </div>
      </div>

      {/* Cartographic Vector SVG Canvas */}
      <div className="relative w-full h-[380px] sm:h-[440px] bg-[#EBECE6] overflow-hidden select-none">
        <svg
          key={animationKey}
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="mapWaterGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#D9E4E8" />
              <stop offset="100%" stopColor="#CFDFE5" />
            </linearGradient>

            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#DFE0D8" strokeWidth="0.75" />
            </pattern>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill="#E9EAE3" />
          <rect width="100%" height="100%" fill="url(#gridPattern)" />

          {/* Water Silhouette (SF Bay shoreline) */}
          <path
            d="M 180,0 C 210,120 200,240 260,350 C 290,400 320,420 350,420 L 0,420 L 0,0 Z"
            fill="url(#mapWaterGrad)"
            opacity="0.65"
          />

          {/* Background Arterial City Streets */}
          <path d="M 20,80 L 160,80 L 220,160" stroke="#DFE0D7" strokeWidth="3" fill="none" />
          <path d="M 50,220 L 140,240 L 200,290" stroke="#DFE0D7" strokeWidth="3" fill="none" />
          <path d="M 480,40 L 520,180 L 580,320" stroke="#DFE0D7" strokeWidth="4" fill="none" />
          <path d="M 440,160 L 640,160" stroke="#DFE0D7" strokeWidth="2.5" fill="none" />

          {/* Highway I-80 Bridge Span Bed */}
          <path
            d="M 100,280 L 220,180 L 380,180 L 560,110"
            stroke="#D1D4CA"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />

          {/* Completed Trajectory in Live mode */}
          {mode === 'live' && (
            <path
              d={`M 100,280 L ${carPos.x <= 220 ? carPos.x : 220},${
                carPos.x <= 220 ? carPos.y : 180
              } ${carPos.x > 220 ? `L ${carPos.x},${carPos.y}` : ''}`}
              stroke="#0D8A50"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* Active Carpool Animated Polyline */}
          <path
            d="M 100,280 L 220,180 L 380,180 L 560,110"
            stroke={mode === 'live' ? '#10343D' : '#10343D'}
            strokeWidth={mode === 'live' ? '3.5' : '4.5'}
            strokeDasharray={mode === 'live' ? '6 6' : '600'}
            strokeDashoffset={mode === 'live' ? '0' : '0'}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            style={{
              animation: mode === 'preview' ? 'drawRouteLine 2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' : 'none',
            }}
          />

          {/* Detour Option Arc */}
          <path
            d="M 220,180 Q 280,130 380,180"
            stroke="#E25C38"
            strokeDasharray="4 4"
            strokeWidth="2"
            fill="none"
          />
        </svg>

        {/* Origin Pin (Mission District) */}
        <div className="absolute left-[100px] top-[280px] -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="relative flex items-center justify-center group cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-[#10343D] text-white flex items-center justify-center font-bold text-xs shadow-md ring-2 ring-white">
              A
            </div>
            <div className="absolute -bottom-7 bg-white text-[#15181B] font-bold text-[10px] px-2 py-0.5 rounded shadow-sm border border-[#E8E8E1] whitespace-nowrap">
              420 Guerrero (8:30 AM)
            </div>
          </div>
        </div>

        {/* Detour Node Marker (Treasure Island junction) */}
        <div className="absolute left-[300px] top-[152px] -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="relative flex items-center justify-center cursor-pointer">
            <span className="absolute w-7 h-7 rounded-full bg-[#E25C38]/20 animate-ping" />
            <div className="w-5 h-5 rounded-full bg-[#E25C38] text-white flex items-center justify-center font-bold text-[10px] shadow">
              +1
            </div>
            <div className="absolute -top-7 bg-[#10343D] text-white font-mono text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap">
              Co-Rider Pickup (+4m)
            </div>
          </div>
        </div>

        {/* Live Car Marker (if live mode) */}
        {mode === 'live' && (
          <div
            style={{ left: `${carPos.x}px`, top: `${carPos.y}px` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-700 ease-out"
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute w-10 h-10 rounded-full bg-[#10343D]/25 animate-ping" />
              <div className="w-8 h-8 rounded-full bg-[#10343D] text-white flex items-center justify-center shadow-lg ring-2 ring-white">
                <Navigation className="w-4 h-4 text-white -rotate-45" />
              </div>
              <div className="absolute -top-7 bg-[#10343D] text-white font-mono text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap">
                {speedMph} mph • {locationLabel}
              </div>
            </div>
          </div>
        )}

        {/* Destination Pin (Oakland Broadway) */}
        <div className="absolute left-[560px] top-[110px] -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="relative flex items-center justify-center group cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-[#E25C38] text-white flex items-center justify-center font-bold text-xs shadow-md ring-2 ring-white">
              B
            </div>
            <div className="absolute -bottom-7 bg-white text-[#15181B] font-bold text-[10px] px-2 py-0.5 rounded shadow-sm border border-[#E8E8E1] whitespace-nowrap">
              1955 Broadway (9:04 AM)
            </div>
          </div>
        </div>

        {/* Floating Telemetry Glass Card */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-xl border border-[#E8E8E1] shadow-md z-30 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono text-[#646A72] uppercase tracking-wider block">
              {mode === 'live' ? 'Active Ride Telemetry' : 'Audited Commute Fare'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-[#10343D] tracking-tight">
                {mode === 'live' ? `$${(carProgressPct * 0.095).toFixed(2)} Meter` : '$4.85 / seat'}
              </span>
              <span className="text-xs font-semibold text-[#0D8A50] bg-[#E7F7EE] px-1.5 py-0.5 rounded">
                Save $26.15 vs Commercial Uber
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="text-right">
              <div className="font-bold text-[#15181B]">
                {mode === 'live' ? `${carProgressPct}% Completed` : '3 Active Carpool Matches'}
              </div>
              <div className="text-[#646A72] text-[11px] font-mono">
                {mode === 'live' ? locationLabel : '8:30 AM – 8:45 AM window'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes drawRouteLine {
          from {
            stroke-dashoffset: 600;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  )
}
