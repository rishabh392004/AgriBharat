'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Check,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Clock,
  FileCheck,
  ChevronRight,
  Sparkles,
  Share2,
  Printer,
  Layers,
  Flame,
  Volume2,
  VolumeX,
  PhoneCall,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Thermometer,
  Droplets,
  MessageSquare,
} from 'lucide-react'
import type { Prediction, PassportRecord } from '@/types'
import { GradCamViewer } from './GradCamViewer'
import { WhyThisDiagnosis } from './WhyThisDiagnosis'
import { getWhatsAppDeepLink, WHATSAPP_CONFIG } from '@/config/whatsapp'
import { useI18n } from '@/lib/i18n'

interface DiagnosisResultViewProps {
  prediction: Prediction
  verifiedRecord?: PassportRecord | null
  onAskChat?: (context: string) => void
  className?: string
}

export const DiagnosisResultView: React.FC<DiagnosisResultViewProps> = ({
  prediction,
  verifiedRecord,
  onAskChat,
  className = '',
}) => {
  const { t, locale } = useI18n()
  const [activeTreatmentTab, setActiveTreatmentTab] = useState<'actions' | 'precautions' | 'expert'>('actions')
  const [copiedLink, setCopiedLink] = useState<boolean>(false)
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false)

  const isHealthy = prediction.disease === 'Healthy'
  const cropImage = prediction.imageUrl || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80'
  const gradCamImage = prediction.gradCamImage || prediction.heatmapUrl || prediction.explanationImage

  const query = new URLSearchParams({
    disease: prediction.disease,
    confidence: String(prediction.confidence),
    severity: prediction.severity,
  }).toString()

  // Share result
  const handleShare = () => {
    const shareText = `Krishi Darpan AI Diagnosis: ${prediction.crop} - ${prediction.disease} (${prediction.confidence}% confidence, ${prediction.severity} severity). View explainable Grad-CAM heatmap.`
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'Krishi Darpan AI Diagnosis',
        text: shareText,
        url: window.location.href,
      }).catch(() => {})
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareText)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2400)
    }
  }

  // Voice advisory speech synthesis (Web Speech in user's active language)
  const handleToggleVoiceAdvisory = () => {
    if (!('speechSynthesis' in window)) return

    if (isPlayingVoice) {
      window.speechSynthesis.cancel()
      setIsPlayingVoice(false)
      return
    }

    window.speechSynthesis.cancel()

    const advisoryText = isHealthy
      ? `Namaste. Your ${prediction.crop} crop appears healthy with no active pathogen detected.`
      : `Namaste. Krishi Darpan AI detected ${prediction.disease} in your ${prediction.crop} leaf with ${prediction.confidence} percent confidence. ${prediction.explanation || ''} Recommended precautions: ${prediction.precautions.slice(0, 2).join('. ')}.`

    const utterance = new SpeechSynthesisUtterance(advisoryText)
    utterance.lang = locale === 'hi' ? 'hi-IN' : locale === 'mr' ? 'mr-IN' : locale === 'ta' ? 'ta-IN' : locale === 'te' ? 'te-IN' : locale === 'bn' ? 'bn-IN' : 'en-IN'
    utterance.rate = 0.95

    utterance.onstart = () => setIsPlayingVoice(true)
    utterance.onend = () => setIsPlayingVoice(false)
    utterance.onerror = () => setIsPlayingVoice(false)

    window.speechSynthesis.speak(utterance)
  }

  const whatsappDeepLink = getWhatsAppDeepLink(undefined, `${prediction.crop} (${prediction.disease})`)

  return (
    <div className={`diagnosis-result-root space-y-5 animate-fadeIn ${className}`}>
      {/* ── 1. Top Action & Print / Share Bar ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 4,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="chip low" style={{ fontSize: 11, padding: '3px 10px' }}>
            <Sparkles size={13} style={{ marginRight: 4 }} />
            {t('explainAiTitle')}
          </span>
          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
            ID: {prediction.scanId}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={handleShare}
            className="ghost"
            style={{ fontSize: 12, padding: '6px 12px', gap: 6 }}
          >
            <Share2 size={14} className="text-emerald-700" />
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>

          <button
            type="button"
            onClick={() => typeof window !== 'undefined' && window.print()}
            className="ghost no-print"
            style={{ fontSize: 12, padding: '6px 12px', gap: 6 }}
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* ── 2. Diagnosis Summary & Confidence Banner ── */}
      <section className="banner">
        <div className="ring">
          <div>
            <b>{prediction.confidence}%</b>
            <small>{t('confidence')}</small>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <p className="kicker" style={{ color: '#e8c868', margin: 0 }}>
              {isHealthy ? t('healthyCrop') : t('detected')}
            </p>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.18)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              {prediction.crop}
            </span>
          </div>

          <h1 style={{ margin: '4px 0 6px', fontSize: 'clamp(24px, 4vw, 34px)', letterSpacing: '-0.02em' }}>
            {prediction.disease}
          </h1>

          <p style={{ margin: 0, fontSize: 13, color: '#d8eedf', opacity: 0.95 }}>
            {prediction.crop} • {t('severity')}: <strong>{prediction.severity}</strong> • {t('risk')}: <strong>{prediction.riskLevel}</strong>
          </p>
        </div>
      </section>

      {/* ── 3. Explainable AI (Grad-CAM Visual Heatmap & Leaf Inspection) ── */}
      <section style={{ marginTop: 12 }}>
        <GradCamViewer
          imageUrl={cropImage}
          cropName={prediction.crop}
          diseaseName={prediction.disease}
          confidence={prediction.confidence}
          backendGradCamUrl={gradCamImage}
          attentionPoints={prediction.attentionPoints}
          initialMode="overlay"
        />
      </section>

      {/* ── 4. Why AI Thinks This (Farmer-Friendly Visual Reasoning) ── */}
      <section>
        <WhyThisDiagnosis
          cropName={prediction.crop}
          diseaseName={prediction.disease}
          confidence={prediction.confidence}
          explanationText={prediction.explanation}
          symptoms={prediction.symptoms}
        />
      </section>

      {/* ── 5. WhatsApp Fallback Integration Bar ── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #e8f9ed 0%, #daf4e2 100%)',
          border: '1.5px solid #25D366',
          borderRadius: 20,
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          boxShadow: '0 4px 16px rgba(37, 211, 102, 0.12)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#25D366',
              color: '#ffffff',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 2px 10px rgba(37, 211, 102, 0.4)',
              flexShrink: 0,
            }}
          >
            <MessageSquare size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <strong style={{ fontSize: 14, color: '#075e54' }}>
                {t('whatsappEntrySub')}
              </strong>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  background: '#075e54',
                  color: '#ffffff',
                  padding: '1px 6px',
                  borderRadius: 4,
                  textTransform: 'uppercase',
                }}
              >
                No-App
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#183a1b' }}>
              Receive future diagnosis, spray dosage, and voice notes directly in WhatsApp ({WHATSAPP_CONFIG.displayNumber}).
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Voice Advisory Quick Trigger */}
          <button
            type="button"
            onClick={handleToggleVoiceAdvisory}
            className="ghost"
            style={{
              fontSize: 12,
              background: '#ffffff',
              border: '1px solid #b7e4c7',
              color: '#075e54',
              fontWeight: 700,
              padding: '8px 14px',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
            title="Listen spoken advisory in your active language"
          >
            {isPlayingVoice ? <VolumeX size={15} className="text-rose-600" /> : <Volume2 size={15} className="text-emerald-700" />}
            <span>{isPlayingVoice ? t('pauseVoice') : t('voiceAdvisory')}</span>
          </button>

          <a
            href={whatsappDeepLink}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
            style={{
              background: '#075e54',
              borderColor: '#075e54',
              color: '#ffffff',
              fontSize: 12,
              padding: '8px 16px',
              borderRadius: 12,
              width: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            <span>{t('continueOnWhatsApp')}</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </section>

      {/* ── 6. Digital Crop Health Passport Verification Card ── */}
      <section
        className="card"
        style={{
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

      {/* ── 7. Recommendations & Treatment Protocols ── */}
      <div className="grid-2">
        <section className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <p className="kicker" style={{ margin: 0 }}>{t('actions')}</p>
            <span style={{ fontSize: 11, color: '#2b7a4d', fontWeight: 700 }}>ICAR Protocol</span>
          </div>

          {prediction.actions.map((item, i) => (
            <div className="list-row" key={`${item}-${i}`}>
              <b>0{i + 1}</b>
              <span style={{ fontSize: 13 }}>{item}</span>
            </div>
          ))}
        </section>

        <section className="card">
          <p className="kicker">{t('precautions')}</p>
          {prediction.precautions.map((item, idx) => (
            <div className="list-row" key={`${item}-${idx}`}>
              <Check size={16} className="text-emerald-700" />
              <span style={{ fontSize: 13 }}>{item}</span>
            </div>
          ))}
        </section>
      </div>

      {/* ── 8. Expert Agronomist & Agri-Mitra Assistance ── */}
      <section className="card">
        <p className="kicker">{t('expertWhen')}</p>
        <p style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.6 }}>{prediction.expertHelp}</p>
        <div className="actions" style={{ marginTop: 14 }}>
          <Link className="btn btn-primary" style={{ width: 'auto' }} href={`/farmer/chat?${query}`}>
            <MessageCircle size={16} /> {t('askAi')}
          </Link>
          <Link className="btn btn-gold" style={{ width: 'auto' }} href={`/farmer/help?for=${encodeURIComponent(prediction.disease)}`}>
            <MapPin size={16} /> {t('findHelp')}
          </Link>
          <Link className="btn btn-secondary" style={{ width: 'auto' }} href="/farmer/whatsapp">
            <MessageSquare size={16} /> WhatsApp Demo Hub
          </Link>
        </div>
      </section>
    </div>
  )
}
