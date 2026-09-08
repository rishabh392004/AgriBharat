'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  Sprout,
  Eye,
  AlertTriangle,
} from 'lucide-react'
import { reports } from '@/data/mock'
import { useI18n } from '@/lib/i18n'

type FilterTab = 'All' | 'Pending' | 'Under Review' | 'Verified' | 'High Risk'

export default function OfficerReportsPage() {
  const { t } = useI18n()
  const [filter, setFilter] = useState<FilterTab>('All')
  const [search, setSearch] = useState('')

  const stats = useMemo(() => {
    return {
      total: reports.length,
      highRisk: reports.filter((r) => r.risk === 'High').length,
      pending: reports.filter((r) => r.status === 'Pending' || r.status === 'Under Review').length,
      verified: reports.filter((r) => r.status === 'Verified').length,
    }
  }, [])

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      let matchesFilter = true
      if (filter === 'Pending') matchesFilter = r.status === 'Pending'
      else if (filter === 'Under Review') matchesFilter = r.status === 'Under Review'
      else if (filter === 'Verified') matchesFilter = r.status === 'Verified'
      else if (filter === 'High Risk') matchesFilter = r.risk === 'High'

      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        r.farmer.toLowerCase().includes(q) ||
        r.crop.toLowerCase().includes(q) ||
        r.prediction.toLowerCase().includes(q) ||
        r.farm.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)

      return matchesFilter && matchesSearch
    })
  }, [filter, search])

  const getRiskChipClass = (risk: string) => {
    if (risk === 'High') return 'chip high'
    if (risk === 'Medium') return 'chip'
    return 'chip low'
  }

  const getStatusBadge = (status: string) => {
    if (status === 'Verified') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#e7f4ea', color: '#1e7e34', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
          <CheckCircle2 size={12} /> Verified
        </span>
      )
    }
    if (status === 'Under Review') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fff3cd', color: '#856404', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
          <Clock size={12} /> Under Review
        </span>
      )
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f8d7da', color: '#721c24', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
        <AlertTriangle size={12} /> Pending Action
      </span>
    )
  }

  return (
    <div className="animate-fadeIn space-y-4">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <p className="kicker" style={{ margin: 0 }}>{t('officer')}</p>
            <span className="chip low" style={{ fontSize: 10, padding: '2px 8px' }}>
              Nashik District Intelligence
            </span>
          </div>
          <h1 style={{ margin: '4px 0 6px' }}>{t('recentReports')}</h1>
          <p className="muted">
            Field disease reports submitted by farmers across Nashik, Igatpuri & Niphad clusters
          </p>
        </div>
        <Link href="/officer/review-queue" className="btn btn-primary" style={{ width: 'auto', gap: 8 }}>
          <FileText size={16} />
          {t('reviewQueue')}
        </Link>
      </div>

      {/* Stats Summary Bar */}
      <div className="metrics" style={{ marginTop: 12 }}>
        <section className="metric">
          <p className="kicker">Total Field Reports</p>
          <b>{stats.total}</b>
          <span className="muted">Current Season</span>
        </section>
        <section className="metric">
          <p className="kicker">High Risk Outbreaks</p>
          <b style={{ color: '#a4462f' }}>{stats.highRisk}</b>
          <span className="muted">Priority Inspection</span>
        </section>
        <section className="metric">
          <p className="kicker">Pending Officer Review</p>
          <b style={{ color: '#8a6410' }}>{stats.pending}</b>
          <span className="muted">Awaiting Action</span>
        </section>
        <section className="metric">
          <p className="kicker">Verified & Signed</p>
          <b style={{ color: '#347044' }}>{stats.verified}</b>
          <span className="muted">Synced to Passport</span>
        </section>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          padding: '14px 18px',
        }}
      >
        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['All', 'High Risk', 'Pending', 'Under Review', 'Verified'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className="ghost"
              style={{
                borderRadius: 999,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: filter === tab ? 750 : 600,
                background: filter === tab ? 'var(--forest)' : 'transparent',
                color: filter === tab ? '#ffffff' : 'var(--ink)',
                border: filter === tab ? 'none' : '1px solid var(--line)',
                transition: 'all 160ms ease',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#f9f6ef',
            border: '1px solid var(--line)',
            borderRadius: 12,
            padding: '6px 12px',
            minWidth: 220,
          }}
        >
          <Search size={14} className="text-muted" />
          <input
            type="text"
            placeholder="Search farmer, crop, disease..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 0, outline: 'none', background: 'transparent', fontSize: 13, width: '100%' }}
          />
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <div className="card text-center" style={{ padding: '32px 16px' }}>
            <FileText size={36} className="text-muted" style={{ margin: '0 auto 8px' }} />
            <p className="muted" style={{ margin: 0 }}>No reports matching your selected filter.</p>
          </div>
        ) : (
          filteredReports.map((r) => (
            <div
              key={r.id}
              className="card group hover:border-forest"
              style={{
                padding: '16px 20px',
                transition: 'all 180ms ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 260 }}>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    background: r.risk === 'High' ? 'rgba(164, 70, 47, 0.1)' : 'rgba(43, 122, 77, 0.1)',
                    color: r.risk === 'High' ? '#a4462f' : '#2b7a4d',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Sprout size={24} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>{r.id}</span>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>• {r.date}</span>
                    <span className={getRiskChipClass(r.risk)} style={{ fontSize: 10, padding: '1px 7px' }}>
                      {r.risk} Risk
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: 'var(--forest)' }}>
                    {r.farmer} · {r.crop} ({r.prediction})
                  </h3>

                  <p className="muted" style={{ margin: 0, fontSize: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span>📍 {r.farm}</span>
                    <span>🐛 Symptom: {r.issue}</span>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {getStatusBadge(r.status)}
                <Link
                  href="/officer/review-queue"
                  className="btn ghost"
                  style={{
                    fontSize: 12,
                    padding: '7px 14px',
                    borderRadius: 10,
                    border: '1px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Eye size={14} />
                  <span>Inspect</span>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
