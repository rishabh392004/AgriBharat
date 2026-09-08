'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  XCircle,
  Search,
  SlidersHorizontal,
  Eye,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react'
import { reviewQueue } from '@/data/mock'
import { addVerifiedRecordToPassport } from '@/services/passportService'
import { toast } from '@/components/toast'
import { useI18n } from '@/lib/i18n'
import type { ReviewRecord, ReviewStatus } from '@/types'

type FilterTab = 'All' | ReviewStatus

const cropColors: Record<string, string> = {
  wheat: '#b08a3a',
  tomato: '#b45a3c',
  rice: '#5a8a4a',
  cotton: '#6d7c4c',
}

const riskColors: Record<string, string> = {
  High: '#a4462f',
  Medium: '#8a6410',
  Low: '#347044',
  Critical: '#6b0f0f',
}

export default function ReviewQueuePage() {
  const { t } = useI18n()
  const [records, setRecords] = useState<ReviewRecord[]>(reviewQueue)
  const [filter, setFilter] = useState<FilterTab>('All')
  const [search, setSearch] = useState('')
  const [rejectTarget, setRejectTarget] = useState<ReviewRecord | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchTab = filter === 'All' || r.status === filter
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        r.farmer.toLowerCase().includes(q) ||
        r.crop.toLowerCase().includes(q) ||
        r.disease.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q)
      return matchTab && matchSearch
    })
  }, [records, filter, search])

  const counts = useMemo(() => ({
    all: records.length,
    pending: records.filter((r) => r.status === 'Pending').length,
    selected: records.filter((r) => r.status === 'Selected').length,
    rejected: records.filter((r) => r.status === 'Rejected').length,
  }), [records])

  const handleSelect = async (r: ReviewRecord) => {
    setRecords((prev) =>
      prev.map((item) => (item.id === r.id ? { ...item, status: 'Selected' as ReviewStatus } : item))
    )

    // Automatically sync to Farmer's Digital Crop Health Passport
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
      officerNotes: `Field observation confirmed ${r.disease} symptoms on ${r.crop}. Preventive remedy endorsed.`,
      recommendedAction: r.recommendations?.[0] || 'Apply prescribed organic/chemical fungicide as per dosage schedule.',
      symptoms: r.symptoms || ['Visible leaf lesions', 'Foliage discoloration'],
    })

    toast(`✓ Verified & added to Crop Health Passport (KRA-2026-NK-00124)`)
  }

  const openReject = (record: ReviewRecord) => {
    setRejectTarget(record)
    setRejectionReason('')
  }

  const confirmReject = () => {
    if (!rejectTarget) return
    setRecords((prev) =>
      prev.map((r) =>
        r.id === rejectTarget.id
          ? { ...r, status: 'Rejected' as ReviewStatus, rejectionReason }
          : r
      )
    )
    toast(t('reportRejected'))
    setRejectTarget(null)
  }

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'All', label: 'All', count: counts.all },
    { key: 'Pending', label: 'Pending', count: counts.pending },
    { key: 'Selected', label: 'Selected', count: counts.selected },
    { key: 'Rejected', label: 'Rejected', count: counts.rejected },
  ]

  return (
    <>
      <div className="rq-header">
        <div>
          <p className="kicker">{t('officer')}</p>
          <h1 style={{ margin: '4px 0 6px' }}>{t('reviewQueue')}</h1>
          <p className="muted">{t('reviewQueueSub')}</p>
        </div>
        {counts.pending > 0 && (
          <div className="rq-pending-badge">
            <AlertTriangle size={16} />
            {counts.pending} {t('pendingReports')}
          </div>
        )}
      </div>

      <div className="rq-toolbar">
        <div className="rq-search">
          <Search size={16} />
          <input
            placeholder="Search farmer, crop or disease..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="rq-filter-icon" title="Filters">
          <SlidersHorizontal size={16} />
        </div>
      </div>

      <div className="rq-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`rq-tab ${filter === tab.key ? 'on' : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
            <span className={`rq-tab-count ${filter === tab.key ? 'on' : ''}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="rq-list">
        {filtered.length === 0 && (
          <div className="rq-empty">
            <p>No records match your filter.</p>
          </div>
        )}
        {filtered.map((r, i) => (
          <article key={r.id} className="rq-card" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="rq-card-head">
              <div className="rq-card-ref">
                <span className="kicker" style={{ margin: 0 }}>Ref #{r.refId}</span>
                <span
                  className="rq-status"
                  style={{
                    background: r.status === 'Selected' ? '#dcebd8' : r.status === 'Rejected' ? '#f7dfd4' : '#f3e3b0',
                    color: r.status === 'Selected' ? '#347044' : r.status === 'Rejected' ? '#a4462f' : '#8a6410',
                  }}
                >
                  {r.status === 'Pending' && <span className="pulse-beacon" style={{ background: '#8a6410' }} />}
                  {r.status}
                </span>
              </div>
              <div className="rq-thumb" style={{ background: cropColors[r.imageThumb] || '#5a8a4a' }}>
                {r.crop[0]}
              </div>
            </div>

            <div className="rq-card-body">
              <div className="rq-row">
                <div>
                  <p className="rq-farmer">{r.farmer}</p>
                  <p className="muted" style={{ fontSize: 12, margin: '2px 0' }}>📍 {r.location}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>{r.crop}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted)' }}>{r.submittedDate}</p>
                </div>
              </div>

              <div className="rq-detection">
                <div className="rq-disease-row">
                  <span className="rq-disease-name">{r.disease}</span>
                  <span className="rq-conf">{r.confidence}% confidence</span>
                </div>
                <div className="rq-chips">
                  <span className="chip" style={{ background: riskColors[r.riskLevel] + '22', color: riskColors[r.riskLevel], fontSize: 10 }}>
                    {r.riskLevel} Risk
                  </span>
                  <span className="chip" style={{ fontSize: 10 }}>{r.severity}</span>
                </div>
              </div>

              <div className="rq-conf-bar-wrap">
                <div className="rq-conf-bar" style={{ width: `${r.confidence}%` }} />
              </div>
            </div>

            <div className="rq-card-actions">
              {r.status === 'Pending' ? (
                <>
                  <button type="button" className="rq-btn-select" onClick={() => handleSelect(r)}>
                    <CheckCircle2 size={15} /> Select
                  </button>
                  <button type="button" className="rq-btn-reject" onClick={() => openReject(r)}>
                    <XCircle size={15} /> Reject
                  </button>
                </>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
                  {r.status === 'Selected' ? '✓ Approved' : '✕ Rejected'}
                  {r.rejectionReason && ` — ${r.rejectionReason}`}
                </span>
              )}
              <Link href={`/officer/review-queue/${r.id}`} className="rq-btn-details">
                <Eye size={15} /> Details
              </Link>
            </div>
          </article>
        ))}
      </div>

      {rejectTarget && (
        <div className="rq-modal-overlay" onClick={() => setRejectTarget(null)}>
          <div className="rq-modal" onClick={(e) => e.stopPropagation()}>
            <p className="kicker" style={{ margin: '0 0 8px' }}>Reject Report</p>
            <h2 style={{ margin: '0 0 6px' }}>{t('confirmReject')}</h2>
            <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
              {rejectTarget.crop} · {rejectTarget.disease} · {rejectTarget.farmer}
            </p>
            <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{t('rejectionReason')} (optional)</p>
            <div className="rq-reason-list">
              {[t('reasonIncorrect'), t('reasonImage'), t('reasonInsufficient'), t('reasonOther')].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  className={`rq-reason ${rejectionReason === reason ? 'on' : ''}`}
                  onClick={() => setRejectionReason(reason)}
                >
                  {reason}
                </button>
              ))}
            </div>
            <div className="rq-modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setRejectTarget(null)}>
                {t('cancel')}
              </button>
              <button type="button" className="btn rq-btn-reject-confirm" onClick={confirmReject}>
                <XCircle size={16} /> {t('rejectReport')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
