'use client'

import Link from 'next/link'
import { useEffect, useState, useMemo } from 'react'
import { Camera, Search, ShieldAlert, Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react'
import { getScanHistory } from '@/services/historyService'
import { checkDiagnosisVerification } from '@/services/passportService'
import { useI18n } from '@/lib/i18n'
import type { ScanRecord } from '@/types'

export default function HistoryPage() {
  const { t } = useI18n()
  const [rows, setRows] = useState<ScanRecord[]>([])
  const [filter, setFilter] = useState<'All' | 'High' | 'Medium' | 'Low' | 'Healthy'>('All')
  const [query, setQuery] = useState('')

  useEffect(() => {
    getScanHistory().then(setRows)
  }, [])

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchFilter =
        filter === 'All'
          ? true
          : filter === 'Healthy'
          ? r.status === 'Healthy'
          : r.risk === filter

      const q = query.toLowerCase()
      const matchQuery =
        !q ||
        r.crop.toLowerCase().includes(q) ||
        r.disease.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)

      return matchFilter && matchQuery
    })
  }, [rows, filter, query])

  const stats = useMemo(() => {
    const total = rows.length
    const high = rows.filter((r) => r.risk === 'High').length
    const healthy = rows.filter((r) => r.status === 'Healthy').length
    const avgConf = total > 0 ? Math.round(rows.reduce((acc, r) => acc + r.confidence, 0) / total) : 94
    return { total, high, healthy, avgConf }
  }, [rows])

  return (
    <div className="hist-dashboard">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <p className="kicker" style={{ margin: '0 0 4px' }}>{t('fieldDiagnosticsArchive')}</p>
          <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(24px, 4vw, 32px)' }}>{t('scanHistory')}</h1>
          <p className="muted" style={{ margin: 0, maxWidth: 600 }}>
            {t('historyPageDesc')}
          </p>
        </div>
        <Link href="/farmer/scan" className="btn btn-primary" style={{ width: 'auto', gap: 8, padding: '12px 22px' }}>
          <Camera size={18} />
          <span>{t('newCropScan')}</span>
        </Link>
      </div>

      {/* 4-Stat Summary Bar spanning full width */}
      <div className="hist-summary-grid">
        <div className="hist-stat-card">
          <small>{t('totalScans')}</small>
          <b>{stats.total}</b>
          <span>{t('recordedOnField')}</span>
        </div>
        <div className="hist-stat-card">
          <small>{t('highRiskCases')}</small>
          <b style={{ color: '#a4462f' }}>{stats.high}</b>
          <span style={{ color: '#a4462f' }}>{t('actionRequired')}</span>
        </div>
        <div className="hist-stat-card">
          <small>{t('healthy')}</small>
          <b style={{ color: '#3d7a4a' }}>{stats.healthy}</b>
          <span>{t('zeroPathogenDetected')}</span>
        </div>
        <div className="hist-stat-card">
          <small>{t('averageAccuracy')}</small>
          <b style={{ color: 'var(--forest)' }}>{stats.avgConf}%</b>
          <span>{t('aiModelConfidence')}</span>
        </div>
      </div>

      {/* Filter Tabs + Search Toolbar */}
      <div className="hist-toolbar">
        <div className="hist-tabs">
          {(['All', 'High', 'Medium', 'Healthy'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`hist-tab ${filter === tab ? 'on' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab === 'All' ? t('allScans') : tab === 'Healthy' ? t('healthyCrops') : t('riskLabel', { risk: tab })}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: 'min(300px, 100%)' }}>
          <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input
            placeholder={t('searchCropDisease')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: 999,
              border: '1px solid var(--line)',
              background: 'var(--card)',
              fontSize: 13,
              color: 'var(--ink)',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Expansive Full-Width Grid of Diagnostic Cards */}
      <div className="hist-grid">
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 16px', background: 'var(--card)', borderRadius: 20, border: '1px dashed var(--line)' }}>
            <p className="muted">{t('noScansFilter')}</p>
          </div>
        ) : (
          filtered.map((row, idx) => (
            <article key={`${row.id}-${idx}`} className="hist-card">
              <div>
                {/* Header */}
                <div className="hist-card-head">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="kicker" style={{ margin: 0, fontSize: 11 }}>#{row.id}</span>
                    {checkDiagnosisVerification(row.id) && (
                      <span
                        className="chip"
                        style={{
                          background: '#dcebd8',
                          color: '#2b7a4d',
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '2px 7px',
                        }}
                      >
                        <ShieldCheck size={11} style={{ marginRight: 3 }} />
                        Passport Verified
                      </span>
                    )}
                  </div>
                  <span
                    className="chip"
                    style={{
                      background:
                        row.risk === 'High' ? '#f7dfd4' : row.risk === 'Low' ? '#dcebd8' : '#fdf5e1',
                      color:
                        row.risk === 'High' ? '#a4462f' : row.risk === 'Low' ? '#347044' : '#8a6410',
                      fontSize: 11,
                      fontWeight: 750,
                    }}
                  >
                    {row.risk === 'High' && <span className="pulse-beacon" style={{ background: '#a4462f' }} />}
                    {t('riskLabel', { risk: row.risk })}
                  </span>
                </div>

                {/* Crop & Disease Headline */}
                <div className="hist-crop-row">
                  <div className={`thumb ${row.thumb}`}>{row.crop[0]}</div>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {t('cropPlot', { crop: row.crop })}
                    </span>
                    <h3 className="hist-disease-title">{row.disease}</h3>
                  </div>
                </div>

                {/* AI Confidence Meter */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 650, color: 'var(--muted)' }}>
                  <span>{t('diagnosticConfidence')}</span>
                  <span style={{ color: 'var(--leaf)', fontWeight: 800 }}>{row.confidence}%</span>
                </div>
                <div className="hist-conf-bar-wrap">
                  <div className="hist-conf-bar" style={{ width: `${row.confidence}%` }} />
                </div>

                {/* Symptoms Preview Box */}
                {row.symptoms && row.symptoms.length > 0 && (
                  <div className="hist-symptoms-box">
                    <strong style={{ display: 'block', fontSize: 11, color: 'var(--forest)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      {t('detectedSymptoms')}
                    </strong>
                    <p style={{ margin: 0, lineHeight: 1.45 }}>
                      • {row.symptoms[0]}
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer with CTA */}
              <div className="hist-card-foot">
                <span className="muted" style={{ fontSize: 12 }}>
                  📅 {row.date}
                </span>
                <Link
                  href={`/farmer/history/${row.id}`}
                  className="ghost"
                  style={{ background: 'var(--forest)', color: '#f6f1e4', border: 'none', padding: '8px 14px', borderRadius: 10 }}
                >
                  <span>{t('viewDetailsBtn')}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
