'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Activity,
  Car,
  Clock,
  ShieldCheck,
  Share2,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  ArrowRight,
} from 'lucide-react'
import { useSplitRoute } from '@/components/splitroute/split-context'
import { SplitRouteMapView } from '@/components/splitroute/map-view'

export default function LiveRidePage() {
  const router = useRouter()
  const {
    liveSession,
    addLiveToll,
    updateLiveGpsStep,
    completeLiveRide,
  } = useSplitRoute()

  const [simStep, setSimStep] = useState(2)
  const [copiedShare, setCopiedShare] = useState(false)

  if (!liveSession) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-[#E8E8E1] shadow-sm text-center space-y-4 animate-fadeIn">
        <div className="w-12 h-12 rounded-full bg-[#F4F4F0] text-[#10343D] flex items-center justify-center mx-auto">
          <Car className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-extrabold text-[#10343D]">No Active Commute in Progress</h2>
        <p className="text-xs text-[#646A72] max-w-md mx-auto">
          You are not currently enrolled in an active carpool session. Setup your route or browse existing verified corridors.
        </p>
        <Link
          href="/splitroute/route-input"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#10343D] text-white text-xs font-bold shadow-sm"
        >
          <span>Setup Route</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    )
  }

  const handleStepSimulation = () => {
    const nextStep = simStep + 1
    setSimStep(nextStep)
    updateLiveGpsStep(nextStep)
  }

  const handleAddExpressToll = () => {
    addLiveToll(2.00)
  }

  const handleShareTelemetry = () => {
    setCopiedShare(true)
    setTimeout(() => setCopiedShare(false), 2500)
  }

  const handleFinishTrip = () => {
    completeLiveRide()
    router.push('/splitroute/history')
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-[#10343D] text-white rounded-2xl p-5 sm:p-6 shadow-md space-y-4 border border-[#164855]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#E25C38] animate-ping" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#E25C38]">
              LIVE RIDE TELEMETRY • {liveSession.tripId}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-white/10 px-2.5 py-1 rounded-lg text-white/90">
              Host: {liveSession.driverName} ({liveSession.vehicle})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div>
            <span className="text-[10px] uppercase font-mono text-white/70 block">Estimated Arrival</span>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline gap-2">
              <span>{liveSession.eta}</span>
              <span className="text-xs font-semibold text-[#0D8A50] bg-[#E7F7EE] px-2 py-0.5 rounded">
                On Schedule
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono text-white/70 block">Current Milestone</span>
            <div className="text-sm font-bold text-white mt-1">{liveSession.currentLocation}</div>
            <span className="text-[11px] text-white/60 font-mono">Speed: {liveSession.speedMph} mph</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono text-white/70 block">Destination</span>
            <div className="text-sm font-bold text-white mt-1 truncate">{liveSession.destination}</div>
            <span className="text-[11px] text-white/60">Arriving in ~8 mins</span>
          </div>
        </div>

        {/* Dynamic Route Progress Bar */}
        <div className="space-y-1.5 pt-2 border-t border-white/10">
          <div className="flex justify-between text-xs text-white/80 font-mono">
            <span>{liveSession.origin.split(',')[0]}</span>
            <span>{liveSession.currentLocation} ({liveSession.progressPct}% completed)</span>
            <span>{liveSession.destination.split(',')[0]}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-[#E25C38] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${liveSession.progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Left Expense Ledger + Right GPS Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Dynamic Expense Ledger (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white rounded-2xl p-5 border border-[#E8E8E1] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E1]">
              <div>
                <h3 className="font-extrabold text-base text-[#10343D]">Live Expense Meter</h3>
                <p className="text-xs text-[#646A72]">Recalculated every 100 meters</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-[#646A72] uppercase block">Cumulative Pool</span>
                <span className="text-2xl font-black text-[#10343D] tracking-tight">
                  ${liveSession.totalOperatingCost.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Co-Rider Settlement Roster */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-[#646A72] uppercase tracking-wider block">
                Co-Rider Settlement Status
              </label>

              {liveSession.coRiders.map((cr) => {
                const isRiderOne = cr.id === 'cr-you'
                return (
                  <div
                    key={cr.id}
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      isRiderOne
                        ? 'bg-white border-[#0D8A50] ring-2 ring-[#0D8A50]/20'
                        : 'bg-[#FBFBFA] border-[#E8E8E1]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                          isRiderOne
                            ? 'bg-[#0D8A50] text-white'
                            : 'bg-[#10343D] text-white'
                        }`}
                      >
                        {cr.avatar}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#10343D]">{cr.name}</div>
                        <div className="text-[11px] text-[#646A72]">{cr.paymentMethod}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-[#15181B] block">
                        ${cr.amount.toFixed(2)}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                          cr.status === 'PAID'
                            ? 'bg-[#E7F7EE] text-[#0D8A50]'
                            : cr.status === 'ESCROW_SECURED'
                            ? 'bg-[#EAF2F2] text-[#10343D]'
                            : 'bg-[#FEF6E7] text-[#C26E00]'
                        }`}
                      >
                        {cr.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* In-Ride Quick Action Trays */}
            <div className="pt-2 grid grid-cols-2 gap-2">
              <button
                onClick={handleAddExpressToll}
                className="py-2.5 px-3 rounded-xl bg-[#F4F4F0] hover:bg-[#EAEAE2] text-xs font-bold text-[#10343D] border border-[#E8E8E1] flex items-center justify-center gap-1.5 transition-transform active:scale-95"
              >
                <DollarSign className="w-3.5 h-3.5 text-[#10343D]" />
                <span>+ $2 Express Toll</span>
              </button>

              <button
                onClick={handleShareTelemetry}
                className="py-2.5 px-3 rounded-xl bg-[#F4F4F0] hover:bg-[#EAEAE2] text-xs font-bold text-[#10343D] border border-[#E8E8E1] flex items-center justify-center gap-1.5 transition-transform active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5 text-[#10343D]" />
                <span>{copiedShare ? 'Link Copied!' : 'Share Live Trip'}</span>
              </button>
            </div>

            {/* Complete Ride Trigger */}
            <div className="pt-3 border-t border-[#E8E8E1]">
              <button
                onClick={handleFinishTrip}
                className="w-full py-3 px-4 rounded-xl bg-[#0D8A50] hover:bg-[#0B7342] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Arrived at Destination • Finalize Settlement</span>
              </button>
              <p className="text-[10px] text-[#646A72] text-center mt-1.5">
                Funds released from escrow; receipt logged to Savings Dashboard.
              </p>
            </div>

          </div>

        </div>

        {/* Right: Real-time GPS Vector Map (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <SplitRouteMapView
            mode="live"
            carProgressPct={liveSession.progressPct}
            speedMph={liveSession.speedMph}
            locationLabel={liveSession.currentLocation}
            onStepSimulation={handleStepSimulation}
          />
        </div>

      </div>
    </div>
  )
}
