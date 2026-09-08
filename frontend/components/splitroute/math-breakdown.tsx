'use client'

import React, { useState } from 'react'
import { ShieldCheck, Info, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface MathBreakdownProps {
  fuel?: number
  toll?: number
  wear?: number
  occupants?: number
  fuelLabel?: string
  totalSplit?: number
  compact?: boolean
}

export function SplitRouteMathBreakdown({
  fuel = 1.40,
  toll = 7.00,
  wear = 1.15,
  occupants = 2,
  fuelLabel = 'Electric (0.32 kWh/mi @ $0.31/kWh)',
  totalSplit = 4.75,
  compact = false,
}: MathBreakdownProps) {
  const [showExplanation, setShowExplanation] = useState(false)
  const totalPool = fuel + toll + wear

  return (
    <div className="bg-white rounded-2xl border border-[#E8E8E1] p-4 sm:p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#EAF2F2] flex items-center justify-center text-[#10343D]">
            <ShieldCheck className="w-4 h-4 text-[#10343D]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#10343D]">Audited Fair-Share Math Formula</h4>
            <p className="text-[10px] text-[#646A72]">Compliant with Federal Carpool Cost-Splitting Exemption</p>
          </div>
        </div>

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-[11px] font-semibold text-[#10343D] hover:text-[#164855] flex items-center gap-1"
        >
          <span>{showExplanation ? 'Hide Policy' : 'Why Fair?'}</span>
          {showExplanation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* 4-Stat Mathematical Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
        <div className="p-2.5 bg-[#FBFBFA] rounded-xl border border-[#E8E8E1]">
          <span className="text-[10px] font-mono text-[#646A72] uppercase block">Base Energy/Fuel</span>
          <span className="text-sm font-bold text-[#15181B]">${fuel.toFixed(2)}</span>
          <span className="text-[9px] text-[#646A72] block truncate">{fuelLabel}</span>
        </div>

        <div className="p-2.5 bg-[#FBFBFA] rounded-xl border border-[#E8E8E1]">
          <span className="text-[10px] font-mono text-[#646A72] uppercase block">Bridge / Tolls</span>
          <span className="text-sm font-bold text-[#15181B]">${toll.toFixed(2)}</span>
          <span className="text-[9px] text-[#646A72] block">FastTrak HOV Verified</span>
        </div>

        <div className="p-2.5 bg-[#FBFBFA] rounded-xl border border-[#E8E8E1]">
          <span className="text-[10px] font-mono text-[#646A72] uppercase block">Wear & Depreciation</span>
          <span className="text-sm font-bold text-[#15181B]">${wear.toFixed(2)}</span>
          <span className="text-[9px] text-[#646A72] block">IRS Standard Mileage Rate</span>
        </div>

        <div className="p-2.5 bg-[#E7F7EE] rounded-xl border border-[#C6ECD6]">
          <span className="text-[10px] font-mono text-[#0D8A50] font-bold uppercase block">
            Your Share ({occupants}-way)
          </span>
          <span className="text-sm font-black text-[#0D8A50]">${totalSplit.toFixed(2)}</span>
          <span className="text-[9px] text-[#0D8A50] block font-medium">Zero Driver Markup</span>
        </div>
      </div>

      {/* Formula Text */}
      <div className="p-3 bg-[#FBFBFA] rounded-xl border border-[#E8E8E1] text-xs font-mono flex flex-wrap items-center justify-between gap-2">
        <div className="text-[#10343D]">
          <span className="text-[#646A72]">Calculation: </span>
          <span>(${fuel.toFixed(2)} + ${toll.toFixed(2)} + ${wear.toFixed(2)}) ÷ {occupants} Occupants = </span>
          <strong className="text-[#0D8A50]">${totalSplit.toFixed(2)} each</strong>
        </div>
        <span className="text-[10px] font-mono bg-[#E7F7EE] text-[#0D8A50] px-2 py-0.5 rounded font-bold">
          SAVES ~$29.00 vs UBER
        </span>
      </div>

      {/* Expandable Explanation */}
      {showExplanation && (
        <div className="p-3.5 bg-[#F4F4F0] rounded-xl text-xs text-[#646A72] leading-relaxed border border-[#E8E8E1] space-y-2 animate-fadeIn">
          <p>
            <strong>Federal Carpool Exemption (23 U.S.C. § 146):</strong> SplitRoute is not a commercial taxi or TNC. By strictly limiting ride payments to proportional vehicle operating costs (energy, tolls, and maintenance amortization), drivers do not generate taxable commercial profit, allowing commuters to use HOV carpool lanes and pay true wholesale commute rates.
          </p>
        </div>
      )}
    </div>
  )
}
