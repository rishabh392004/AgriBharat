'use client'

import React from 'react'
import {
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  Search,
  ScanEye,
  Info,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface WhyThisDiagnosisProps {
  cropName: string
  diseaseName: string
  confidence: number
  explanationText?: string
  symptoms?: string[]
  className?: string
}

export const WhyThisDiagnosis: React.FC<WhyThisDiagnosisProps> = ({
  cropName,
  diseaseName,
  confidence,
  explanationText,
  symptoms = [],
  className = '',
}) => {
  const { t } = useI18n()
  const isHealthy = diseaseName === 'Healthy'

  const fallbackExplanation = isHealthy
    ? `AI scanned your ${cropName} leaf and found healthy foliar chlorophyll distribution with zero active pathogen lesions or spore clusters.`
    : t('aiAttentionExplanation', { disease: diseaseName })

  const displayExplanation = explanationText || fallbackExplanation

  return (
    <div
      className={`why-this-diagnosis-card ${className}`}
      style={{
        background: '#ffffff',
        borderRadius: 20,
        border: '1.5px solid #d4e6d7',
        padding: '20px 22px',
        boxShadow: '0 4px 18px rgba(27, 61, 42, 0.05)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 12,
          paddingBottom: 10,
          borderBottom: '1px solid #e8f3e5',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#eef7ec',
              color: '#2b7a4d',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <ScanEye size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1b3d2a' }}>
              {t('whyAiThinksThis')}
            </h3>
            <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
              {t('explainAiTitle')} • {confidence}% Match
            </span>
          </div>
        </div>

        <span
          className="chip low"
          style={{
            fontSize: 11,
            padding: '3px 10px',
            background: '#eaf4e8',
            color: '#245233',
            border: '1px solid #c2dec0',
          }}
        >
          <Sparkles size={12} style={{ marginRight: 4 }} />
          Pattern Recognition
        </span>
      </div>

      {/* Primary Farmer Explanation Text Box */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f7faf6 0%, #f0f6ee 100%)',
          border: '1px solid #cfe2cc',
          borderRadius: 14,
          padding: '14px 16px',
          marginBottom: 14,
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Lightbulb size={20} className="text-amber-600" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong style={{ fontSize: 13, color: '#1b3d2a', display: 'block', marginBottom: 3 }}>
              {isHealthy ? t('healthyCrop') : `${diseaseName} Detection Basis:`}
            </strong>
            <p style={{ margin: 0, fontSize: 13, color: '#2d4d35', lineHeight: 1.55 }}>
              &quot;{displayExplanation}&quot;
            </p>
          </div>
        </div>
      </div>

      {/* Key Visual Findings Checked by AI */}
      {symptoms && symptoms.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#476c49',
              letterSpacing: '0.04em',
              display: 'block',
              marginBottom: 8,
            }}
          >
            Visual Signatures Identified in Heatmap:
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {symptoms.map((symptom, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  color: '#1b3d2a',
                  background: '#ffffff',
                  padding: '7px 12px',
                  borderRadius: 10,
                  border: '1px solid #e3ede5',
                }}
              >
                <CheckCircle2 size={15} className="text-emerald-600" style={{ flexShrink: 0 }} />
                <span>{symptom}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explanatory Footer Note */}
      <div
        style={{
          marginTop: 14,
          paddingTop: 10,
          borderTop: '1px dashed #d4e6d7',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 11,
          color: '#5a7860',
        }}
      >
        <Info size={13} className="text-emerald-700" />
        <span>{t('attentionNote')}</span>
      </div>
    </div>
  )
}
