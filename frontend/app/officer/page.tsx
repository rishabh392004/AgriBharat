'use client'

import Link from 'next/link'
import { ClipboardCheck, ArrowRight, ShieldAlert } from 'lucide-react'
import { CountUp } from '@/components/count-up'
import { NearbyHelp } from '@/components/nearby-help'
import { officerMetrics, regionalTrends, reports, reviewQueue } from '@/data/mock'
import { useI18n } from '@/lib/i18n'

export default function OfficerHome() {
  const { t } = useI18n()
  const pendingCount = reviewQueue.filter((r) => r.status === 'Pending').length

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p className="kicker">{t('officer')}</p>
          <h1 style={{ margin: '4px 0 6px' }}>{t('officerDash')}</h1>
          <p className="muted">Nashik district crop intelligence</p>
        </div>
        <Link href="/officer/review-queue" className="btn btn-primary" style={{ width: 'auto', gap: 8 }}>
          <ClipboardCheck size={16} />
          {t('reviewQueue')}
          <span style={{ background: '#e8c868', color: '#1b3d2a', borderRadius: 999, padding: '1px 7px', fontSize: 11, fontWeight: 800 }}>
            {pendingCount}
          </span>
        </Link>
      </div>

      {/* Prominent Review Queue CTA Banner */}
      <div
        className="card"
        style={{
          marginTop: 16,
          background: 'linear-gradient(135deg, #1b3d2a 0%, #25523a 100%)',
          color: '#f7f1e4',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          padding: '20px 24px',
          border: '1px solid #3d7a4a',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              background: '#e8c868',
              color: '#1b3d2a',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <ClipboardCheck size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong style={{ fontSize: 17, color: '#ffffff' }}>{pendingCount} {t('pendingReports')}</strong>
              <span className="chip" style={{ background: '#f3e3b0', color: '#8a6410', fontSize: 11, padding: '2px 8px' }}>
                Action Required
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#d0e0cc' }}>
              Field scans from Nashik, Pune & Nagpur waiting for officer verification
            </p>
          </div>
        </div>
        <Link
          href="/officer/review-queue"
          className="btn btn-gold"
          style={{ padding: '10px 20px', borderRadius: 999, fontWeight: 750, gap: 6 }}
        >
          {t('goToQueue')}
        </Link>
      </div>

      <div className="metrics" style={{ marginTop: 14 }}>
        {officerMetrics.map((m) => (
          <section className="metric" key={m.id}>
            <p className="kicker">{t(m.labelKey)}</p>
            <b>
              <CountUp value={m.value} />
            </b>
            <span className="muted">{m.change}</span>
          </section>
        ))}
      </div>
      <div className="grid-2" style={{ marginTop: 14 }}>
        <section className="card">
          <p className="kicker">{t('regionalTrends')}</p>
          {regionalTrends.map((row) => (
            <div className="trend" key={row.crop + row.disease}>
              <div>
                <strong>
                  {row.crop} · {row.disease}
                </strong>
                <p className="muted" style={{ margin: 0 }}>
                  {row.farms} farms
                </p>
              </div>
              <span className={row.change < 0 ? 'chip low' : 'chip high'}>
                {row.change > 0 ? '+' : ''}
                {row.change}%
              </span>
            </div>
          ))}
        </section>
        <section className="card">
          <p className="kicker">{t('recentReports')}</p>
          {reports.map((r) => (
            <div className="trend" key={r.id}>
              <div>
                <strong>{r.farmer}</strong>
                <p className="muted" style={{ margin: 0 }}>
                  {r.farm} · {r.prediction}
                </p>
              </div>
              <span className={`chip ${r.risk === 'High' ? 'high' : ''}`}>{r.status}</span>
            </div>
          ))}
          <Link className="ghost" href="/officer/reports" style={{ marginTop: 10 }}>
            {t('recentReports')}
          </Link>
        </section>
      </div>
      <section style={{ marginTop: 14 }}>
        <h2>{t('diseaseMap')}</h2>
        <NearbyHelp disease="Leaf Rust" />
      </section>
    </>
  )
}
