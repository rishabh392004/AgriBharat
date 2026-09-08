'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  MapPin,
  Calendar,
  UserCheck,
  AlertCircle,
  ExternalLink,
  Printer,
  Leaf,
  Info,
} from 'lucide-react'
import { getStoredPassport } from '@/services/passportService'
import { LeafMark } from '@/components/leaf-mark'
import { QRCodeSVG } from '@/components/qr-code'
import type { CropHealthPassport } from '@/types'

export default function PublicPassportVerifyPage() {
  const params = useParams<{ passportId: string }>()
  const [passport, setPassport] = useState<CropHealthPassport | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const data = getStoredPassport()
    setPassport(data)
    setLoaded(true)
  }, [params.passportId])

  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f8f7f2' }}>
        <p className="muted">Verifying digital certificate...</p>
      </div>
    )
  }

  if (!passport) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f8f7f2', padding: 20 }}>
        <div style={{ background: 'white', padding: 32, borderRadius: 20, textAlign: 'center', maxWidth: 460 }}>
          <AlertCircle size={40} className="text-[#a4462f]" style={{ margin: '0 auto 12px' }} />
          <h2>Passport Record Not Found</h2>
          <p className="muted" style={{ fontSize: 14 }}>
            The requested passport reference could not be verified on the system.
          </p>
          <Link href="/" className="btn btn-primary" style={{ width: 'auto', marginTop: 14 }}>
            Go to KrishiRakshak AI
          </Link>
        </div>
      </div>
    )
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div className="public-verify-bg">
      {/* Public Header */}
      <header className="public-verify-header no-print">
        <div className="public-verify-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="brand-mark" style={{ width: 34, height: 34 }}>
              <LeafMark />
            </span>
            <div>
              <strong style={{ fontSize: 16, color: '#1b3d2a' }}>KrishiRakshak AI</strong>
              <small style={{ display: 'block', fontSize: 10, color: '#4a6f54' }}>
                Digital Crop Health Verification Registry
              </small>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className="chip low" style={{ fontSize: 11, background: '#dcebd8', color: '#2b7a4d' }}>
              <ShieldCheck size={13} style={{ marginRight: 4 }} />
              AUTHENTIC RECORD
            </span>
            <button
              type="button"
              className="ghost"
              onClick={handlePrint}
              style={{ fontSize: 12, padding: '6px 12px', gap: 6 }}
            >
              <Printer size={14} /> Print Certificate
            </button>
          </div>
        </div>
      </header>

      {/* Main Public Certificate Container */}
      <main className="public-verify-container">
        {/* Certificate Card Header */}
        <div className="public-cert-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Award size={18} className="text-[#d4a017]" />
                <span className="kicker" style={{ color: '#d4a017', margin: 0, fontSize: 11 }}>
                  OFFICIAL DIGITAL CROP HEALTH PASSPORT
                </span>
              </div>
              <h1 style={{ margin: '4px 0 6px', fontSize: 'clamp(22px, 3.5vw, 30px)', color: '#ffffff' }}>
                {passport.farmName} — Crop Health Record
              </h1>
              <p style={{ margin: 0, fontSize: 13, color: '#d8eedf', opacity: 0.9 }}>
                Registered in Nashik Taluka Agricultural Database • Kharif 2026
              </p>
            </div>

            <div className="public-cert-qr-box">
              <QRCodeSVG value={typeof window !== 'undefined' ? window.location.href : passport.passportId} size={100} fgColor="#1b3d2a" />
              <span style={{ fontSize: 9, fontWeight: 800, color: '#1b3d2a', display: 'block', marginTop: 4 }}>
                {passport.passportId}
              </span>
            </div>
          </div>

          {/* Farmer & Field Identity Specs */}
          <div className="public-cert-specs">
            <div>
              <small>Farmer Name</small>
              <strong>{passport.farmerName}</strong>
            </div>
            <div>
              <small>Farm Location</small>
              <strong>📍 {passport.location}</strong>
            </div>
            <div>
              <small>Field Area</small>
              <strong>{passport.farmArea}</strong>
            </div>
            <div>
              <small>Season / Cycle</small>
              <strong>{passport.season}</strong>
            </div>
            <div>
              <small>Primary Crop</small>
              <strong>{passport.activeCrop}</strong>
            </div>
            <div>
              <small>Registry Date</small>
              <strong>{passport.createdAt}</strong>
            </div>
          </div>
        </div>

        {/* Verification Status Banner */}
        <div className="public-verified-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#2b7a4d', color: 'white', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <ShieldCheck size={26} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 2px', fontSize: 16, color: '#1b3d2a' }}>
                ✓ Official Officer Verification Active
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>
                All records below have been inspected, diagnosed via AI Vision, and officially certified by authorized Agriculture Officers.
              </p>
            </div>
          </div>
        </div>

        {/* Verified Crop Health Timeline */}
        <div style={{ padding: '24px 24px 10px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 18, color: '#1b3d2a' }}>
            Verified Disease Diagnoses & Observations ({passport.records.length})
          </h2>

          <div className="public-records-list">
            {passport.records.map((rec) => (
              <article key={rec.recordId} className="public-record-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span className="passport-date-badge">
                        <Calendar size={12} /> {rec.date}
                      </span>
                      <span className="passport-status-tag verified">
                        <CheckCircle2 size={13} /> {rec.verificationStatus}
                      </span>
                    </div>
                    <h3 style={{ margin: '4px 0 2px', fontSize: 18, color: '#1b3d2a' }}>
                      {rec.crop} — <span style={{ color: rec.disease === 'Healthy' ? '#2b7a4d' : '#943820' }}>{rec.disease}</span>
                    </h3>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={12} /> {rec.locationName} ({rec.latitude.toFixed(4)}° N, {rec.longitude.toFixed(4)}° E)
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 650 }}>AI Vision Match</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#2b7a4d' }}>{rec.aiConfidence}%</div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 2, justifyContent: 'flex-end' }}>
                      <span className="chip" style={{ fontSize: 9, padding: '1px 6px' }}>{rec.severity} Severity</span>
                      <span className="chip" style={{ fontSize: 9, padding: '1px 6px' }}>{rec.riskLevel} Risk</span>
                    </div>
                  </div>
                </div>

                {/* Officer Sign-off Details */}
                <div className="public-record-officer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <UserCheck size={16} className="text-[#2b7a4d]" />
                    <strong style={{ fontSize: 13, color: '#1b3d2a' }}>
                      {rec.officerName} — {rec.officerDesignation}
                    </strong>
                    <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto' }}>
                      Signed: {rec.verifiedAt}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--ink)' }}>
                    <strong>Officer Notes:</strong> {rec.officerNotes}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: '#2b7a4d' }}>
                    <strong>Prescribed Action:</strong> {rec.recommendedAction}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Public Legal Disclaimers */}
        <div className="public-cert-foot">
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Info size={16} style={{ color: '#8a6410', flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ margin: '0 0 6px', fontSize: 12, color: '#6d531a', lineHeight: 1.5 }}>
                <strong>Verification Statement:</strong> This digital crop-health passport contains records verified by an authorized agriculture officer.
              </p>
              <p style={{ margin: 0, fontSize: 12, color: '#6d531a', lineHeight: 1.5 }}>
                <strong>Agricultural & Insurance Workflow Notice:</strong> This record is intended as supporting documentation for agricultural and crop-insurance workflows. It does not constitute automatic approval or settlement of an insurance claim.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="public-verify-footer no-print">
        <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>
          © 2026 KrishiRakshak AI • Advanced Agricultural Disease Intelligence System
        </p>
      </footer>
    </div>
  )
}
