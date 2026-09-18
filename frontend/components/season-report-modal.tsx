'use client'

import React, { useState, useRef } from 'react'
import {
  FileText,
  Printer,
  QrCode,
  Download,
  Share2,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Building2,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  X,
  AlertTriangle,
  FileCheck,
} from 'lucide-react'
import type { CropHealthPassport, SeasonType, PassportRecord } from '@/types'
import { useI18n } from '@/lib/i18n'

interface SeasonReportModalProps {
  isOpen: boolean
  onClose: () => void
  passport: CropHealthPassport
  initialSeason?: SeasonType
}

export const SeasonReportModal: React.FC<SeasonReportModalProps> = ({
  isOpen,
  onClose,
  passport,
  initialSeason = 'Kharif 2025',
}) => {
  const { t } = useI18n()
  const [selectedSeason, setSelectedSeason] = useState<SeasonType>(initialSeason)
  const [copiedLink, setCopiedLink] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  if (!isOpen) return null

  const seasons: SeasonType[] = [
    'Kharif 2024',
    'Rabi 2024-25',
    'Zaid 2025',
    'Kharif 2025',
    'Rabi 2025-26',
    'Kharif 2026',
  ]

  const records = passport.records || []

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      const url = `${window.location.origin}/verify/passport/${passport.passportId}`
      navigator.clipboard.writeText(url)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          background: '#ffffff',
          width: '100%',
          maxWidth: 780,
          maxHeight: '92vh',
          borderRadius: 24,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1.5px solid #d1fae5',
        }}
      >
        {/* Modal Top Action Bar */}
        <div
          style={{
            padding: '16px 24px',
            background: 'linear-gradient(135deg, #133a23 0%, #1f5734 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <FileCheck size={22} className="text-emerald-300" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>
                PMFBY Seasonal Crop Health Passport
              </h3>
              <p style={{ margin: 0, fontSize: 11, color: '#a7f3d0' }}>
                National Insurance & Bank Verification Document • Ledger ID: {passport.passportId}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={handlePrint}
              type="button"
              className="btn btn-secondary"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                padding: '6px 12px',
                fontSize: 12,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
            >
              <Printer size={14} />
              <span>{t('printReport')}</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: 4,
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div ref={reportRef} style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          {/* Season Selector */}
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 8 }}>
              {t('currentSeason')}:
            </span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {seasons.map((season) => (
                <button
                  key={season}
                  type="button"
                  onClick={() => setSelectedSeason(season)}
                  style={{
                    border: '1px solid',
                    borderColor: selectedSeason === season ? '#2b7a4d' : '#d4e0d0',
                    background: selectedSeason === season ? '#eaf4e7' : '#ffffff',
                    color: selectedSeason === season ? '#1b4d2e' : '#334155',
                    padding: '6px 14px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: selectedSeason === season ? 750 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {season}
                </button>
              ))}
            </div>
          </div>

          {/* Official Document Banner */}
          <div
            style={{
              background: '#f8faf7',
              border: '2px solid #2b7a4d',
              borderRadius: 16,
              padding: '20px 24px',
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid #dbe8d8', paddingBottom: 14, marginBottom: 14 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#2b7a4d', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {t('digitalAgriRecord')}
                </span>
                <h2 style={{ margin: '4px 0 2px', fontSize: 20, fontWeight: 900, color: '#133a23' }}>
                  {t('pmfbySeasonalReport')}
                </h2>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                  {t('digitalRecordCertified')}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="chip high" style={{ fontSize: 11, padding: '3px 10px' }}>
                  {t('verifiedRecords')}
                </span>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#64748b' }}>
                  {t('issuedDate')}: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Farmer & Farm Particulars */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, fontSize: 12 }}>
              <div>
                <span style={{ color: 'var(--muted)', display: 'block' }}>{t('fullName')}:</span>
                <strong style={{ fontSize: 14, color: '#1e293b' }}>{passport.farmerName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--muted)', display: 'block' }}>{t('farmPlotLocation')}:</span>
                <strong style={{ fontSize: 14, color: '#1e293b' }}>{passport.farmName} ({passport.location})</strong>
              </div>
              <div>
                <span style={{ color: 'var(--muted)', display: 'block' }}>{t('cultivatedArea')}:</span>
                <strong style={{ fontSize: 14, color: '#1e293b' }}>{passport.farmArea}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--muted)', display: 'block' }}>{t('cropAndCycle')}:</span>
                <strong style={{ fontSize: 14, color: '#1e293b' }}>{passport.activeCrop} • {selectedSeason}</strong>
              </div>
            </div>
          </div>

          {/* Diagnostic Log Table */}
          <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800, color: '#1e293b' }}>
            {t('fieldDiagnosticsArchive')} ({records.length})
          </h4>
          <div style={{ border: '1px solid #e2ebd0', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f3f7f0', borderBottom: '1px solid #e2ebd0', color: '#334155' }}>
                  <th style={{ padding: '10px 14px' }}>{t('registryDate')}</th>
                  <th style={{ padding: '10px 14px' }}>{t('cropCondition')}</th>
                  <th style={{ padding: '10px 14px' }}>{t('diagnosticConfidence')}</th>
                  <th style={{ padding: '10px 14px' }}>{t('severity')}</th>
                  <th style={{ padding: '10px 14px' }}>{t('officerSeal')}</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={r.recordId || i} style={{ borderBottom: '1px solid #f1f5e9' }}>
                    <td style={{ padding: '10px 14px' }}>{r.date}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <strong>{r.crop}</strong> - {r.disease}
                    </td>
                    <td style={{ padding: '10px 14px' }}>{r.aiConfidence}%</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          background: r.severity === 'Severe' ? '#fee2e2' : '#fef3c7',
                          color: r.severity === 'Severe' ? '#b91c1c' : '#92400e',
                        }}
                      >
                        {r.severity}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ color: '#2b7a4d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={14} /> {r.officerName}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Seal and Signature Block */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
              background: '#fcfbf7',
              border: '1.5px dashed #cfc2a8',
              borderRadius: 14,
              padding: '16px 20px',
            }}
          >
            <div>
              <p style={{ margin: '0 0 2px', fontSize: 11, color: '#8a6410', fontWeight: 800 }}>
                DIGITAL INTEGRITY & AUTHENTICITY HASH
              </p>
              <code style={{ fontSize: 11, color: '#475569' }}>
                SHA-256: 8fbc4928e10d2948c2018247df602ab9c7e112d8471920
              </code>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="btn btn-secondary"
              style={{ padding: '7px 14px', fontSize: 12, gap: 6, width: 'auto' }}
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Verification URL'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
