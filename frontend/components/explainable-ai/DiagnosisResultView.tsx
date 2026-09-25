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
  Volume2,
  VolumeX,
  ExternalLink,
  CheckCircle2,
  Leaf,
  MessageSquare,
  RotateCcw,
} from 'lucide-react'
import type { Prediction, PassportRecord } from '@/types'
import { GradCamViewer } from './GradCamViewer'
import { WhyThisDiagnosis } from './WhyThisDiagnosis'
import { getWhatsAppDeepLink, WHATSAPP_CONFIG } from '@/config/whatsapp'
import { useI18n } from '@/lib/i18n'
import { CROP_ADVISORIES } from '@/data/crop-translations'

interface DiagnosisResultViewProps {
  prediction: Prediction
  verifiedRecord?: PassportRecord | null
  onAskChat?: (context: string) => void
  className?: string
}

export const DiagnosisResultView: React.FC<DiagnosisResultViewProps> = ({
  prediction,
  verifiedRecord,
  className = '',
}) => {
  const { t, locale, setLocale } = useI18n()
  const [copiedLink, setCopiedLink] = useState<boolean>(false)
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false)

  const isHealthy = prediction.disease === 'Healthy'
  const cropImage = prediction.imageUrl || '/images/crops/tomato.jpg'
  const gradCamImage = prediction.gradCamImage || prediction.heatmapUrl || prediction.explanationImage

  // Retrieve rich agronomic translations for current crop & active language
  const advisory = CROP_ADVISORIES[prediction.crop]
  const currentLang = ['hi', 'mr', 'pa'].includes(locale) ? locale : 'en'

  const localizedDisease =
    prediction.vernacularName ||
    advisory?.localName?.[currentLang] ||
    prediction.disease

  const localizedWhatHappened =
    prediction.whatHappened ||
    advisory?.whatHappened?.[currentLang] ||
    advisory?.whatHappened?.en ||
    prediction.explanation ||
    'AI inspected foliar chlorophyll and identified pathogen lesion margins consistent with infection.'

  const localizedHowToReduce =
    prediction.howToReduce ||
    advisory?.howToReduce?.[currentLang] ||
    advisory?.howToReduce?.en ||
    '1. Prune and destroy diseased foliage. 2. Apply recommended systemic fungicide in the evening. 3. Avoid overhead watering.'

  const localizedChemical =
    prediction.chemicalControl ||
    advisory?.chemicalControl?.[currentLang] ||
    advisory?.chemicalControl?.en ||
    'Mancozeb 75% WP @ 2.5 g/L or Copper Oxychloride 50% WP @ 3 g/L'

  const localizedBiological =
    prediction.biologicalControl ||
    advisory?.biologicalControl?.[currentLang] ||
    advisory?.biologicalControl?.en ||
    '5% Neem Seed Kernel Extract (NSKE) or Trichoderma viride @ 5 g/L'

  const localizedPrecautions =
    advisory?.precautions?.[currentLang] ||
    prediction.precautions

  const audioText =
    prediction.audioScript ||
    advisory?.audioScript?.[currentLang] ||
    advisory?.audioScript?.en

  const query = new URLSearchParams({
    disease: prediction.disease,
    confidence: String(prediction.confidence),
    severity: prediction.severity,
  }).toString()

  // Share result
  const handleShare = () => {
    const shareText = `Krishi Darpan AI Diagnosis: ${prediction.crop} - ${localizedDisease} (${prediction.confidence}% confidence, ${prediction.severity} severity). View explainable Grad-CAM heatmap.`
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
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    if (isPlayingVoice) {
      window.speechSynthesis.cancel()
      setIsPlayingVoice(false)
      return
    }

    window.speechSynthesis.cancel()

    const textToSpeak = isHealthy
      ? (locale === 'hi'
          ? `नमस्ते किसान भाई। आपका ${prediction.crop} का पौधा पूरी तरह स्वस्थ है और इसमें कोई सक्रिय बीमारी नहीं पाई गई है।`
          : locale === 'mr'
          ? `नमस्कार शेतकरी मित्र. तुमचे ${prediction.crop} पीक पूर्णपणे निरोगी असून यात कोणताही रोग आढळलेला नाही.`
          : `Namaste Kisan friend. Your ${prediction.crop} crop appears healthy with no active pathogen detected.`)
      : (audioText ||
          (locale === 'hi'
            ? `नमस्ते किसान भाई। आपके ${prediction.crop} में ${localizedDisease} के लक्षण मिले हैं। ${localizedWhatHappened}। रोग कम करने के उपाय: ${localizedHowToReduce}।`
            : locale === 'mr'
            ? `नमस्कार शेतकरी मित्र. तुमच्या ${prediction.crop} पिकात ${localizedDisease} चा प्रादुर्भाव आढळला आहे. ${localizedWhatHappened}। रोग नियंत्रणासाठी: ${localizedHowToReduce}।`
            : `Namaste Kisan friend. In your ${prediction.crop} crop, ${prediction.disease} was detected. What happened: ${localizedWhatHappened}. How to reduce it: ${localizedHowToReduce}.`))

    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    utterance.lang =
      locale === 'hi' ? 'hi-IN' :
      locale === 'mr' ? 'mr-IN' :
      locale === 'pa' ? 'pa-IN' :
      'en-IN'
    utterance.rate = 0.92

    utterance.onstart = () => setIsPlayingVoice(true)
    utterance.onend = () => setIsPlayingVoice(false)
    utterance.onerror = () => setIsPlayingVoice(false)

    window.speechSynthesis.speak(utterance)
  }

  const whatsappDeepLink = getWhatsAppDeepLink(undefined, `${prediction.crop} (${localizedDisease})`)

  return (
    <div className={`diagnosis-result-root space-y-5 animate-fadeIn ${className}`}>
      {/* ── 1. Top Bar: Language Switcher, Share & Print ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          background: 'rgba(255,255,255,0.95)',
          border: '1px solid var(--line)',
          borderRadius: 16,
          padding: '8px 14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        {/* Language Selection Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 750, color: 'var(--ink)', marginRight: 2 }}>
            🌐 {t('language') || 'Language'}:
          </span>
          {[
            { code: 'en', label: 'English' },
            { code: 'hi', label: 'हिन्दी' },
            { code: 'mr', label: 'मराठी' },
            { code: 'pa', label: 'ਪੰਜਾਬੀ' },
          ].map((l) => {
            const isSel = locale === l.code
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  if (isPlayingVoice && typeof window !== 'undefined') window.speechSynthesis.cancel()
                  setIsPlayingVoice(false)
                  setLocale(l.code as any)
                }}
                style={{
                  border: isSel ? '1.5px solid #2b7a4d' : '1px solid #d4e6d7',
                  background: isSel ? '#2b7a4d' : '#ffffff',
                  color: isSel ? '#ffffff' : '#1b3d2a',
                  borderRadius: 99,
                  padding: '4px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {l.label}
              </button>
            )
          })}
        </div>

        {/* Share & Print Buttons */}
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
            <span>{t('printReport')}</span>
          </button>
        </div>
      </div>

      {/* ── 2. Prominent Spoken Audio Narration Card ── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1b3d2a 0%, #122c1d 100%)',
          borderRadius: 20,
          padding: '16px 20px',
          color: '#ffffff',
          boxShadow: '0 6px 22px rgba(18, 44, 29, 0.2)',
          border: '1.5px solid rgba(232, 200, 104, 0.4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              type="button"
              onClick={handleToggleVoiceAdvisory}
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: isPlayingVoice ? '#ef4444' : 'linear-gradient(135deg, #e8c868, #d4a017)',
                color: isPlayingVoice ? '#ffffff' : '#122c1d',
                border: 0,
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(232, 200, 104, 0.4)',
                flexShrink: 0,
                transition: 'transform 0.15s ease',
              }}
              title={isPlayingVoice ? 'Pause Audio' : 'Play Audio'}
            >
              {isPlayingVoice ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong style={{ fontSize: 15, color: '#ffffff' }}>
                  {locale === 'hi'
                    ? '🔊 बोलकर सलाह सुनें (AI किसान वाणी)'
                    : locale === 'mr'
                    ? '🔊 ऑडिओ सल्ला ऐका (AI वाणी)'
                    : '🔊 Spoken Audio Advisory (Voice Doctor)'}
                </strong>
                {isPlayingVoice && (
                  <span
                    style={{
                      fontSize: 10,
                      background: '#ef4444',
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: 99,
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                    }}
                  >
                    PLAYING
                  </span>
                )}
              </div>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
                {isPlayingVoice
                  ? (locale === 'hi'
                      ? 'आवाज़ चल रही है... रोकने के लिए बटन दबाएं।'
                      : locale === 'mr'
                      ? 'ऑडिओ सुरू आहे... थांबवण्यासाठी बटन दाबा.'
                      : 'Speaking now... click button to stop.')
                  : (locale === 'hi'
                      ? 'अपनी भाषा में पूरी जांच, फसल को क्या हुआ और दवाई की खुराक बोलकर सुनें।'
                      : locale === 'mr'
                      ? 'तुमच्या भाषेत संपूर्ण निदान, पिकाला काय झाले व औषध मात्रा ऐका.'
                      : 'Listen to diagnosis, root cause, and chemical spray dosages read aloud in your language.')}
              </p>
            </div>
          </div>

          <span
            style={{
              fontSize: 11,
              color: '#e8c868',
              fontWeight: 750,
              background: 'rgba(255,255,255,0.1)',
              padding: '4px 12px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            🗣️ {locale === 'hi' ? 'हिन्दी आवाज़' : locale === 'mr' ? 'मराठी आवाज' : locale === 'pa' ? 'ਪੰਜਾਬੀ ਆਵਾਜ਼' : 'English Voice'}
          </span>
        </div>
      </section>

      {/* ── 3. Officer Verification vs AI Advisory Status ── */}
      {verifiedRecord ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            background: '#f0fdf4',
            border: '1.5px solid #86efac',
            borderRadius: 16,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#16a34a',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong style={{ fontSize: 14, color: '#166534' }}>
                  Official Officer Certified Record
                </strong>
                <span
                  style={{
                    background: '#dcfce7',
                    color: '#166534',
                    border: '1px solid #86efac',
                    borderRadius: 99,
                    padding: '2px 8px',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  ✓ VERIFIED
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#15803d' }}>
                Certified by Officer {verifiedRecord.officerName} ({verifiedRecord.locationName}) on {verifiedRecord.verifiedAt || verifiedRecord.date}.
              </p>
            </div>
          </div>
          <Link
            href="/farmer/crop-health-passport"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#166534',
              textDecoration: 'underline',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>View Certified Passport</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      ) : (
        <div
          role="status"
          aria-live="polite"
          style={{
            background: '#fffbeb',
            border: '1.5px solid #fde68a',
            borderRadius: 16,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#d97706',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <Clock size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong style={{ fontSize: 14, color: '#92400e' }}>
                  AI Detection (Preliminary - Pending Officer Verification)
                </strong>
                <span
                  style={{
                    background: '#fef3c7',
                    color: '#92400e',
                    border: '1px solid #fcd34d',
                    borderRadius: 99,
                    padding: '2px 8px',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  ⏳ UNVERIFIED
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#78350f' }}>
                This is an automated advisory based on computer vision. District agronomists review high-severity scans for certification.
              </p>
            </div>
          </div>
          {prediction.isDemo && (
            <span
              style={{
                background: '#ede9fe',
                color: '#6d28d9',
                border: '1px solid #c4b5fd',
                borderRadius: 99,
                padding: '4px 10px',
                fontSize: 11.5,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Sparkles size={12} />
              <span>Demo / Simulation Preview</span>
            </span>
          )}
        </div>
      )}

      {/* ── 4. Diagnosis Summary & Confidence Banner ── */}
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

          <h1 style={{ margin: '4px 0 6px', fontSize: 'clamp(22px, 4vw, 32px)', letterSpacing: '-0.02em' }}>
            {localizedDisease}
          </h1>

          <p style={{ margin: 0, fontSize: 13, color: '#d8eedf', opacity: 0.95 }}>
            {prediction.crop} • {t('severity')}: <strong>{prediction.severity}</strong> • {t('risk')}: <strong>{prediction.riskLevel}</strong>
          </p>
        </div>
      </section>

      {/* ── 5. What Happened to Your Crop (Root Cause & Foliar Infection Analysis) ── */}
      <section
        className="card"
        style={{
          background: '#ffffff',
          borderRadius: 20,
          border: '1.5px solid #d4e6d7',
          padding: 22,
          boxShadow: '0 4px 16px rgba(27, 61, 42, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: '#eef7ec',
              color: '#2b7a4d',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Leaf size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1b3d2a' }}>
              {locale === 'hi'
                ? '🌾 फसल को क्या हुआ? (कारण व संक्रमण)'
                : locale === 'mr'
                ? '🌾 पिकाला काय झाले? (कारण व संसर्ग)'
                : '🌾 What Happened To Your Crop? (Root Cause)'}
            </h3>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
              Pathogen infection analysis & foliar damage explanation
            </span>
          </div>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #fbfcfb 0%, #f4f8f4 100%)',
            border: '1px solid #dcebde',
            borderRadius: 14,
            padding: '16px 18px',
            fontSize: 14,
            lineHeight: 1.65,
            color: '#22442b',
          }}
        >
          {localizedWhatHappened}
        </div>
      </section>

      {/* ── 6. How to Reduce & Cure the Disease (Chemical, Bio & Cultural Steps) ── */}
      <section
        className="card"
        style={{
          background: '#ffffff',
          borderRadius: 20,
          border: '1.5px solid #d4e6d7',
          padding: 22,
          boxShadow: '0 4px 16px rgba(27, 61, 42, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: '#fff7ed',
              color: '#c2410c',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1b3d2a' }}>
              {locale === 'hi'
                ? '🛠️ रोग कैसे रोकें व उपचार (Immediate Treatment Guide)'
                : locale === 'mr'
                ? '🛠️ रोग कसा कमी करावा व उपाय'
                : '🛠️ How To Reduce & Cure The Disease'}
            </h3>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
              ICAR-approved chemical dosages & organic bio-remedies
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Chemical Control */}
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 14,
              padding: '14px 16px',
            }}
          >
            <strong style={{ fontSize: 13, color: '#991b1b', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              🧪 {locale === 'hi' ? 'रासायनिक उपचार (Chemical Spray Dosage):' : locale === 'mr' ? 'रासायनिक फवारणी मात्रा:' : 'Recommended Chemical Spray Dosage:'}
            </strong>
            <p style={{ margin: 0, fontSize: 13.5, color: '#7f1d1d', lineHeight: 1.55 }}>
              {localizedChemical}
            </p>
          </div>

          {/* Biological / Organic Control */}
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 14,
              padding: '14px 16px',
            }}
          >
            <strong style={{ fontSize: 13, color: '#166534', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              🌿 {locale === 'hi' ? 'जैविक व देसी उपाय (Organic / Bio-Control):' : locale === 'mr' ? 'सेंद्रिय व जैविक उपाय:' : 'Biological & Organic Control:'}
            </strong>
            <p style={{ margin: 0, fontSize: 13.5, color: '#14532d', lineHeight: 1.55 }}>
              {localizedBiological}
            </p>
          </div>

          {/* Practical Step Guide */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '14px 16px',
            }}
          >
            <strong style={{ fontSize: 13, color: '#334155', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              📋 {locale === 'hi' ? 'रोग कम करने की चरणबद्ध विधि:' : locale === 'mr' ? 'रोग कमी करण्याची कृती:' : 'Step-by-Step Reduction Protocol:'}
            </strong>
            <p style={{ margin: 0, fontSize: 13.5, color: '#1e293b', lineHeight: 1.6 }}>
              {localizedHowToReduce}
            </p>
          </div>
        </div>
      </section>

      {/* ── 7. Essential Precautions (Checklist) ── */}
      <section
        className="card"
        style={{
          background: '#ffffff',
          borderRadius: 20,
          border: '1.5px solid #d4e6d7',
          padding: 22,
          boxShadow: '0 4px 16px rgba(27, 61, 42, 0.05)',
        }}
      >
        <p className="kicker" style={{ marginBottom: 12 }}>
          🛡️ {locale === 'hi' ? 'आवश्यक सावधानियां' : locale === 'mr' ? 'महत्त्वाची खबरदारी' : t('precautions')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {localizedPrecautions.map((item, idx) => (
            <div className="list-row" key={`${item}-${idx}`} style={{ padding: '8px 12px', background: '#fcfdfc', borderRadius: 10, border: '1px solid #eef4ee' }}>
              <Check size={18} className="text-emerald-700" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13.5, color: 'var(--ink)' }}>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 8. Explainable AI (Grad-CAM Visual Heatmap & Leaf Inspection) ── */}
      <section style={{ marginTop: 12 }}>
        <GradCamViewer
          imageUrl={cropImage}
          cropName={prediction.crop}
          diseaseName={localizedDisease}
          confidence={prediction.confidence}
          backendGradCamUrl={gradCamImage}
          attentionPoints={prediction.attentionPoints}
          initialMode="overlay"
        />
      </section>

      {/* ── 9. Why AI Thinks This (Farmer-Friendly Visual Reasoning) ── */}
      <section>
        <WhyThisDiagnosis
          cropName={prediction.crop}
          diseaseName={localizedDisease}
          confidence={prediction.confidence}
          explanationText={localizedWhatHappened}
          symptoms={prediction.symptoms}
        />
      </section>

      {/* ── 10. WhatsApp Fallback Integration Bar ── */}
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

      {/* ── 11. Next Action Buttons ── */}
      <section className="card" style={{ padding: 18 }}>
        <p className="kicker">{t('nextSteps') || 'Next Steps'}</p>
        <div className="actions" style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <Link className="btn btn-primary" style={{ width: 'auto' }} href={`/farmer/chat?${query}`}>
            <MessageCircle size={16} /> {t('askAi')}
          </Link>
          <Link className="btn btn-gold" style={{ width: 'auto' }} href={`/farmer/help?for=${encodeURIComponent(prediction.disease)}`}>
            <MapPin size={16} /> {t('findHelp')}
          </Link>
          <Link className="btn btn-secondary" style={{ width: 'auto' }} href="/farmer/crop-health-passport">
            <ShieldCheck size={16} /> Add to Crop Health Passport
          </Link>
          <Link
            className="ghost"
            style={{
              width: 'auto',
              border: '1px solid var(--line)',
              background: '#ffffff',
              textDecoration: 'none',
              padding: '8px 14px',
              borderRadius: 10,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 650,
              color: 'var(--ink)',
            }}
            href="/farmer/scan"
          >
            <RotateCcw size={15} /> Retry Scan / New Photo
          </Link>
          <Link
            className="ghost"
            style={{
              width: 'auto',
              border: '1px solid var(--line)',
              background: '#ffffff',
              textDecoration: 'none',
              padding: '8px 14px',
              borderRadius: 10,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 650,
              color: 'var(--ink)',
            }}
            href="/farmer/history"
          >
            <Clock size={15} /> View History
          </Link>
        </div>
      </section>
    </div>
  )
}
