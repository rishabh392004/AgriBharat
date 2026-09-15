import React from 'react'
import type { Metadata } from 'next'
import { SplitRouteProvider } from '@/components/splitroute/split-context'
import { SplitRouteNavBar } from '@/components/splitroute/navbar'

export const metadata: Metadata = {
  title: 'SplitRoute — Production UI & Fair Cost-Splitting Carpool',
  description: 'Audited, non-profit commute carpooling with transparent gas, toll, and wear cost allocation.',
}

export default function SplitRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SplitRouteProvider>
      <div className="min-h-screen bg-[#F6F6F2] text-[#15181B] flex flex-col selection:bg-[#EAF2F2] selection:text-[#10343D]">
        <SplitRouteNavBar />
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
          {children}
        </div>
        
        {/* Subtle Utilitarian Footer */}
        <footer className="border-t border-[#E8E8E1] bg-white py-6 px-4 sm:px-6 mt-12 text-xs text-[#646A72]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#10343D]">SplitRoute Protocol</span>
              <span>•</span>
              <span>Fair-Share Commute Matching & Cost Telemetry</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span>23 U.S.C. § 146 Carpool Exemption</span>
              <span>•</span>
              <span className="text-[#0D8A50] font-bold">100% Zero Driver Markup</span>
            </div>
          </div>
        </footer>
      </div>
    </SplitRouteProvider>
  )
}
