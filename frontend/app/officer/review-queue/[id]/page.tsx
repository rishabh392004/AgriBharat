'use client'

import { useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Check,
  ShieldCheck,
  ExternalLink,
  RotateCcw,
  AlertTriangle,
  Loader2,
  FileText,
} from 'lucide-react'
import { reviewQueue } from '@/data/mock'
import { addVerifiedRecordToPassport } from '@/services/passportService'
import { toast } from '@/components/toast'
import { useI18n } from '@/lib/i18n'
import type { ReviewStatus } from '@/types'
import {
  AccessibleModal,
  PrimaryButton,
  SecondaryButton,
  StatusBadge,
} from '@/components/ui/design-system'

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
  const [showRescanModal, setShowRescanModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rescanReason, setRescanReason] = useState('')
  const [customRescanNotes, setCustomRescanNotes] = useState('')
  const [officerNote, setOfficerNote] = useState(
    'Field observation confirmed disease symptoms. Recommended immediate preventive spraying.'
  )
  const [recommendedAction, setRecommendedAction] = useState(
    original?.recommendations?.[0] || 'Apply prescribed organic/chemical fungicide as per dosage schedule.'
  )
  const [notesError, setNotesError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Trigger refs for accessible modal focus restoration
  const rejectBtnRef = useRef<HTMLButtonElement | null>(null)
  const rescanBtnRef = useRef<HTMLButtonElement | null>(null)
  const notesInputRef = useRef<HTMLInputElement | null>(null)
  const actionInputRef = useRef<HTMLInputElement | null>(null)

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

  // Explicit Action: Confirm Diagnosis
  const handleConfirmDiagnosis = async () => {
    // Required form validation
    let hasError = false
    if (!officerNote.trim()) {
      setNotesError('Officer findings & notes are required to certify diagnosis.')
      notesInputRef.current?.focus()
      hasError = true
    } else {
      setNotesError(null)
    }

    if (!recommendedAction.trim()) {
      setActionError('Prescribed agricultural treatment is required for official certification.')
      if (!hasError) actionInputRef.current?.focus()
      hasError = true
    } else {
      setActionError(null)
    }

    if (hasError) return

    setIsSubmitting(true)
    try {
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
        verificationStatus: 'Officer Verified',
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

      toast('✓ Diagnosis confirmed and certified into Digital Crop Health Passport (KRA-2026-NK-00124)')
    } catch {
      toast('Failed to save certified passport record. Please retry.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Explicit Action: Reject Diagnosis
  const handleRejectDiagnosis = () => {
    setStatus('Rejected')
    toast('✕ Diagnosis rejected and farmer notified.')
    setShowRejectModal(false)
  }

  // Explicit Action: Request Re-scan
  const handleRequestRescan = () => {
    setStatus('RescanRequested')
    toast('↺ Re-scan request sent to farmer with photo guidance.')
    setShowRescanModal(false)
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <Link href="/officer/review-queue" className="ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={16} /> Back to Queue
        </Link>
        <StatusBadge
          status={
            status === 'Selected'
              ? 'Officer Verified'
              : status === 'Rejected'
              ? 'Rejected'
              : status === 'RescanRequested'
              ? 'Re-scan Requested'
              : 'Pending'
          }
        />
      </div>

      <section className="banner" style={{ marginBottom: 16 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: thumbColor,
            display: 'grid',
            placeItems: 'center',
            color: 'white',
            fontSize: 28,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {r.crop[0]}
        </div>
        <div style={{ flex: 1 }}>
          <p className="kicker" style={{ color: '#e8c868', margin: '0 0 4px' }}>
            Ref #{r.refId} — AI Detection
          </p>
          <h1 style={{ margin: '0 0 4px', fontSize: 26 }}>{r.disease}</h1>
          <p style={{ margin: 0, opacity: 0.85 }}>
            {r.crop} · {r.confidence}% confidence · {r.severity} severity
          </p>
        </div>
      </section>

      <div className="grid-2">
        <section className="card">
          <p className="kicker">{t('farmerDetails')}</p>
          <h3 style={{ margin: '4px 0 12px' }}>{r.farmer}</h3>
          <p style={{ margin: '0 0 6px' }}>
            <span className="muted">{t('location')}</span>
            <br />
            <strong>📍 {r.location}</strong>
          </p>
          <p style={{ margin: '0 0 6px' }}>
            <span className="muted">{t('primaryCrop')}</span>
            <br />
            <strong>{r.crop}</strong>
          </p>
          <p style={{ margin: 0 }}>
            <span className="muted">{t('submittedDate')}</span>
            <br />
            <strong>{r.submittedDate}</strong>
          </p>
        </section>

        <section className="card">
          <p className="kicker">{t('aiPrediction')}</p>
          <div
            className="ring"
            style={{ width: 72, height: 72, margin: '8px 0 12px', borderColor: '#e8c868', borderWidth: 4 }}
          >
            <div>
              <b style={{ fontSize: 18 }}>{r.confidence}%</b>
              <small style={{ fontSize: 9 }}>{t('confidence')}</small>
            </div>
          </div>
          <p style={{ margin: '0 0 6px' }}>
            <span className="muted">{t('diseaseLabel')}</span>
            <br />
            <strong>{r.disease}</strong>
          </p>
          <p style={{ margin: '0 0 6px' }}>
            <span className="muted">{t('severity')}</span>
            <br />
            <strong>{r.severity}</strong>
          </p>
          <p style={{ margin: 0 }}>
            <span className="muted">{t('riskLevel')}</span>
            <br />
            <strong>{r.riskLevel}</strong>
          </p>
        </section>

        <section className="card">
          <p className="kicker">{t('symptoms')}</p>
          {r.symptoms.map((s) => (
            <div className="list-row" key={s}>
              <Check size={15} style={{ color: 'var(--leaf)', flexShrink: 0 }} /> {s}
            </div>
          ))}
        </section>

        <section className="card">
          <p className="kicker">{t('actions')}</p>
          {r.recommendations.map((rec, i) => (
            <div className="list-row" key={rec}>
              <b style={{ minWidth: 20, color: 'var(--gold)' }}>0{i + 1}</b> {rec}
            </div>
          ))}
        </section>
      </div>

      <section
        className="card"
        style={{ marginTop: 12, background: 'linear-gradient(135deg, #1b3d2a, #133321)', color: '#f6f1e4' }}
      >
        <p className="kicker" style={{ color: '#e8c868' }}>🌦 Weather Context</p>
        <p style={{ margin: '6px 0 0', lineHeight: 1.6 }}>{r.weatherContext}</p>
        <p style={{ margin: '8px 0 0', fontSize: 11, opacity: 0.7 }}>📍 Demo data — Nashik, Maharashtra</p>
      </section>

      {/* Officer Notes & Passport Endorsement Box with accessible form fields */}
      <section className="card" style={{ marginTop: 12, border: '1.5px solid #2b7a4d', background: '#f5faf7' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <ShieldCheck size={18} className="text-[#2b7a4d]" />
          <strong style={{ fontSize: 14, color: '#1b3d2a' }}>Official Officer Passport Certification</strong>
        </div>
        <p className="muted" style={{ fontSize: 12, margin: '0 0 12px' }}>
          Approving this diagnosis will generate a geotagged, timestamped digital record into farmer {r.farmer}&apos;s Crop Health Passport.
        </p>

        <div style={{ display: 'grid', gap: 14 }}>
          {/* Officer Findings & Notes */}
          <div>
            <label
              htmlFor="officer-findings-input"
              style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 4 }}
            >
              Officer Findings & Notes <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              ref={notesInputRef}
              id="officer-findings-input"
              type="text"
              value={officerNote}
              onChange={(e) => {
                setOfficerNote(e.target.value)
                if (notesError) setNotesError(null)
              }}
              disabled={status !== 'Pending' || isSubmitting}
              aria-invalid={Boolean(notesError)}
              aria-describedby={notesError ? 'officer-findings-error' : undefined}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                border: notesError ? '1.5px solid #dc2626' : '1px solid var(--line)',
                fontSize: 13,
                background: 'white',
              }}
            />
            {notesError && (
              <p id="officer-findings-error" role="alert" style={{ fontSize: 11, color: '#dc2626', fontWeight: 650, margin: '4px 0 0' }}>
                {notesError}
              </p>
            )}
          </div>

          {/* Prescribed Treatment */}
          <div>
            <label
              htmlFor="prescribed-treatment-input"
              style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 4 }}
            >
              Prescribed Agricultural Treatment <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              ref={actionInputRef}
              id="prescribed-treatment-input"
              type="text"
              value={recommendedAction}
              onChange={(e) => {
                setRecommendedAction(e.target.value)
                if (actionError) setActionError(null)
              }}
              disabled={status !== 'Pending' || isSubmitting}
              aria-invalid={Boolean(actionError)}
              aria-describedby={actionError ? 'prescribed-treatment-error' : undefined}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                border: actionError ? '1.5px solid #dc2626' : '1px solid var(--line)',
                fontSize: 13,
                background: 'white',
              }}
            />
            {actionError && (
              <p id="prescribed-treatment-error" role="alert" style={{ fontSize: 11, color: '#dc2626', fontWeight: 650, margin: '4px 0 0' }}>
                {actionError}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Explicit Review Actions Toolbar */}
      <div className="actions" style={{ marginTop: 20, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        {status === 'Pending' ? (
          <>
            <button
              type="button"
              className="btn btn-primary"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              style={{ width: 'auto', background: '#2b7a45', gap: 6 }}
              onClick={handleConfirmDiagnosis}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Certifying...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Confirm Diagnosis</span>
                </>
              )}
            </button>

            <button
              ref={rejectBtnRef}
              type="button"
              className="btn"
              disabled={isSubmitting}
              style={{ width: 'auto', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', gap: 6 }}
              onClick={() => setShowRejectModal(true)}
            >
              <XCircle size={16} />
              <span>Reject Diagnosis</span>
            </button>

            <button
              ref={rescanBtnRef}
              type="button"
              className="btn"
              disabled={isSubmitting}
              style={{ width: 'auto', background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', gap: 6 }}
              onClick={() => setShowRescanModal(true)}
            >
              <RotateCcw size={15} />
              <span>Request Re-scan</span>
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <p
              style={{
                margin: 0,
                fontWeight: 700,
                color: status === 'Selected' ? '#347044' : status === 'RescanRequested' ? '#8a6410' : '#a4462f',
              }}
            >
              {status === 'Selected'
                ? '✓ Diagnosis Confirmed & Certified in Passport'
                : status === 'RescanRequested'
                ? '↺ Leaf Re-scan Requested'
                : '✕ Diagnosis Rejected'}
            </p>
            {status === 'Selected' && (
              <Link
                href="/verify/passport/KRA-2026-NK-00124"
                target="_blank"
                className="ghost"
                style={{ fontSize: 12, gap: 4, display: 'inline-flex', alignItems: 'center' }}
              >
                <ExternalLink size={13} /> {t('viewCertificate')}
              </Link>
            )}
          </div>
        )}

        <Link href="/officer/review-queue" className="btn btn-ghost" style={{ width: 'auto' }}>
          {t('back')}
        </Link>
      </div>

      {/* ── Accessible Reject Dialog ── */}
      <AccessibleModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Crop Diagnosis"
        description="Provide a clear reason for the farmer before rejecting this diagnostic finding."
        triggerRef={rejectBtnRef}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#fef2f2', padding: '10px 14px', borderRadius: 10, fontSize: 12.5, color: '#991b1b' }}>
            <strong>Crop Report:</strong> {r.crop} · {r.disease} · Farmer: {r.farmer} ({r.location})
          </div>

          <div>
            <label
              htmlFor="rejection-reason-select"
              style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 6 }}
            >
              Select Rejection Category
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
              {[
                'Incorrect Pathogen Identification',
                'Image Does Not Match Crop',
                'Insufficient Symptoms Present',
                'Crop Nutritional Deficit (Not Disease)',
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setRejectionReason(reason)}
                  style={{
                    padding: '8px 10px',
                    fontSize: 12,
                    borderRadius: 8,
                    textAlign: 'left',
                    cursor: 'pointer',
                    background: rejectionReason === reason ? '#fee2e2' : '#ffffff',
                    border: rejectionReason === reason ? '2px solid #ef4444' : '1px solid var(--line)',
                    color: rejectionReason === reason ? '#991b1b' : 'var(--ink)',
                    fontWeight: rejectionReason === reason ? 700 : 500,
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="rejection-custom-note"
              style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 4 }}
            >
              Additional Officer Guidance (Optional)
            </label>
            <textarea
              id="rejection-custom-note"
              rows={3}
              placeholder="e.g. Symptoms look like potassium scorch rather than fungal rust. Advise soil test."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid var(--line)',
                fontSize: 12.5,
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <SecondaryButton onClick={() => setShowRejectModal(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              variant="danger"
              icon={<XCircle size={15} />}
              onClick={handleRejectDiagnosis}
            >
              Reject Diagnosis
            </PrimaryButton>
          </div>
        </div>
      </AccessibleModal>

      {/* ── Accessible Request Re-scan Dialog ── */}
      <AccessibleModal
        isOpen={showRescanModal}
        onClose={() => setShowRescanModal(false)}
        title="Request Leaf Re-scan"
        description="Notify the farmer to capture another photo with specific photographic guidance."
        triggerRef={rescanBtnRef}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#fffbeb', padding: '10px 14px', borderRadius: 10, fontSize: 12.5, color: '#92400e' }}>
            <strong>Farmer:</strong> {r.farmer} • Field: {r.location} • Submitted: {r.submittedDate}
          </div>

          <div>
            <label
              htmlFor="rescan-reason-select"
              style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 6 }}
            >
              Why is a re-scan needed? <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
              {[
                'Blurry or out-of-focus leaf',
                'Extreme sunlight glare or shadows',
                'Multiple overlapping leaves',
                'Lesion edge obscured / partial leaf',
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setRescanReason(reason)}
                  style={{
                    padding: '8px 10px',
                    fontSize: 12,
                    borderRadius: 8,
                    textAlign: 'left',
                    cursor: 'pointer',
                    background: rescanReason === reason ? '#fef3c7' : '#ffffff',
                    border: rescanReason === reason ? '2px solid #f59e0b' : '1px solid var(--line)',
                    color: rescanReason === reason ? '#92400e' : 'var(--ink)',
                    fontWeight: rescanReason === reason ? 700 : 500,
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="rescan-guidance-input"
              style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 4 }}
            >
              Specific Instructions for Farmer
            </label>
            <textarea
              id="rescan-guidance-input"
              rows={3}
              value={customRescanNotes}
              onChange={(e) => setCustomRescanNotes(e.target.value)}
              placeholder="e.g. Please take photo of the underside of lower leaf in indirect shade."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid var(--line)',
                fontSize: 12.5,
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <SecondaryButton onClick={() => setShowRescanModal(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              variant="primary"
              icon={<RotateCcw size={15} />}
              onClick={handleRequestRescan}
            >
              Request Re-scan
            </PrimaryButton>
          </div>
        </div>
      </AccessibleModal>
    </>
  )
}