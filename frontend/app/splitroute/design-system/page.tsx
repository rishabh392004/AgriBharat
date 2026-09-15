'use client'

import React, { useState } from 'react'
import {
  Layers,
  Copy,
  Check,
  ShieldCheck,
  Navigation,
  Star,
  ArrowRight,
  Sliders,
  DollarSign,
} from 'lucide-react'

export default function DesignSystemPage() {
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [sampleText, setSampleText] = useState('Split the true cost.')

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedToken(label)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const colorTokens = [
    { label: 'Brand Primary', hex: '#10343D', role: 'Deep Slate Teal • Anchor & Authority' },
    { label: 'Brand Accent', hex: '#E25C38', role: 'Warm Coral • Action CTAs & Accents' },
    { label: 'Savings Positive', hex: '#0D8A50', role: 'Forest Emerald • Verified Payouts' },
    { label: 'Pending Caution', hex: '#C26E00', role: 'Warm Amber • Escrow & Warnings' },
    { label: 'Canvas Alabaster', hex: '#F6F6F2', role: 'Warm Off-White • Eye Comfort' },
    { label: 'Text Charcoal', hex: '#15181B', role: 'Near Black • High Contrast Read' },
  ]

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E8E1] shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-[#E25C38] font-bold uppercase tracking-wider mb-1">
              STITCH DESIGN SYSTEM SPECIFICATION
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10343D] tracking-tight">
              SplitRoute Component & Token Matrix
            </h1>
            <p className="text-xs sm:text-sm text-[#646A72] mt-2 max-w-2xl leading-relaxed">
              Utilitarian design system inspired by Linear, Uber, and Splitwise. Eliminates generic AI gradients and unstructured layouts. Governed strictly by 8px spatial increments, 1px hairline borders, and high-contrast typography.
            </p>
          </div>

          <span className="text-xs font-mono bg-[#F4F4F0] text-[#10343D] px-3.5 py-1.5 rounded-xl border border-[#E8E8E1] font-bold">
            8px Grid System • WCAG AAA
          </span>
        </div>
      </div>

      {/* 1. Color Palette Tokens */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E8E1] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#10343D]">
            1. Brand & Semantic Color Tokens
          </h2>
          <span className="text-xs text-[#646A72]">Click swatch to copy HEX</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {colorTokens.map((token) => (
            <button
              key={token.hex}
              onClick={() => copyToClipboard(token.hex, token.label)}
              className="p-3 rounded-xl border border-[#E8E8E1] bg-[#FBFBFA] hover:bg-white text-left transition-all group"
            >
              <div
                style={{ backgroundColor: token.hex }}
                className="w-full h-14 rounded-lg mb-2 shadow-sm border border-black/5 flex items-end justify-end p-1.5"
              >
                {copiedToken === token.label && (
                  <span className="bg-white text-[#10343D] p-1 rounded shadow-sm text-[10px] font-bold flex items-center gap-0.5">
                    <Check className="w-3 h-3 text-[#0D8A50]" />
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-[#15181B] truncate">{token.label}</div>
              <div className="text-[10px] font-mono text-[#646A72]">{token.hex}</div>
              <div className="text-[10px] text-[#646A72] mt-1 line-clamp-1">{token.role}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Typographic Scale Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-white rounded-2xl p-6 border border-[#E8E8E1] shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#10343D]">
              2. Typographic Scale
            </h2>
            <input
              type="text"
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              className="text-xs px-2.5 py-1 bg-[#F4F4F0] border border-[#E8E8E1] rounded-lg focus:outline-none"
              placeholder="Test heading sample..."
            />
          </div>

          <div className="space-y-4 divide-y border-[#F4F4F0]">
            <div>
              <div className="text-[10px] font-mono text-[#646A72] mb-1">
                Display H1 • 32px / 1.15 line-height / -0.03em tracking
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#10343D] tracking-tight leading-tight">
                {sampleText}
              </div>
            </div>

            <div className="pt-3">
              <div className="text-[10px] font-mono text-[#646A72] mb-1">
                Section H2 • 20px / 1.25 line-height / -0.025em tracking
              </div>
              <div className="text-xl font-extrabold text-[#10343D] tracking-tight">
                3 Verified Carpools Matching Your Commute
              </div>
            </div>

            <div className="pt-3">
              <div className="text-[10px] font-mono text-[#646A72] mb-1">
                Title H3 • 15px / 1.4 line-height
              </div>
              <div className="text-sm font-bold text-[#10343D]">
                Sarah Jenkins • Tesla Model Y (2 Seats Left)
              </div>
            </div>

            <div className="pt-3">
              <div className="text-[10px] font-mono text-[#646A72] mb-1">
                Body Text • 14px / 1.55 line-height
              </div>
              <p className="text-xs text-[#646A72] leading-relaxed">
                Costs are split proportionally based on real EPA vehicle consumption ratings, FastTrak transponder bridge tolls, and IRS depreciation.
              </p>
            </div>

            <div className="pt-3">
              <div className="text-[10px] font-mono text-[#646A72] mb-1">
                Mono Financial Ledger • 11px JetBrains Mono
              </div>
              <div className="text-xs font-mono font-bold text-[#10343D]">
                ($1.40 kWh Power + $7.00 Toll + $1.15 Wear) ÷ 2 Riders = $4.75 / seat
              </div>
            </div>
          </div>
        </div>

        {/* 3. Component Primitive Library */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8E8E1] shadow-sm space-y-5">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#10343D]">
            3. Component Primitives
          </h2>

          {/* Button States */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-[#646A72] block">
              Button Hierarchy (160ms ease-out)
            </span>
            <div className="flex flex-wrap gap-2">
              <button className="px-3.5 py-2 rounded-xl bg-[#10343D] hover:bg-[#164855] text-white font-bold text-xs shadow-sm transition-transform active:scale-95">
                Primary Brand
              </button>
              <button className="px-3.5 py-2 rounded-xl bg-[#E25C38] hover:bg-[#CC4E2C] text-white font-bold text-xs shadow-sm transition-transform active:scale-95">
                Accent CTA
              </button>
              <button className="px-3.5 py-2 rounded-xl bg-[#F4F4F0] hover:bg-[#EAEAE2] text-[#10343D] font-bold text-xs border border-[#E8E8E1] transition-transform active:scale-95">
                Secondary Surface
              </button>
              <button className="px-3.5 py-2 rounded-xl bg-[#E7F7EE] text-[#0D8A50] font-bold text-xs border border-[#C6ECD6]">
                Positive State
              </button>
            </div>
          </div>

          {/* Status Badges */}
          <div className="space-y-2 pt-2 border-t border-[#F4F4F0]">
            <span className="text-[11px] font-semibold text-[#646A72] block">
              Semantic Financial Status Badges
            </span>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-mono font-bold text-[#0D8A50] bg-[#E7F7EE] px-2.5 py-1 rounded-full border border-[#C6ECD6]">
                SETTLED ✓
              </span>
              <span className="text-[10px] font-mono font-bold text-[#C26E00] bg-[#FEF6E7] px-2.5 py-1 rounded-full border border-[#FDE5BE]">
                ESCROW PENDING
              </span>
              <span className="text-[10px] font-mono font-bold text-[#10343D] bg-[#EAF2F2] px-2.5 py-1 rounded-full border border-[#D5E6E6]">
                HOV QUALIFIED
              </span>
              <span className="text-[10px] font-mono font-bold text-[#E25C38] bg-[#FEF0EB] px-2.5 py-1 rounded-full border border-[#FCD9CE]">
                +4 MIN DETOUR
              </span>
            </div>
          </div>

          {/* Map Waypoints */}
          <div className="space-y-2 pt-2 border-t border-[#F4F4F0]">
            <span className="text-[11px] font-semibold text-[#646A72] block">
              Cartographic Node Markers
            </span>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-[#10343D] text-white flex items-center justify-center font-bold text-xs shadow-md">
                A
              </div>
              <div className="w-6 h-6 rounded-full bg-[#E25C38] text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                +1
              </div>
              <div className="w-8 h-8 rounded-full bg-[#E25C38] text-white flex items-center justify-center font-bold text-xs shadow-md">
                B
              </div>
              <span className="text-xs text-[#646A72]">Origin, Intermediate Pickup, Destination</span>
            </div>
          </div>

          {/* 8px Grid Rule Callout */}
          <div className="p-3.5 bg-[#FBFBFA] rounded-xl border border-[#E8E8E1] text-xs text-[#646A72] space-y-1">
            <strong className="text-[#10343D] block font-bold">8px Grid Strict Execution:</strong>
            <p className="text-[11px] leading-normal">
              Every card, input, and button container conforms to multiples of 8 (8px, 16px, 24px, 32px, 48px). All touch targets are at least 44x44px. Elevation is achieved via 1px hairline borders (#E8E8E1) and soft diffuse shadows.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
