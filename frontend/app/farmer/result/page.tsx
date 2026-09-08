'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Check, MapPin, MessageCircle, ShieldCheck, Clock, FileCheck, ChevronRight } from 'lucide-react'
import { predictionsByCrop } from '@/data/mock'
import { readLastPrediction } from '@/lib/prediction-store'
import { checkDiagnosisVerification } from '@/services/passportService'
import { useI18n } from '@/lib/i18n'
import type { Prediction, PassportRecord } from '@/types'

export default function ResultPage() {
  const { t } = useI18n()
  const [result, setResult] = useState<Prediction>(predictionsByCrop.Wheat)
  const [verifiedRecord, setVerifiedRecord] = useState<PassportRecord | null>(null)

  useEffect(() => {
    const last = readLastPrediction() ?? predictionsByCrop.Wheat
    setResult(last)
    const record = checkDiagnosisVerification(last.scanId)
    setVerifiedRecord(record)
  }, [])

  const healthy = result.disease === 'Healthy'
  const query = new URLSearchParams({
    disease: result.disease,
    confidence: String(result.confidence),
    severity: result.severity,
  }).toString()

  return (
    <>
      <section className="banner">
        <div className="ring">
          <div>
            <b>{result.confidence}%</b>
            <small>{t('confidence')}</small>
          </div>
        </div>
        <div>
          <p className="kicker" style={{ color: '#e8c868' }}>
            {healthy ? t('healthyCrop') : t('detected')}
          </p>
          <h1 style={{ margin: '4px 0 6px', fontSize: 32 }}>{result.disease}</h1>
          <p>
            {result.crop} · {t('severity')}: {result.severity} · {t('risk')}: {result.riskLevel}
          </p>
        </div>
      </section>

      {/* Digital Crop Health Passport Card */}
      <section
        className="card"
        style={{
          marginBottom: 16,
          background: verifiedRecord ? 'linear-gradient(135deg, #f0faf4 0%, #e3f5ea 100%)' : '#fcfbf7',
          border: verifiedRecord ? '1.5px solid #2b7a4d' : '1.5px dashed #cfc2a8',
          padding: 20,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: verifiedRecord ? '#2b7a4d' : '#ede5d4',
                color: verifiedRecord ? 'white' : '#8a6410',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              {verifiedRecord ? <ShieldCheck size={24} /> : <Clock size={22} />}
            </div>
            <div>
              <span className="kicker" style={{ color: verifiedRecord ? '#2b7a4d' : '#8a6410', margin: 0 }}>
                DIGITAL CROP HEALTH PASSPORT
              </span>
              <h3 style={{ margin: '2px 0 2px', fontSize: 16 }}>
                {verifiedRecord ? '✓ Verified in Crop Health Passport' : 'Waiting for Officer Verification'}
              </h3>
              <p className="muted" style={{ margin: 0, fontSize: 12, maxWidth: 620 }}>
                {verifiedRecord
                  ? `Officer ${verifiedRecord.officerName} certified this record with GPS geotag (${verifiedRecord.locationName}).`
                  : 'This diagnosis has been submitted to the Agriculture Officer Review Queue. Once confirmed, it becomes an official timestamped & geotagged passport record.'}
              </p>
            </div>
          </div>

          <Link
            href="/farmer/crop-health-passport"
            className={`btn ${verifiedRecord ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: 'auto', fontSize: 13, gap: 6 }}
          >
            <FileCheck size={15} />
            <span>{verifiedRecord ? 'View in Passport' : 'Open Crop Passport'}</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </section>

      <div className="grid-2">
        <section className="card">
          <p className="kicker">{t('symptoms')}</p>
          {result.symptoms.map((item, idx) => (
            <div className="list-row" key={`${item}-${idx}`}>
              <Check size={16} /> {item}
            </div>
          ))}
        </section>
        <section className="card">
          <p className="kicker">{t('precautions')}</p>
          {result.precautions.map((item, idx) => (
            <div className="list-row" key={`${item}-${idx}`}>
              <Check size={16} /> {item}
            </div>
          ))}
        </section>
        <section className="card">
          <p className="kicker">{t('actions')}</p>
          {result.actions.map((item, i) => (
            <div className="list-row" key={`${item}-${i}`}>
              <b>0{i + 1}</b> {item}
            </div>
          ))}
        </section>
        <section className="card">
          <p className="kicker">{t('expertWhen')}</p>
          <p>{result.expertHelp}</p>
          <div className="actions">
            <Link className="btn btn-primary" style={{ width: 'auto' }} href={`/farmer/chat?${query}`}>
              <MessageCircle size={16} /> {t('askAi')}
            </Link>
            <Link className="btn btn-gold" style={{ width: 'auto' }} href={`/farmer/help?for=${encodeURIComponent(result.disease)}`}>
              <MapPin size={16} /> {t('findHelp')}
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}

