'use client'

import React from 'react'
import { ShieldCheck, Download, Printer, X, CheckCircle } from 'lucide-react'
import type { RideReceipt } from './split-context'

interface ReceiptModalProps {
  receipt: RideReceipt | null
  onClose: () => void
}

export function SplitRouteReceiptModal({ receipt, onClose }: ReceiptModalProps) {
  if (!receipt) return null

  const handleExportCsv = () => {
    const csvContent = `data:text/csv;charset=utf-8,ReceiptID,Date,Corridor,Driver,Vehicle,DistanceMiles,OperatingPool,PaidSplit,SavingsVsSolo,EscrowSeal\n${receipt.id},"${receipt.date}","${receipt.corridor}","${receipt.driverName}","${receipt.vehicle}",${receipt.distanceMiles},"${receipt.operatingCost}",${receipt.passengerSplit},${receipt.savingsVsSolo},"${receipt.escrowSeal}"`
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `SplitRoute_Receipt_${receipt.id}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#E8E8E1] shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E1]">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#646A72] font-semibold">
              SplitRoute Digital Commute Receipt
            </span>
            <h4 className="font-extrabold text-base text-[#10343D]">{receipt.date}</h4>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F4F0] text-[#646A72] hover:text-[#10343D] flex items-center justify-center font-bold text-sm transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Itemized Table */}
        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between py-1 border-b border-[#F4F4F0]">
            <span className="text-[#646A72]">Route Corridor:</span>
            <span className="font-bold text-[#15181B] text-right">{receipt.corridor}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-[#F4F4F0]">
            <span className="text-[#646A72]">Host Driver:</span>
            <span className="font-bold text-[#15181B]">{receipt.driverName}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-[#F4F4F0]">
            <span className="text-[#646A72]">Vehicle Model:</span>
            <span className="font-medium text-[#15181B]">{receipt.vehicle}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-[#F4F4F0]">
            <span className="text-[#646A72]">GPS Distance:</span>
            <span className="font-mono font-bold text-[#15181B]">{receipt.distanceMiles} miles</span>
          </div>

          <div className="flex justify-between py-1 border-b border-[#F4F4F0]">
            <span className="text-[#646A72]">Pool Breakdown:</span>
            <span className="font-mono text-[#15181B] text-right">{receipt.operatingCost}</span>
          </div>

          <div className="flex justify-between pt-2 text-sm">
            <span className="font-extrabold text-[#10343D]">Your Fair Split:</span>
            <span className="font-black text-base text-[#0D8A50]">${receipt.passengerSplit.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-xs pb-1">
            <span className="text-[#646A72]">Savings vs. Commercial Taxi:</span>
            <span className="font-bold text-[#0D8A50]">+${receipt.savingsVsSolo.toFixed(2)} saved</span>
          </div>
        </div>

        {/* Cryptographic Escrow Seal */}
        <div className="p-3 bg-[#FBFBFA] rounded-xl border border-[#E8E8E1] text-[10px] text-[#646A72] space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#10343D]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0D8A50]" />
            <span>Cryptographically Signed Escrow Settlement</span>
          </div>
          <p className="font-mono text-[9px] break-all">{receipt.escrowSeal}</p>
          <p className="text-[10px] text-[#646A72] pt-1">
            Certified compliant with IRS 26 U.S. Code § 132(f) Qualified Transportation Fringe Benefits.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleExportCsv}
            className="py-2.5 px-3 rounded-xl bg-[#F4F4F0] hover:bg-[#EAEAE2] text-[#10343D] font-bold text-xs flex items-center justify-center gap-1.5 border border-[#E8E8E1] transition-transform active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="py-2.5 px-3 rounded-xl bg-[#10343D] hover:bg-[#164855] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 text-xs font-semibold text-[#646A72] hover:text-[#10343D] text-center"
        >
          Close
        </button>
      </div>
    </div>
  )
}
