'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import {
  FileText,
  ShieldCheck,
  QrCode,
  Download,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  MapPin,
  UserCheck,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  X,
  Info,
  Layers,
  Award,
  ChevronRight,
  Printer,
} from 'lucide-react'
import { getStoredPassport, saveStoredPassport } from '@/services/passportService'
import { QRCodeSVG } from '@/components/qr-code'
import { SeasonReportModal } from '@/components/season-report-modal'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import type { CropHealthPassport, PassportRecord } from '@/types'

export default function CropHealthPassportPage() {
  const { t, locale } = useI18n()
  const { farmer } = useAuth()
  const [passport, setPassport] = useState<CropHealthPassport>(() => getStoredPassport())
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [seasonModalOpen, setSeasonModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('All')

  // Re-sync with localStorage on mount
  useEffect(() => {
    setPassport(getStoredPassport())
  }, [])

  // Public verification URL
  const publicVerifyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify/passport/${passport.passportId}`
    : `/verify/passport/${passport.passportId}`

  const copyVerificationLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(publicVerifyUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Filter records
  const filteredRecords = useMemo(() => {
    if (selectedCropFilter === 'All') return passport.records
    return passport.records.filter((r) => r.crop === selectedCropFilter)
  }, [passport.records, selectedCropFilter])

  // Summary Metrics
  const summary = useMemo(() => {
    const verifiedCount = passport.records.filter((r) => r.verificationStatus === 'Officer Verified').length
    const lastRecord = passport.records[0]
    const highRiskCount = passport.records.filter((r) => r.riskLevel === 'High' || r.riskLevel === 'Critical').length
    const currentRisk = highRiskCount > 0 ? 'Moderate' : 'Low'
    return {
      verifiedCount,
      activeCrop: passport.activeCrop || (lastRecord ? lastRecord.crop : 'Wheat'),
      currentRisk,
      lastDate: lastRecord ? lastRecord.date : 'N/A',
    }
  }, [passport])

  // Unique crops for filter pills
  const availableCrops = useMemo(() => {
    const set = new Set(passport.records.map((r) => r.crop))
    return ['All', ...Array.from(set)]
  }, [passport.records])

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div className="passport-container animate-fadeIn">
      {/* Top Header Card */}
      <div className="passport-hero-card">
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span className="chip low" style={{ background: '#dcebd8', color: '#2b7a4d', fontSize: 11, fontWeight: 800 }}>
              <ShieldCheck size={14} style={{ marginRight: 4 }} />
              {t('passportVerifiedBadge')}
            </span>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
              Official Supporting Agricultural Record
            </span>
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(24px, 4vw, 32px)', letterSpacing: '-0.02em', color: 'var(--ink)' }}>
            {t('passportTitle')}
          </h1>
          <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.5, maxWidth: 650 }}>
            {t('passportDesc')}
          </p>
        </div>

        {/* Action Buttons: QR & PDF */}
        <div className="passport-hero-actions no-print">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setQrModalOpen(true)}
            style={{ width: 'auto', gap: 8, padding: '10px 18px', fontSize: 13 }}
          >
            <QrCode size={16} />
            <span>{t('generateQrVerification')}</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setSeasonModalOpen(true)}
            style={{ width: 'auto', gap: 8, padding: '10px 18px', fontSize: 13 }}
          >
            <Award size={16} />
            <span>PMFBY Seasonal Report</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handlePrint}
            style={{ width: 'auto', gap: 8, padding: '10px 20px', fontSize: 13 }}
          >
            <Download size={16} />
            <span>{t('downloadPassportPdf')}</span>
          </button>
        </div>
      </div>

      {/* Official Farmer & Farm Identification Card */}
      <div className="passport-id-card">
        <div className="passport-id-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="passport-emblem">
              <Award size={24} />
            </div>
            <div>
              <span className="kicker" style={{ color: '#d4a017', fontSize: 10 }}>DIGITAL AGRICULTURAL RECORD</span>
              <h2 style={{ margin: '2px 0 0', fontSize: 18, color: 'white' }}>{passport.farmName}</h2>
            </div>
          </div>
          <div className="passport-number-badge">
            <span style={{ opacity: 0.75, fontSize: 10, display: 'block' }}>PASSPORT REF ID</span>
            <strong>{passport.passportId}</strong>
          </div>
        </div>

        <div className="passport-id-grid">
          <div className="passport-id-item">
            <small>{t('farmer')}</small>
            <b>{farmer?.name || passport.farmerName}</b>
          </div>
          <div className="passport-id-item">
            <small>{t('farmLocation')}</small>
            <b>📍 {passport.location}</b>
          </div>
          <div className="passport-id-item">
            <small>{t('farmArea')}</small>
            <b>{passport.farmArea}</b>
          </div>
          <div className="passport-id-item">
            <small>{t('currentSeason')}</small>
            <b>{passport.season}</b>
          </div>
          <div className="passport-id-item">
            <small>{t('primaryCrop')}</small>
            <b>{passport.activeCrop}</b>
          </div>
          <div className="passport-id-item">
            <small>{t('issuedDate')}</small>
            <b>{passport.createdAt}</b>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="passport-summary-grid">
        <div className="hist-stat-card">
          <small>{t('verifiedRecords')}</small>
          <b style={{ color: '#2b7a4d' }}>{summary.verifiedCount}</b>
          <span>{t('officerInspected')}</span>
        </div>
        <div className="hist-stat-card">
          <small>{t('activeCrop')}</small>
          <b>{summary.activeCrop}</b>
          <span>{t('kharifSeason')}</span>
        </div>
        <div className="hist-stat-card">
          <small>{t('currentRisk')}</small>
          <b style={{ color: summary.currentRisk === 'Low' ? '#2b7a4d' : '#8a6410' }}>
            {summary.currentRisk}
          </b>
          <span>{t('assessedByFieldData')}</span>
        </div>
        <div className="hist-stat-card">
          <small>{t('lastVerification')}</small>
          <b style={{ fontSize: 20 }}>{summary.lastDate}</b>
          <span>{t('byAuthorizedOfficer')}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 16px', flexWrap: 'wrap', gap: 12 }} className="no-print">
        <div>
          <h2 style={{ margin: '0 0 2px', fontSize: 20 }}>{t('cropHealthTimeline')}</h2>
          <p className="muted" style={{ margin: 0, fontSize: 13 }}>
            Chronological officer-verified disease diagnoses and geotagged field observations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {availableCrops.map((crop) => (
            <button
              key={crop}
              type="button"
              className={`scan-cat-tab ${selectedCropFilter === crop ? 'on' : ''}`}
              onClick={() => setSelectedCropFilter(crop)}
              style={{ fontSize: 12, padding: '6px 14px' }}
            >
              {crop === 'All' ? t('allCrops') : crop}
            </button>
          ))}
        </div>
      </div>

      {/* Crop Health Timeline */}
      <div className="passport-timeline">
        {filteredRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', background: 'var(--card)', borderRadius: 20, border: '1px dashed var(--line)' }}>
            <p className="muted">{t('noPassportRecords')}</p>
          </div>
        ) : (
          filteredRecords.map((record, index) => (
            <div key={record.recordId} className="passport-timeline-entry">
              {/* Timeline Marker */}
              <div className="passport-timeline-axis">
                <div className="passport-timeline-node">
                  <CheckCircle2 size={16} />
                </div>
                {index < filteredRecords.length - 1 && <div className="passport-timeline-stem" />}
              </div>

              {/* Record Content Card */}
              <div className="passport-timeline-card">
                <div className="passport-card-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span className="passport-date-badge">
                        <Calendar size={13} /> {record.date}
                      </span>
                      <span className="passport-status-tag verified">
                        <ShieldCheck size={14} /> ✓ {t('verifiedByOfficer')}
                      </span>
                    </div>
                    <h3 style={{ margin: '6px 0 2px', fontSize: 20, color: 'var(--ink)' }}>
                      {record.crop} — <span style={{ color: record.disease === 'Healthy' ? '#2b7a4d' : 'var(--ink)' }}>{record.disease}</span>
                    </h3>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={13} /> {record.locationName} ({record.latitude.toFixed(4)}° N, {record.longitude.toFixed(4)}° E)
                    </p>
                  </div>

                  <div className="passport-conf-box">
                    <small>AI VISION CONFIDENCE</small>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                      <div className="passport-mini-bar">
                        <div style={{ width: `${record.aiConfidence}%` }} />
                      </div>
                      <b style={{ color: '#2b7a4d', fontSize: 16 }}>{record.aiConfidence}%</b>
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 4, justifyContent: 'flex-end' }}>
                      <span className="chip" style={{ fontSize: 10, padding: '2px 8px' }}>Severity: {record.severity}</span>
                      <span
                        className="chip"
                        style={{
                          fontSize: 10,
                          padding: '2px 8px',
                          background: record.riskLevel === 'High' ? '#f7dfd4' : '#dcebd8',
                          color: record.riskLevel === 'High' ? '#a4462f' : '#2b7a4d',
                        }}
                      >
                        {record.riskLevel} Risk
                      </span>
                    </div>
                  </div>
                </div>

                {/* Symptoms */}
                {record.symptoms && record.symptoms.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <strong style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.04em' }}>
                      Observed Symptoms
                    </strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                      {record.symptoms.map((sym, i) => (
                        <span key={i} style={{ background: '#f5f3ec', padding: '3px 10px', borderRadius: 8, fontSize: 12, color: 'var(--ink)' }}>
                          • {sym}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Officer Sign-off & Notes */}
                <div className="passport-officer-box">
                  <div className="passport-officer-info">
                    <UserCheck size={18} className="text-[#2b7a4d]" />
                    <div>
                      <strong style={{ fontSize: 13, color: 'var(--forest)' }}>
                        {record.officerName}
                      </strong>
                      <span style={{ display: 'block', fontSize: 11, color: 'var(--muted)' }}>
                        {record.officerDesignation} • Verified on {record.verifiedAt}
                      </span>
                    </div>
                  </div>
                  <div className="passport-notes-content">
                    <p style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--ink)' }}>
                      <strong>Officer Note:</strong> {record.officerNotes}
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: '#1b3d2a' }}>
                      <strong>Prescribed Treatment:</strong> {record.recommendedAction}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Crop Insurance Support Section */}
      <section className="passport-insurance-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="chip" style={{ background: '#fdf5e1', color: '#8a6410', fontSize: 11, fontWeight: 800 }}>
                Future Integration
              </span>
              <span style={{ fontSize: 12, color: '#2b7a4d', fontWeight: 700 }}>
                PMFBY / Agricultural Insurance Workflow Support
              </span>
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: 22, color: '#1b3d2a' }}>
              {t('cropInsuranceSupportTitle')}
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)', maxWidth: 680, lineHeight: 1.5 }}>
              {t('cropInsuranceSupportSub')}
            </p>
          </div>
        </div>

        <div className="passport-pillars-grid">
          <div className="passport-pillar-item">
            <CheckCircle2 size={16} className="text-[#2b7a4d]" style={{ flexShrink: 0 }} />
            <span>Timestamped crop-health records</span>
          </div>
          <div className="passport-pillar-item">
            <CheckCircle2 size={16} className="text-[#2b7a4d]" style={{ flexShrink: 0 }} />
            <span>Geotagged field observations</span>
          </div>
          <div className="passport-pillar-item">
            <CheckCircle2 size={16} className="text-[#2b7a4d]" style={{ flexShrink: 0 }} />
            <span>Officer-verified diagnoses</span>
          </div>
          <div className="passport-pillar-item">
            <CheckCircle2 size={16} className="text-[#2b7a4d]" style={{ flexShrink: 0 }} />
            <span>Seasonal crop-health history</span>
          </div>
          <div className="passport-pillar-item">
            <CheckCircle2 size={16} className="text-[#2b7a4d]" style={{ flexShrink: 0 }} />
            <span>Downloadable PDF report</span>
          </div>
          <div className="passport-pillar-item">
            <CheckCircle2 size={16} className="text-[#2b7a4d]" style={{ flexShrink: 0 }} />
            <span>QR-based verification</span>
          </div>
        </div>

        <div className="passport-disclaimer-box">
          <Info size={16} style={{ color: '#8a6410', flexShrink: 0, marginTop: 2 }} />
          <p style={{ margin: 0, fontSize: 12, color: '#6d531a', lineHeight: 1.5 }}>
            <strong>Legal Notice:</strong> This digital crop-health passport contains records verified by an authorized agriculture officer. It is intended as supporting documentation for agricultural and crop-insurance workflows and does not constitute automatic approval or settlement of an insurance claim.
          </p>
        </div>
      </section>

      {/* QR Code Verification Modal */}
      {qrModalOpen && (
        <div className="rq-modal-overlay" onClick={() => setQrModalOpen(false)}>
          <div className="rq-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className="kicker" style={{ color: '#2b7a4d', margin: 0 }}>PUBLIC VERIFICATION QR</span>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <h2 style={{ margin: '0 0 6px', fontSize: 20 }}>Scan to Verify Passport</h2>
            <p className="muted" style={{ margin: '0 0 16px', fontSize: 13 }}>
              Public verification reference for Passport ID: <strong>{passport.passportId}</strong>
            </p>

            <div style={{ background: '#ffffff', padding: 20, borderRadius: 20, border: '2px solid #2b7a4d', display: 'inline-block', boxShadow: '0 8px 24px rgba(43,122,77,0.12)' }}>
              <QRCodeSVG value={publicVerifyUrl} size={200} fgColor="#1b3d2a" />
            </div>

            <div style={{ marginTop: 14, background: '#f5faf7', border: '1px solid #dcebd8', borderRadius: 12, padding: '10px 14px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--muted)', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                  {publicVerifyUrl}
                </span>
                <button
                  type="button"
                  className="ghost"
                  onClick={copyVerificationLink}
                  style={{ padding: '4px 8px', fontSize: 11, flexShrink: 0 }}
                >
                  {copied ? <Check size={12} className="text-[#2b7a4d]" /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <p className="muted" style={{ fontSize: 11, margin: '14px 0 0', lineHeight: 1.4 }}>
              🔒 <strong>Safe Public Reference:</strong> This QR code encodes only the public verification URL. It does not expose private phone numbers, Aadhaar, or sensitive credentials.
            </p>

            <div style={{ marginTop: 18, display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Link
                href={`/verify/passport/${passport.passportId}`}
                target="_blank"
                className="btn btn-primary"
                style={{ width: 'auto', fontSize: 13, gap: 6 }}
              >
                <ExternalLink size={14} /> Open Public Page
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* PMFBY Seasonal Health Passport & Insurance Report Modal */}
      <SeasonReportModal
        isOpen={seasonModalOpen}
        onClose={() => setSeasonModalOpen(false)}
        passport={passport}
      />
    </div>
  )
}
