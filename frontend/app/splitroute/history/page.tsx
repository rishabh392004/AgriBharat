'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  ShieldCheck,
  Car,
  Clock,
  Download,
  FileText,
  Search,
  ExternalLink,
  ChevronRight,
  ArrowRight,
} from 'lucide-react'
import { useSplitRoute, RideReceipt } from '@/components/splitroute/split-context'
import { SplitRouteReceiptModal } from '@/components/splitroute/receipt-modal'

export default function HistoryPage() {
  const { ytdSavings, carbonAvoidedKg, sharedMiles, hovHoursSaved, receipts } = useSplitRoute()
  const [animatedSavings, setAnimatedSavings] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeReceipt, setActiveReceipt] = useState<RideReceipt | null>(null)

  // Animated number counter on mount
  useEffect(() => {
    let start = 0
    const end = ytdSavings
    const duration = 1200
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const current = parseFloat((end * (1 - Math.pow(1 - progress, 2))).toFixed(2))
      setAnimatedSavings(current)
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [ytdSavings])

  const filteredReceipts = receipts.filter(
    (r) =>
      r.corridor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.date.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleExportAll = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,ReceiptID,Date,Corridor,Driver,Vehicle,DistanceMiles,OperatingPool,PaidSplit,SavingsVsSolo,EscrowSeal\n' +
      receipts
        .map(
          (r) =>
            `${r.id},"${r.date}","${r.corridor}","${r.driverName}","${r.vehicle}",${r.distanceMiles},"${r.operatingCost}",${r.passengerSplit},${r.savingsVsSolo},"${r.escrowSeal}"`
        )
        .join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `SplitRoute_Ledger_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E8E8E1] shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#0D8A50] bg-[#E7F7EE] px-2 py-0.5 rounded uppercase">
            Screen 4 • Cumulative Ledger
          </span>
          <span className="text-xs font-semibold text-[#10343D]">Verified Commute Records</span>
        </div>

        <button
          onClick={handleExportAll}
          className="text-xs font-bold text-[#10343D] hover:text-[#164855] bg-[#F4F4F0] hover:bg-[#EAEAE2] px-3 py-1.5 rounded-xl border border-[#E8E8E1] flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export All Receipts (CSV)</span>
        </button>
      </div>

      {/* Fintech Editorial Savings Hero Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E8E1] shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Main Counter (5 cols) */}
          <div className="md:col-span-5 space-y-2 border-b md:border-b-0 md:border-r border-[#E8E8E1] pb-5 md:pb-0 md:pr-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E7F7EE] text-[#0D8A50] text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>YTD COMMUTE COST SAVINGS</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-[#10343D] tracking-tight">
                ${animatedSavings.toFixed(2)}
              </span>
              <span className="text-sm font-semibold text-[#646A72]">saved</span>
            </div>

            <p className="text-xs text-[#646A72] leading-relaxed">
              Compared to solo driving with FasTrak tolls or commercial Uber/Lyft. You kept{' '}
              <strong className="text-[#10343D]">${animatedSavings.toFixed(2)}</strong> in your pocket while reducing highway congestion.
            </p>
          </div>

          {/* Secondary Impact Metrics (7 cols) */}
          <div className="md:col-span-7 grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-[#FBFBFA] rounded-xl border border-[#E8E8E1]">
              <span className="text-[10px] font-mono text-[#646A72] uppercase block">Carbon Avoided</span>
              <span className="text-2xl font-extrabold text-[#0D8A50]">{carbonAvoidedKg} kg</span>
              <span className="text-[10px] text-[#646A72] block">~8 mature trees</span>
            </div>

            <div className="p-3 bg-[#FBFBFA] rounded-xl border border-[#E8E8E1]">
              <span className="text-[10px] font-mono text-[#646A72] uppercase block">Shared Miles</span>
              <span className="text-2xl font-extrabold text-[#10343D]">{sharedMiles} mi</span>
              <span className="text-[10px] text-[#646A72] block">{receipts.length} trips split</span>
            </div>

            <div className="p-3 bg-[#FBFBFA] rounded-xl border border-[#E8E8E1]">
              <span className="text-[10px] font-mono text-[#646A72] uppercase block">HOV Time Saved</span>
              <span className="text-2xl font-extrabold text-[#E25C38]">{hovHoursSaved} hrs</span>
              <span className="text-[10px] text-[#646A72] block">Carpool lanes</span>
            </div>
          </div>

        </div>
      </div>

      {/* Ride Ledger Table */}
      <div className="bg-white rounded-2xl border border-[#E8E8E1] shadow-sm overflow-hidden space-y-3">
        <div className="p-5 border-b border-[#E8E8E1] flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-base text-[#10343D]">Ride Ledger & Itemized Receipts</h3>
            <p className="text-xs text-[#646A72]">
              Compliant with IRS 26 U.S. Code § 132(f) commuter fringe benefit programs
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#646A72] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search corridor or driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-[#FBFBFA] border border-[#E8E8E1] rounded-xl focus:outline-none focus:border-[#10343D]"
            />
          </div>
        </div>

        <div className="divide-y border-[#E8E8E1]">
          {filteredReceipts.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#646A72]">
              No past ride records found matching your search.
            </div>
          ) : (
            filteredReceipts.map((rec) => (
              <div
                key={rec.id}
                className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-[#FBFBFA] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF2F2] text-[#10343D] flex items-center justify-center font-bold text-xs shrink-0">
                    <FileText className="w-5 h-5 text-[#10343D]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#15181B]">{rec.corridor}</span>
                      <span className="text-[10px] font-mono bg-[#E7F7EE] text-[#0D8A50] px-1.5 py-0.5 rounded font-bold">
                        SETTLED
                      </span>
                    </div>
                    <div className="text-[11px] text-[#646A72] mt-0.5">
                      {rec.date} • Driver: {rec.driverName} ({rec.vehicle}) • {rec.distanceMiles} mi
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-[#15181B] block">
                      ${rec.passengerSplit.toFixed(2)}
                    </span>
                    <span className="text-[11px] font-semibold text-[#0D8A50]">
                      Saved ${rec.savingsVsSolo.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveReceipt(rec)}
                    className="text-xs font-semibold text-[#10343D] px-3.5 py-1.5 bg-[#F4F4F0] hover:bg-[#EAEAE2] rounded-lg border border-[#E8E8E1] transition-transform active:scale-95"
                  >
                    View Receipt
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Digital Receipt Modal */}
      <SplitRouteReceiptModal
        receipt={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />
    </div>
  )
}
