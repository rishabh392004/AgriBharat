'use client'

import { reports } from '@/data/mock'
import { useI18n } from '@/lib/i18n'

export default function OfficerReportsPage() {
  const { t } = useI18n()
  return (
    <>
      <h1>{t('recentReports')}</h1>
      <div className="hist">
        {reports.map((r) => (
          <article className="place" key={r.id}>
            <div>
              <p className="kicker">{r.date}</p>
              <h3>
                {r.farmer} · {r.prediction}
              </h3>
              <p className="muted">
                {r.farm} · {r.crop} · {r.issue}
              </p>
            </div>
            <span className={`chip ${r.risk === 'High' ? 'high' : ''}`}>
              {r.risk} · {r.status}
            </span>
          </article>
        ))}
      </div>
    </>
  )
}
