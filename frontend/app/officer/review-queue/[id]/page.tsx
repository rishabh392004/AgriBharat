'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, XCircle, Check, ShieldCheck, MapPin, ExternalLink } from 'lucide-react'
import { reviewQueue } from '@/data/mock'
import { addVerifiedRecordToPassport } from '@/services/passportService'
import { toast } from '@/components/toast'
import { useI18n } from '@/lib/i18n'
import type { ReviewStatus } from '@/types'

const cropColors: Record<string, string> = {
  wheat: '#b08a3a',
  tomato: '#b45a3c',
  rice: '#5a8a4a',
  cotton: '#6d7c4c',
}

export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useI18n()
  const original = reviewQueue.find((r) => r.id === id)
  const [status, setStatus] = useState<ReviewStatus>(original?.status ?? 'Pending')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [officerNote, setOfficerNote] = useState('Field observation confirmed disease symptoms. Recommended immediate preventive spraying.')
  const [recommendedAction, setRecommendedAction] = useState(original?.recommendations?.[0] || 'Apply prescribed organic/chemical fungicide as per dosage schedule.')

  if (!original) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <p className="muted">Report not found.</p>
        <Link href="/officer/review-queue" className="ghost" style={{ marginTop: 16, display: 'inline-flex', gap: 6 }}>
          <ArrowLeft size={14} /> Back to Queue
        </Link>
      </div>
    )
  }

  const r = original
  const thumbColor = cropColors[r.imageThumb] || '#5a8a4a'

  const handleSelect = async () => {
    setStatus('Selected')

    // Add to Digital Crop Health Passport
    await addVerifiedRecordToPassport({
      diagnosisId: `SCAN-${r.refId}`,
      date: '08 Sep 2026',
      dateIso: '2026-09-08',
      crop: r.crop,
      disease: r.disease,
      aiConfidence: r.confidence,
      severity: r.severity,
      riskLevel: r.riskLevel,
      locationName: `Patil Farm (${r.location})`,
      latitude: 19.9975,
      longitude: 73.7898,
      officerId: 'OFF-NSK-042',
      officerName: 'Dr. Sanjay Deshmukh',
      officerDesignation: 'Taluka Agriculture Officer, Nashik',
      officerNotes: officerNote,
      recommendedAction: recommendedAction,
      symptoms: r.symptoms || ['Visible leaf lesions', 'Foliage discoloration'],
    })

    toast('✓ Verified and added to Digital Crop Health Passport (KRA-2026-NK-00124)')
  }

  const handleReject = () => {
    setStatus('Rejected')
    toast(t('reportRejected'))
    setShowRejectModal(false)
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <Link href="/officer/review-queue" className="ghost">
          <ArrowLeft size={16} /> Back to Queue
        </Link>
        <span style={{
          padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
          background: status === 'Selected' ? '#dcebd8' : status === 'Rejected' ? '#f7dfd4' : '#f3e3b0',
          color: status === 'Selected' ? '#347044' : status === 'Rejected' ? '#a4462f' : '#8a6410',
        }}>
          {status}
        </span>
      </div>

      <section className="banner" style={{ marginBottom: 16 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: thumbColor, display: 'grid', placeItems: 'center', color: 'white', fontSize: 28, fontWeight: 800, flexShrink: 0 }}>
          {r.crop[0]}
        </div>
        <div style={{ flex: 1 }}>
          <p className="kicker" style={{ color: '#e8c868', margin: '0 0 4px' }}>Ref #{r.refId} — AI Detection</p>
          <h1 style={{ margin: '0 0 4px', fontSize: 26 }}>{r.disease}</h1>
          <p style={{ margin: 0, opacity: 0.85 }}>{r.crop} · {r.confidence}% confidence · {r.severity} severity</p>
        </div>
      </section>

      <div className="grid-2">
        <section className="card">
          <p className="kicker">Farmer Details</p>
          <h3 style={{ margin: '4px 0 12px' }}>{r.farmer}</h3>
          <p style={{ margin: '0 0 6px' }}><span className="muted">Location</span><br /><strong>📍 {r.location}</strong></p>
          <p style={{ margin: '0 0 6px' }}><span className="muted">Crop</span><br /><strong>{r.crop}</strong></p>
          <p style={{ margin: 0 }}><span className="muted">Submitted</span><br /><strong>{r.submittedDate}</strong></p>
        </section>

        <section className="card">
          <p className="kicker">AI Prediction</p>
          <div className="ring" style={{ width: 72, height: 72, margin: '8px 0 12px', borderColor: '#e8c868', borderWidth: 4 }}>
            <div><b style={{ fontSize: 18 }}>{r.confidence}%</b><small style={{ fontSize: 9 }}>confidence</small></div>
          </div>
          <p style={{ margin: '0 0 6px' }}><span className="muted">Disease</span><br /><strong>{r.disease}</strong></p>
          <p style={{ margin: '0 0 6px' }}><span className="muted">Severity</span><br /><strong>{r.severity}</strong></p>
          <p style={{ margin: 0 }}><span className="muted">Risk Level</span><br /><strong>{r.riskLevel}</strong></p>
        </section>

        <section className="card">
          <p className="kicker">{t('symptoms')}</p>
          {r.symptoms.map((s) => (
            <div className="list-row" key={s}><Check size={15} style={{ color: 'var(--leaf)', flexShrink: 0 }} /> {s}</div>
          ))}
        </section>

        <section className="card">
          <p className="kicker">{t('actions')}</p>
          {r.recommendations.map((rec, i) => (
            <div className="list-row" key={rec}><b style={{ minWidth: 20, color: 'var(--gold)' }}>0{i + 1}</b> {rec}</div>
          ))}
        </section>
      </div>

      <section className="card" style={{ marginTop: 12, background: 'linear-gradient(135deg, #1b3d2a, #133321)', color: '#f6f1e4' }}>
        <p className="kicker" style={{ color: '#e8c868' }}>🌦 Weather Context</p>
        <p style={{ margin: '6px 0 0', lineHeight: 1.6 }}>{r.weatherContext}</p>
        <p style={{ margin: '8px 0 0', fontSize: 11, opacity: 0.7 }}>📍 Demo data — Nashik, Maharashtra</p>
      </section>

      {/* Officer Notes & Passport Endorsement Box */}
      <section className="card" style={{ marginTop: 12, border: '1.5px solid #2b7a4d', background: '#f5faf7' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <ShieldCheck size={18} className="text-[#2b7a4d]" />
          <strong style={{ fontSize: 14, color: '#1b3d2a' }}>Official Officer Passport Certification</strong>
        </div>
        <p className="muted" style={{ fontSize: 12, margin: '0 0 12px' }}>
          Approving this diagnosis will generate a geotagged, timestamped digital record into farmer {r.farmer}&apos;s Crop Health Passport.
        </p>

        <div style={{ display: 'grid', gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 4 }}>
              Officer Findings & Notes
            </label>
            <input
              type="text"
              value={officerNote}
              onChange={(e) => setOfficerNote(e.target.value)}
              disabled={status !== 'Pending'}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--line)', fontSize: 13, background: 'white' }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 4 }}>
              Prescribed Agricultural Treatment
            </label>
            <input
              type="text"
              value={recommendedAction}
              onChange={(e) => setRecommendedAction(e.target.value)}
              disabled={status !== 'Pending'}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--line)', fontSize: 13, background: 'white' }}
            />
          </div>
        </div>
      </section>

      <div className="actions" style={{ marginTop: 20 }}>
        {status === 'Pending' ? (
          <>
            <button className="btn btn-primary" style={{ width: 'auto', background: '#2b7a45', gap: 6 }} onClick={handleSelect}>
              <CheckCircle2 size={16} /> Confirm & Endorse to Passport
            </button>
            <button className="btn" style={{ width: 'auto', background: '#f7dfd4', color: '#a4462f', border: '1px solid #f2c4b4', gap: 6 }} onClick={() => setShowRejectModal(true)}>
              <XCircle size={16} /> {t('rejectReport')}
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <p style={{ margin: 0, fontWeight: 700, color: status === 'Selected' ? '#347044' : '#a4462f' }}>
              {status === 'Selected' ? '✓ Report Approved & Added to Crop Health Passport (KRA-2026-NK-00124)' : '✕ Report Rejected'}
            </p>
            {status === 'Selected' && (
              <Link href="/verify/passport/KRA-2026-NK-00124" target="_blank" className="ghost" style={{ fontSize: 12, gap: 4, display: 'inline-flex', alignItems: 'center' }}>
                <ExternalLink size={13} /> View Public Passport Record
              </Link>
            )}
          </div>
        )}
        <Link href="/officer/review-queue" className="btn btn-ghost" style={{ width: 'auto' }}>Back to Queue</Link>
      </div>

      {showRejectModal && (
        <div className="rq-modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="rq-modal" onClick={(e) => e.stopPropagation()}>
            <p className="kicker" style={{ margin: '0 0 8px' }}>Reject Report</p>
            <h2 style={{ margin: '0 0 6px' }}>{t('confirmReject')}</h2>
            <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>{r.crop} · {r.disease} · {r.farmer}</p>
            <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{t('rejectionReason')} (optional)</p>
            <div className="rq-reason-list">
              {[t('reasonIncorrect'), t('reasonImage'), t('reasonInsufficient'), t('reasonOther')].map((reason) => (
                <button key={reason} type="button" className={`rq-reason ${rejectionReason === reason ? 'on' : ''}`} onClick={() => setRejectionReason(reason)}>
                  {reason}
                </button>
              ))}
            </div>
            <div className="rq-modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowRejectModal(false)}>{t('cancel')}</button>
              <button type="button" className="btn rq-btn-reject-confirm" onClick={handleReject}>
                <XCircle size={16} /> {t('rejectReport')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}