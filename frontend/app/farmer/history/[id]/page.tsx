'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Check, MapPin, MessageCircle } from 'lucide-react'
import { getScanById } from '@/services/historyService'
import { saveLastPrediction } from '@/lib/prediction-store'
import { useI18n } from '@/lib/i18n'
import type { ScanRecord } from '@/types'

export default function HistoryDetailPage() {
  const { t } = useI18n()
  const { id } = useParams<{ id: string }>()
  const [row, setRow] = useState<ScanRecord | undefined>()

  useEffect(() => {
    getScanById(id).then((item) => {
      setRow(item)
      if (item) {
        saveLastPrediction({
          scanId: item.id,
          crop: item.crop,
          disease: item.disease,
          confidence: item.confidence,
          severity: item.severity,
          riskLevel: item.risk,
          symptoms: item.symptoms,
          precautions: item.precautions,
          actions: item.actions,
          expertHelp: item.expertHelp,
        })
      }
    })
  }, [id])

  if (!row) return <p className="muted">Loading…</p>

  return (
    <>
      <section className="banner">
        <div className="ring">
          <div>
            <b>{row.confidence}%</b>
            <small>{t('confidence')}</small>
          </div>
        </div>
        <div>
          <p className="kicker" style={{ color: '#e8c868' }}>
            {row.date}
          </p>
          <h1 style={{ margin: '4px 0', fontSize: 30 }}>
            {row.crop} · {row.disease}
          </h1>
          <p>
            {t('severity')}: {row.severity} · {t('risk')}: {row.risk}
          </p>
        </div>
      </section>
      <section className="card">
        {row.symptoms.map((item, idx) => (
          <div className="list-row" key={`${item}-${idx}`}>
            <Check size={16} /> {item}
          </div>
        ))}
        <div className="actions">
          <Link className="btn btn-primary" style={{ width: 'auto' }} href={`/farmer/chat?disease=${encodeURIComponent(row.disease)}&confidence=${row.confidence}`}>
            <MessageCircle size={16} /> {t('askAi')}
          </Link>
          <Link className="btn btn-gold" style={{ width: 'auto' }} href={`/farmer/help?for=${encodeURIComponent(row.disease)}`}>
            <MapPin size={16} /> {t('findHelp')}
          </Link>
        </div>
      </section>
    </>
  )
}
