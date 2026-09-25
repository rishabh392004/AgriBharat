'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Bot,
  Camera,
  ArrowRight,
  Sun,
  Droplets,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Navigation,
  Loader2,
  Play,
  Video,
  HelpCircle,
  FlaskConical,
  Radio,
  Wind,
  Clock,
  ChevronDown,
  ChevronUp,
  Check,
  Search,
  Brain,
  ShieldCheck,
  Calendar,
  Layers,
  Activity,
  AlertTriangle,
  Zap,
  Sprout,
  Compass,
} from 'lucide-react'
import { CountUp } from '@/components/count-up'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { alerts, scans, weatherFull } from '@/data/mock'
import { WhatsAppBanner } from '@/components/whatsapp/WhatsAppBanner'
import { WeatherRiskWidget } from '@/components/weather-risk-widget'
import { OutbreakMap } from '@/components/outbreak-map'
import { toast } from '@/components/toast'
import { detectLiveLocation } from '@/lib/location'
import { FarmerTourVideoModal } from '@/components/farmer-tour-video-modal'
import { CropHealthChart } from '@/components/crop-health-chart'
import { SprayCalculatorModal } from '@/components/spray-calculator-modal'

type CropKey = 'wheat' | 'rice' | 'tomato' | 'cotton'

interface CropProfile {
  key: CropKey
  name: string
  hindiName: string
  variety: string
  acreage: string
  health: number
  healthDelta: string
  risk: 'Low' | 'Medium' | 'High'
  riskScore: number
  primaryThreat: string
  pathogen: string
  immediateAction: string
  recommendedChemical: string
  foliageVigour: number
  soilMoisture: number
  chlorophyllIndex: number
  soilNPK: { n: number; p: number; k: number }
  todo: string[]
}

const CROPS: Record<CropKey, CropProfile> = {
  wheat: {
    key: 'wheat',
    name: 'Wheat',
    hindiName: 'गेहूं (Sharbati)',
    variety: 'HD-2967 High-Yield',
    acreage: '4.5 Acres • Field 1',
    health: 94,
    healthDelta: '+3% this week',
    risk: 'Low',
    riskScore: 18,
    primaryThreat: 'Yellow Rust (Puccinia striiformis)',
    pathogen: 'Airborne fungal spores under high morning humidity (>80%)',
    immediateAction: 'Apply preventive neem spray on perimeter rows before evening dew.',
    recommendedChemical: 'Mancozeb 75% WP @ 2.0g/L or Neem Oil @ 3.5ml/L',
    foliageVigour: 96,
    soilMoisture: 68,
    chlorophyllIndex: 92,
    soilNPK: { n: 120, p: 60, k: 40 },
    todo: [
      'Inspect border rows for early yellow foliar pustules',
      'Apply preventive Neem Oil (10,000 ppm) after 4:30 PM',
      'Clear perimeter drainage channel before upcoming rain',
    ],
  },
  rice: {
    key: 'rice',
    name: 'Paddy Rice',
    hindiName: 'धान (Basmati 1509)',
    variety: 'Pusa Basmati 1509',
    acreage: '2.0 Acres • Lowland Basin',
    health: 91,
    healthDelta: '+1% steady',
    risk: 'Low',
    riskScore: 22,
    primaryThreat: 'Brown Spot (Bipolaris oryzae)',
    pathogen: 'Fungal leaf spots during alternating wet & dry soil periods',
    immediateAction: 'Maintain 3-5 cm standing water layer; top-dress with balanced potash.',
    recommendedChemical: 'Carbendazim 50 WP @ 1.0g/L if lesions exceed 5%',
    foliageVigour: 91,
    soilMoisture: 84,
    chlorophyllIndex: 89,
    soilNPK: { n: 100, p: 50, k: 50 },
    todo: [
      'Verify water standing level across panicle stage plots',
      'Apply top dressing of 25 kg/acre urea before flowering',
      'Check lower leaf sheaths for early sheath blight lesions',
    ],
  },
  tomato: {
    key: 'tomato',
    name: 'Tomato',
    hindiName: 'टमाटर (Abhinav Hybrid)',
    variety: 'Seminis Abhinav F1',
    acreage: '1.2 Acres • Drip Mulch',
    health: 78,
    healthDelta: '-4% alert',
    risk: 'High',
    riskScore: 68,
    primaryThreat: 'Early Blight (Alternaria solani)',
    pathogen: 'Concentric ring brown target lesions on lower mature foliage',
    immediateAction: 'URGENT: Prune infected bottom leaves and spray Copper Oxychloride today.',
    recommendedChemical: 'Copper Oxychloride 50 WP @ 2.5g/L water',
    foliageVigour: 74,
    soilMoisture: 76,
    chlorophyllIndex: 80,
    soilNPK: { n: 150, p: 80, k: 100 },
    todo: [
      'Prune and safely burn bottom 3 leaves showing dark spots',
      'Spray Copper Oxychloride 50 WP @ 2.5g/L immediately',
      'Sanitize staking poles and avoid overhead sprinkling',
    ],
  },
  cotton: {
    key: 'cotton',
    name: 'Cotton',
    hindiName: 'कपास (Bt Bollgard II)',
    variety: 'RCH-659 BG-II',
    acreage: '3.0 Acres • Block C',
    health: 85,
    healthDelta: '+2% steady',
    risk: 'Medium',
    riskScore: 42,
    primaryThreat: 'Bacterial Blight & Whitefly (Xanthomonas)',
    pathogen: 'Water-soaked angular spots & sucking pest aggregation',
    immediateAction: 'Install 10 yellow sticky traps per acre; inspect squares for bollworm.',
    recommendedChemical: 'Streptocycline 1g + Copper Oxychloride 25g in 10L water',
    foliageVigour: 86,
    soilMoisture: 62,
    chlorophyllIndex: 85,
    soilNPK: { n: 80, p: 40, k: 40 },
    todo: [
      'Install 10 yellow sticky traps/acre for whitefly pest monitoring',
      'Sample 20 random squares for pink bollworm entry signs',
      'Apply foliar spray of 2% DAP for enhanced boll retention',
    ],
  },
}

export default function FarmerDashboard() {
  const { t, locale } = useI18n()
  const { farmer, setFarmer } = useAuth()
  const latest = scans[0]

  // Interactive UI State
  const [selectedCropKey, setSelectedCropKey] = useState<CropKey>('wheat')
  const [locating, setLocating] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)
  const [sprayCalcOpen, setSprayCalcOpen] = useState(false)
  const [expandHealth, setExpandHealth] = useState(false)
  const [expandRisk, setExpandRisk] = useState(false)
  const [showOutbreakMap, setShowOutbreakMap] = useState(false)
  const [sprayTimeSlot, setSprayTimeSlot] = useState<'morning' | 'noon' | 'evening'>('evening')
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({})
  const [activeStoryStep, setActiveStoryStep] = useState<number>(1)

  const [backendStatus, setBackendStatus] = useState<{
    nodeBackend: { status: string; latencyMs: number }
    chatbotAi: { status: string; latencyMs: number }
  } | null>(null)

  const currentCrop = CROPS[selectedCropKey]

  const isHindi = locale === 'hi'
  const isMarathi = locale === 'mr'

  const handleDetectLocation = async () => {
    setLocating(true)
    try {
      const res = await detectLiveLocation()
      setFarmer((prev) => ({
        ...prev,
        location: res.locationName,
        latitude: res.latitude,
        longitude: res.longitude,
      }))
      toast(`Live GPS detected: ${res.locationName}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to retrieve live location'
      toast(msg)
    } finally {
      setLocating(false)
    }
  }

  useEffect(() => {
    fetch('/api/backend-status')
      .then((res) => res.json())
      .then((data) => setBackendStatus(data))
      .catch(() => setBackendStatus(null))
  }, [])

  const isConnected = backendStatus?.nodeBackend?.status === 'connected'

  const toggleTask = (taskName: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskName]: !prev[taskName],
    }))
  }

  const completedCount = currentCrop.todo.filter((item) => completedTasks[item]).length
  const totalTasks = currentCrop.todo.length
  const progressPercent = Math.round((completedCount / totalTasks) * 100)

  return (
    <div className="animate-fadeIn space-y-5" style={{ paddingBottom: 40 }}>
      {/* 1. Header Command Card with Live Field Telemetry */}
      <header
        className="fd-hero-header"
        style={{
          background: 'linear-gradient(135deg, #1b4d2e 0%, #153e24 60%, #0d2817 100%)',
          borderRadius: 24,
          padding: '24px 28px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 36px rgba(21, 62, 36, 0.22)',
          border: '1px solid rgba(232, 200, 104, 0.2)',
        }}
      >
        {/* Ambient Top Glow */}
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(232, 200, 104, 0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            {/* Top Tag Strip */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              <span
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  color: '#e8c868',
                  border: '1px solid rgba(232, 200, 104, 0.35)',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  letterSpacing: '0.02em',
                }}
              >
                <Sprout size={13} style={{ color: '#e8c868' }} />
                {farmer.farmName}
              </span>

              <span
                style={{
                  background: 'rgba(46, 204, 113, 0.15)',
                  color: '#6ee7b7',
                  border: '1px solid rgba(46, 204, 113, 0.35)',
                  fontSize: 11,
                  fontWeight: 750,
                  padding: '3px 10px',
                  borderRadius: 999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <span className="pulse-beacon" style={{ background: '#34d399', width: 6, height: 6 }} />
                {t('liveFieldMonitoring')}
              </span>

              <span
                style={{
                  background: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: isConnected ? '#6ee7b7' : '#fde68a',
                  border: isConnected ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <Radio size={12} style={{ color: isConnected ? '#34d399' : '#f59e0b' }} />
                {isConnected
                  ? `AI Online (${backendStatus?.nodeBackend?.latencyMs || 42}ms)`
                  : 'Standalone Diagnostic Mode'}
              </span>
            </div>

            {/* Greeting Headline */}
            <h1 style={{ margin: '4px 0 6px', fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              {t('namaste', { name: farmer.firstName })}
            </h1>
            <p style={{ margin: 0, fontSize: 13.5, color: 'rgba(255,255,255,0.8)', maxWidth: 540, lineHeight: 1.5 }}>
              {t('keepHealthy')}
            </p>

            {/* Location & GPS Action Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 999,
                  padding: '4px 12px',
                  fontSize: 12,
                  color: '#e5f3e8',
                }}
              >
                <MapPin size={13} style={{ color: '#34d399' }} />
                <strong>{farmer.location}</strong>
                {farmer.latitude && farmer.longitude && (
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
                    ({farmer.latitude.toFixed(2)}°N, {farmer.longitude.toFixed(2)}°E)
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={locating}
                style={{
                  background: 'linear-gradient(135deg, rgba(232, 200, 104, 0.2), rgba(232, 200, 104, 0.08))',
                  border: '1px solid rgba(232, 200, 104, 0.4)',
                  color: '#f3da89',
                  borderRadius: 999,
                  padding: '5px 14px',
                  fontSize: 11.5,
                  fontWeight: 750,
                  cursor: locating ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                }}
                title="Update to live device GPS"
              >
                {locating ? (
                  <>
                    <Loader2 size={12} className="spin" />
                    <span>Detecting GPS...</span>
                  </>
                ) : (
                  <>
                    <Navigation size={12} />
                    <span>Refresh GPS</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Weather Badge on Header */}
          <div
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 18,
              padding: '14px 18px',
              minWidth: 170,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: '#c4ddcc', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                Live Microclimate
              </span>
              <Sun size={15} style={{ color: '#e8c868' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <strong style={{ fontSize: 26, fontWeight: 800, color: '#ffffff' }}>
                {weatherFull.temperature}°C
              </strong>
              <span style={{ fontSize: 12, color: '#9bd1a8' }}>{weatherFull.condition}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11.5, color: '#d2e6d7', marginTop: 2 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <Droplets size={11} style={{ color: '#6ee7b7' }} /> {weatherFull.humidity}%
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <Wind size={11} style={{ color: '#6ee7b7' }} /> {weatherFull.wind}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Interactive Crop Switcher Bar */}
        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
            {isHindi ? 'सक्रिय खेत फसल चुनें:' : isMarathi ? 'सक्रिय पीक निवडा:' : 'Active Field Crop Profile:'}
          </span>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', flexWrap: 'nowrap', WebkitOverflowScrolling: 'touch' as any, paddingBottom: 4, scrollbarWidth: 'none' as any }}>
            {(Object.keys(CROPS) as CropKey[]).map((ck) => {
              const cp = CROPS[ck]
              const active = selectedCropKey === ck
              return (
                <button
                  key={ck}
                  type="button"
                  onClick={() => setSelectedCropKey(ck)}
                  style={{
                    background: active ? '#ffffff' : 'rgba(255,255,255,0.08)',
                    color: active ? '#1b4d2e' : '#e0ece2',
                    border: active ? '2px solid #e8c868' : '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 999,
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: active ? 800 : 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.15s ease',
                    boxShadow: active ? '0 4px 14px rgba(0,0,0,0.18)' : 'none',
                  }}
                >
                  <Sprout size={13} style={{ color: active ? '#1b4d2e' : '#a1c2a8' }} />
                  <span>{isHindi ? cp.hindiName : cp.name}</span>
                  {active && (
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1b4d2e' }} />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* ── 2. PRIMARY ACTIONS (Scan Crop & Ask Krishi AI) ── */}
      <section aria-label="Primary Actions" style={{ marginTop: 14 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 14,
          }}
        >
          {/* Primary Action 1: Scan Crop */}
          <Link
            href="/farmer/scan"
            style={{
              background: 'linear-gradient(135deg, #1b4d2e 0%, #2b7a4d 100%)',
              borderRadius: 22,
              padding: '22px 24px',
              textDecoration: 'none',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 8px 24px rgba(27, 77, 46, 0.22)',
              position: 'relative',
              overflow: 'hidden',
              minHeight: 160,
            }}
            className="hover:scale-101 transition-transform"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: 'rgba(255, 255, 255, 0.18)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Camera size={26} style={{ color: '#ffffff' }} />
              </div>
              <span
                style={{
                  background: 'rgba(232, 200, 104, 0.22)',
                  border: '1px solid rgba(232, 200, 104, 0.45)',
                  color: '#f6df94',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 999,
                }}
              >
                98.4% AI ACCURACY
              </span>
            </div>
            <div>
              <strong style={{ fontSize: 20, color: '#ffffff', display: 'block', fontWeight: 800 }}>
                {t('scanCrop')}
              </strong>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0', lineHeight: 1.4 }}>
                Instant leaf pathogen diagnosis & Grad-CAM visualizer
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f6df94', fontSize: 13, fontWeight: 750, marginTop: 14 }}>
              <span>Open Scanner & Camera</span>
              <ArrowRight size={16} />
            </div>
          </Link>

          {/* Primary Action 2: Ask Krishi AI */}
          <Link
            href="/farmer/chat"
            style={{
              background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
              borderRadius: 22,
              padding: '22px 24px',
              textDecoration: 'none',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 8px 24px rgba(180, 83, 9, 0.22)',
              position: 'relative',
              overflow: 'hidden',
              minHeight: 160,
            }}
            className="hover:scale-101 transition-transform"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: 'rgba(255, 255, 255, 0.18)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Bot size={26} style={{ color: '#ffffff' }} />
              </div>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 999,
                }}
              >
                11 LANGUAGES
              </span>
            </div>
            <div>
              <strong style={{ fontSize: 20, color: '#ffffff', display: 'block', fontWeight: 800 }}>
                {t('askAi')}
              </strong>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0', lineHeight: 1.4 }}>
                Voice & text agronomy consultation in your mother tongue
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ffffff', fontSize: 13, fontWeight: 750, marginTop: 14 }}>
              <span>Start Regional Agronomist Consultation</span>
              <ArrowRight size={16} />
            </div>
          </Link>
        </div>

        {/* Secondary Quick Utilities Toolbar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 10,
            marginTop: 10,
          }}
        >
          <button
            type="button"
            onClick={() => setSprayCalcOpen(true)}
            className="ghost"
            style={{
              background: '#ffffff',
              border: '1px solid var(--line)',
              borderRadius: 14,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12.5,
              fontWeight: 700,
              color: 'var(--ink)',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <FlaskConical size={16} className="text-emerald-700" />
            <span>{isHindi ? 'स्प्रे खुराक कैलकुलेटर' : 'Spray Calculator'}</span>
          </button>

          <button
            type="button"
            onClick={() => setTourOpen(true)}
            className="ghost"
            style={{
              background: '#ffffff',
              border: '1px solid var(--line)',
              borderRadius: 14,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12.5,
              fontWeight: 700,
              color: 'var(--ink)',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <Video size={16} className="text-violet-700" />
            <span>{isHindi ? 'डेमो वीडियो गाइड' : 'Demo Video Guide'}</span>
          </button>

          <Link
            href="/farmer/crop-health-passport"
            className="ghost"
            style={{
              background: '#ffffff',
              border: '1px solid var(--line)',
              borderRadius: 14,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12.5,
              fontWeight: 700,
              color: 'var(--ink)',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <ShieldCheck size={16} className="text-amber-700" />
            <span>{isHindi ? 'फसल हेल्थ पासपोर्ट' : 'Crop Health Passport'}</span>
          </Link>

          <Link
            href="/farmer/help"
            className="ghost"
            style={{
              background: '#ffffff',
              border: '1px solid var(--line)',
              borderRadius: 14,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12.5,
              fontWeight: 700,
              color: 'var(--ink)',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <MapPin size={16} className="text-sky-700" />
            <span>{isHindi ? 'नजदीकी कृषि केंद्र (KVK)' : 'Nearby KVK & Stores'}</span>
          </Link>
        </div>
      </section>

      {/* ── 3. CURRENT CROP-HEALTH SUMMARY ── */}

      {/* 6. Dynamic Stats Cards with Interactive Drill-Down */}
      <div className="stats">
        {/* Health Card */}
        <section
          className="card"
          style={{ cursor: 'pointer', transition: 'all 0.18s ease' }}
          onClick={() => setExpandHealth((p) => !p)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="kicker" style={{ margin: 0 }}>{t('cropHealth')} · {currentCrop.name}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#3d7a4a', fontSize: 11, fontWeight: 700 }}>
              <TrendingUp size={14} />
              <span>{currentCrop.healthDelta}</span>
            </div>
          </div>

          <div className="big" style={{ margin: '8px 0 4px' }}>
            <CountUp value={currentCrop.health} /> / 100
          </div>

          {/* Animated Health Progress Bar */}
          <div style={{ height: 7, width: '100%', background: '#e8efe4', borderRadius: 99, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${currentCrop.health}%`,
                background: currentCrop.health > 85 ? 'linear-gradient(90deg, #2b7a4d, #10b981)' : 'linear-gradient(90deg, #f59e0b, #ef4444)',
                borderRadius: 99,
                transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>
              {currentCrop.health > 85 ? 'Vigorous Canopy Health' : 'Foliar Stress Detected'}
            </span>
            <span style={{ fontSize: 11, color: '#2b7a4d', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
              {expandHealth ? 'Hide' : 'Details'} {expandHealth ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </span>
          </div>

          {/* Expandable Health Drill-Down Sub-Metrics */}
          {expandHealth && (
            <div
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: '1px solid var(--line)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                animation: 'slideDown 0.2s ease both',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 650 }}>
                  <span style={{ color: 'var(--muted)' }}>Foliage Vigour Index</span>
                  <strong style={{ color: '#1b4d2e' }}>{currentCrop.foliageVigour}%</strong>
                </div>
                <div style={{ height: 4, width: '100%', background: '#e8efe4', borderRadius: 99, marginTop: 3 }}>
                  <div style={{ height: '100%', width: `${currentCrop.foliageVigour}%`, background: '#2b7a4d', borderRadius: 99 }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 650 }}>
                  <span style={{ color: 'var(--muted)' }}>Root Zone Hydration</span>
                  <strong style={{ color: '#0284c7' }}>{currentCrop.soilMoisture}%</strong>
                </div>
                <div style={{ height: 4, width: '100%', background: '#e8efe4', borderRadius: 99, marginTop: 3 }}>
                  <div style={{ height: '100%', width: `${currentCrop.soilMoisture}%`, background: '#0284c7', borderRadius: 99 }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 650 }}>
                  <span style={{ color: 'var(--muted)' }}>Chlorophyll SPAD Rating</span>
                  <strong style={{ color: '#16a34a' }}>{currentCrop.chlorophyllIndex} SPAD</strong>
                </div>
                <div style={{ height: 4, width: '100%', background: '#e8efe4', borderRadius: 99, marginTop: 3 }}>
                  <div style={{ height: '100%', width: `${currentCrop.chlorophyllIndex}%`, background: '#16a34a', borderRadius: 99 }} />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Risk Card */}
        <section
          className="card"
          style={{ cursor: 'pointer', transition: 'all 0.18s ease' }}
          onClick={() => setExpandRisk((p) => !p)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="kicker" style={{ margin: 0 }}>{t('diseaseRisk')}</p>
            <ShieldAlert
              size={15}
              style={{
                color: currentCrop.risk === 'High' ? '#dc2626' : currentCrop.risk === 'Medium' ? '#d97706' : '#16a34a',
              }}
            />
          </div>

          <div className="big" style={{ fontSize: 26, margin: '8px 0 4px', color: currentCrop.risk === 'High' ? '#dc2626' : currentCrop.risk === 'Medium' ? '#b45309' : '#15803d' }}>
            {currentCrop.risk.toUpperCase()} ({currentCrop.riskScore}%)
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              className="chip"
              style={{
                fontSize: 11,
                background: currentCrop.risk === 'High' ? '#fee2e2' : currentCrop.risk === 'Medium' ? '#fef3c7' : '#dcfce7',
                color: currentCrop.risk === 'High' ? '#991b1b' : currentCrop.risk === 'Medium' ? '#92400e' : '#166534',
                border: `1px solid ${currentCrop.risk === 'High' ? '#fca5a5' : currentCrop.risk === 'Medium' ? '#fcd34d' : '#86efac'}`,
              }}
            >
              <span
                className="pulse-beacon"
                style={{
                  background: currentCrop.risk === 'High' ? '#ef4444' : currentCrop.risk === 'Medium' ? '#f59e0b' : '#22c55e',
                  marginRight: 4,
                }}
              />
              {currentCrop.primaryThreat.split('(')[0]}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>
              {currentCrop.risk === 'High' ? 'Action required today' : 'Monitored continuously'}
            </span>
            <span style={{ fontSize: 11, color: '#b45309', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
              {expandRisk ? 'Hide' : 'Action'} {expandRisk ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </span>
          </div>

          {/* Expandable Threat Intelligence Panel */}
          {expandRisk && (
            <div
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: '1px solid var(--line)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                animation: 'slideDown 0.2s ease both',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ background: '#fef3c7', padding: '8px 10px', borderRadius: 8, fontSize: 11, color: '#92400e', lineHeight: 1.4 }}>
                <strong>Pathogen vector:</strong> {currentCrop.pathogen}
              </div>
              <div style={{ fontSize: 11, color: '#1b4d2e', fontWeight: 650 }}>
                <strong>Recommended Spray:</strong> {currentCrop.recommendedChemical}
              </div>
              <button
                type="button"
                onClick={() => setSprayCalcOpen(true)}
                style={{
                  background: '#2b7a4d',
                  color: '#ffffff',
                  border: 0,
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  marginTop: 2,
                }}
              >
                <FlaskConical size={12} />
                <span>Calculate Exact Dose For Plot</span>
              </button>
            </div>
          )}
        </section>

        {/* Microclimate Card */}
        <section className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="kicker" style={{ margin: 0 }}>{t('weather')} Telemetry</p>
            <Sun size={15} style={{ color: '#d97706' }} />
          </div>

          <div className="big" style={{ margin: '8px 0 4px' }}>
            {weatherFull.temperature}°C
          </div>

          <p className="muted" style={{ display: 'flex', alignItems: 'center', gap: 5, margin: 0, fontSize: 12 }}>
            <Droplets size={13} style={{ color: '#0284c7' }} />
            <span>{weatherFull.humidity}% {t('humidity')}</span>
            <span style={{ color: 'var(--line)' }}>•</span>
            <Wind size={13} style={{ color: '#16a34a' }} />
            <span>{weatherFull.wind}</span>
          </p>

          <div
            style={{
              marginTop: 10,
              padding: '6px 10px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 8,
              fontSize: 11,
              color: '#166534',
              fontWeight: 650,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Clock size={12} style={{ color: '#15803d' }} />
            <span>Safe Spray Window: 4:30 – 7:00 PM today</span>
          </div>
        </section>
      </div>

      {/* 7. Interactive Daily Farm Action Checklist */}
      <section
        style={{
          background: '#ffffff',
          borderRadius: 20,
          border: '1.5px solid var(--line)',
          padding: '20px 24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 750 }}>
                DAILY AGRO-TASKS
              </span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                {currentCrop.name} ({currentCrop.acreage})
              </span>
            </div>
            <h3 style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>
              {isHindi ? 'आज के प्राथमिक कृषि कार्य' : 'Priority Field Action Items'}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 750, color: progressPercent === 100 ? '#16a34a' : 'var(--muted)' }}>
              {completedCount} of {totalTasks} Completed ({progressPercent}%)
            </span>
            <div style={{ width: 80, height: 8, background: '#e8efe4', borderRadius: 99, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: progressPercent === 100 ? '#16a34a' : '#2b7a4d',
                  borderRadius: 99,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {currentCrop.todo.map((item, idx) => {
            const done = !!completedTasks[item]
            return (
              <div
                key={item}
                onClick={() => toggleTask(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 14,
                  border: done ? '1px solid #bbf7d0' : '1px solid var(--line)',
                  background: done ? '#f0fdf4' : '#faf9f5',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    border: done ? '2px solid #16a34a' : '2px solid #a3b8aa',
                    background: done ? '#16a34a' : '#ffffff',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {done && <Check size={14} strokeWidth={3} />}
                </div>

                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      fontSize: 13.5,
                      fontWeight: 650,
                      color: done ? '#166534' : 'var(--ink)',
                      textDecoration: done ? 'line-through' : 'none',
                    }}
                  >
                    {item}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 99,
                    background: done ? '#dcfce7' : '#f3f4f6',
                    color: done ? '#166534' : '#6b7280',
                  }}
                >
                  {done ? 'DONE' : `TASK ${idx + 1}`}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* 8. Simple & Intuitive Safe Spray Window Checker */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1b4d2e, #143b23)',
          borderRadius: 22,
          padding: '22px 24px',
          color: '#ffffff',
          boxShadow: '0 8px 30px rgba(27,77,46,0.18)',
        }}
      >
        {/* Header with Title & Simple Time Switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
              <Sparkles size={15} style={{ color: '#e8c868' }} />
              <span style={{ fontSize: 11.5, fontWeight: 800, color: '#e8c868', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isHindi ? 'दवा छिड़काव समय सलाहकार' : 'Spray Timing Advisor'}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#ffffff' }}>
              {isHindi ? 'क्या आज फसल पर दवा छिड़क सकते हैं?' : 'Can I Spray Crop Medicine Today?'}
            </h3>
          </div>

          {/* Simple 3 Time Buttons */}
          <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.12)', padding: 4, borderRadius: 12, overflowX: 'auto', flexShrink: 0, scrollbarWidth: 'none' as any }}>
            {[
              { id: 'morning', label: isHindi ? 'सुबह (7-9 AM)' : 'Morning' },
              { id: 'noon', label: isHindi ? 'दोपहर (12-3 PM)' : 'Afternoon' },
              { id: 'evening', label: isHindi ? 'शाम (4-7 PM) ★' : 'Evening ★' },
            ].map((slot) => {
              const active = sprayTimeSlot === slot.id
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSprayTimeSlot(slot.id as any)}
                  style={{
                    background: active ? '#ffffff' : 'transparent',
                    color: active ? '#1b4d2e' : 'rgba(255,255,255,0.9)',
                    border: 0,
                    borderRadius: 9,
                    padding: '7px 14px',
                    fontSize: 12,
                    fontWeight: active ? 800 : 600,
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                >
                  {slot.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Big, Clear Yes/No Verdict Banner */}
        <div
          style={{
            background:
              sprayTimeSlot === 'evening'
                ? 'rgba(16, 185, 129, 0.2)'
                : sprayTimeSlot === 'morning'
                ? 'rgba(245, 158, 11, 0.2)'
                : 'rgba(239, 68, 68, 0.2)',
            border: `1.5px solid ${
              sprayTimeSlot === 'evening'
                ? 'rgba(16, 185, 129, 0.5)'
                : sprayTimeSlot === 'morning'
                ? 'rgba(245, 158, 11, 0.5)'
                : 'rgba(239, 68, 68, 0.5)'
            }`,
            borderRadius: 16,
            padding: '14px 18px',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background:
                  sprayTimeSlot === 'evening' ? '#10b981' : sprayTimeSlot === 'morning' ? '#f59e0b' : '#ef4444',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              {sprayTimeSlot === 'evening' ? <Check size={20} strokeWidth={3} /> : <AlertTriangle size={18} />}
            </div>
            <div>
              <strong style={{ fontSize: 16, display: 'block', color: '#ffffff' }}>
                {sprayTimeSlot === 'evening'
                  ? (isHindi ? '🟢 सुरक्षित समय: अभी छिड़काव कर सकते हैं' : '🟢 SAFE TO SPRAY NOW')
                  : sprayTimeSlot === 'morning'
                  ? (isHindi ? '🟡 सावधानी: पत्तों पर ओस सूखने के बाद करें' : '🟡 CAUTION: WAIT FOR DEW TO DRY')
                  : (isHindi ? '🔴 अभी छिड़काव न करें (तेज धूप व हवा)' : '🔴 DO NOT SPRAY AT NOON')}
              </strong>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
                {sprayTimeSlot === 'evening'
                  ? (isHindi ? 'हवा धीमी है और बारिश की कोई संभावना नहीं है।' : 'Winds are gentle and no rain expected for next 6 hours.')
                  : sprayTimeSlot === 'morning'
                  ? (isHindi ? 'सुबह की ओस से दवा बह सकती है। 9 बजे तक रुकें।' : 'Morning dew can dilute and wash off your medicine.')
                  : (isHindi ? 'तेज धूप से दवा उड़ जाएगी और पत्ते झुलस सकते हैं।' : 'High sun heat evaporates medicine quickly and may scorch leaves.')}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSprayCalcOpen(true)}
            style={{
              background: '#e8c868',
              color: '#1b4d2e',
              border: 0,
              borderRadius: 10,
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <FlaskConical size={14} />
            <span>{isHindi ? 'टंकी की सही खुराक निकालें →' : 'Calculate Tank Dose →'}</span>
          </button>
        </div>

        {/* 3 Simple Weather Factor Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {/* Wind */}
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center', color: '#6ee7b7' }}>
              <Wind size={18} />
            </div>
            <div>
              <small style={{ fontSize: 11, color: '#c4e3cc', display: 'block' }}>
                {isHindi ? 'हवा की गति' : 'Wind Speed'}
              </small>
              <strong style={{ fontSize: 13.5, color: '#ffffff' }}>
                {sprayTimeSlot === 'evening' ? '7 km/h • ✅ Safe' : sprayTimeSlot === 'morning' ? '12 km/h • ⚠️ Moderate' : '18 km/h • ❌ Too Windy'}
              </strong>
            </div>
          </div>

          {/* Rain */}
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center', color: '#6ee7b7' }}>
              <Droplets size={18} />
            </div>
            <div>
              <small style={{ fontSize: 11, color: '#c4e3cc', display: 'block' }}>
                {isHindi ? 'बारिश की संभावना' : 'Rain Chance'}
              </small>
              <strong style={{ fontSize: 13.5, color: '#ffffff' }}>
                {sprayTimeSlot === 'evening' ? '0% • ✅ No Rain' : sprayTimeSlot === 'morning' ? '10% • ⚠️ Dew Present' : '5% • ✅ No Rain'}
              </strong>
            </div>
          </div>

          {/* Sun / Heat */}
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center', color: '#fde047' }}>
              <Sun size={18} />
            </div>
            <div>
              <small style={{ fontSize: 11, color: '#c4e3cc', display: 'block' }}>
                {isHindi ? 'तापमान व धूप' : 'Sun & Heat'}
              </small>
              <strong style={{ fontSize: 13.5, color: '#ffffff' }}>
                {sprayTimeSlot === 'evening' ? '25°C • ✅ Mild Cool' : sprayTimeSlot === 'morning' ? '22°C • ✅ Cool' : '32°C • ❌ Too Hot'}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Recent Scans & Verified Advisory Feed */}
      <div className="feed">
        <section className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p className="kicker" style={{ margin: 0 }}>{t('recentAlert')}</p>
            <span style={{ fontSize: 10, color: 'var(--muted)', background: '#f4efe4', padding: '2px 6px', borderRadius: 6 }}>
              {t('twoHoursAgo')}
            </span>
          </div>
          <h2 style={{ margin: '8px 0 4px', fontSize: 18 }}>{alerts[0].title}</h2>
          <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>{alerts[0].detail}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 12, color: '#1b4d2e', fontWeight: 650 }}>
            <CheckCircle2 size={15} style={{ color: '#2b7a4d' }} />
            <span>{t('recommendedNeemOil')}</span>
          </div>
        </section>

        <section className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p className="kicker" style={{ margin: 0 }}>{t('recentScan')}</p>
            <span className="chip low" style={{ fontSize: 10, padding: '2px 6px' }}>
              {t('verified')}
            </span>
          </div>
          <h2 style={{ margin: '8px 0 4px', fontSize: 18 }}>
            {latest.crop} · {latest.disease}
          </h2>
          <p className="muted" style={{ margin: 0, fontSize: 13 }}>
            {latest.date} · {latest.confidence}% {t('confidence')}
          </p>
          <Link className="ghost" href={`/farmer/history/${latest.id}`} style={{ marginTop: 10, transition: 'all 160ms ease' }}>
            <span>{t('viewResult')}</span>
            <ArrowRight size={14} />
          </Link>
        </section>
      </div>

      {/* 10. 7-Day Crop Health & Disease Risk Graph */}
      <section style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <p className="kicker" style={{ margin: 0 }}>Field Telemetry Analytics</p>
            <h2 style={{ margin: '2px 0 0', fontSize: 20 }}>Crop Health & Risk Progression</h2>
          </div>
          <span style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--card)', padding: '4px 10px', borderRadius: 999, border: '1px solid var(--line)' }}>
            Sensor Array & Satellite Normalized Vegetation Index
          </span>
        </div>
        <CropHealthChart />
      </section>

      {/* 11. Full Weather & Microclimate Forecast Section */}
      <section style={{ marginTop: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <p className="kicker" style={{ margin: 0 }}>{t('fieldMicroclimate')}</p>
            <h2 style={{ margin: '2px 0 0', fontSize: 20 }}>{t('cropInsights')}</h2>
          </div>
          <span style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--card)', padding: '4px 10px', borderRadius: 999, border: '1px solid var(--line)' }}>
            {t('weatherDemoNote')}
          </span>
        </div>

        {/* Hero Weather Card */}
        <div className="weather-hero">
          <div className="weather-hero-top">
            <div>
              <p className="kicker" style={{ color: '#e8c868', margin: '0 0 6px' }}>{t('currentWeather')} · {weatherFull.location}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span className="weather-temp-main">{weatherFull.temperature}°C</span>
                <span style={{ fontSize: 16, color: '#e0ecd9', fontWeight: 600 }}>{weatherFull.condition}</span>
              </div>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: '#b9d2b4' }}>
                {t('feelsLike')} {weatherFull.feelsLike}°C · {t('optimalSprayingWindowToday')}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="chip" style={{ background: 'rgba(232,200,104,0.2)', color: '#f0d57e', border: '1px solid rgba(232,200,104,0.4)', fontSize: 11 }}>
                {t('favorableForSpraying')}
              </span>
            </div>
          </div>

          <div className="weather-grid-metrics">
            <div className="weather-metric-box">
              <small>{t('humidity')}</small>
              <strong>{weatherFull.humidity}%</strong>
            </div>
            <div className="weather-metric-box">
              <small>{t('rainChance')}</small>
              <strong>{weatherFull.rainProbability}%</strong>
            </div>
            <div className="weather-metric-box">
              <small>{t('windSpeed')}</small>
              <strong>{weatherFull.wind}</strong>
            </div>
            <div className="weather-metric-box">
              <small>{t('uvIndex')}</small>
              <strong>{weatherFull.uvIndex} (Mod)</strong>
            </div>
          </div>
        </div>

        {/* 10-Day Forecast Horizontal Strip */}
        <div className="forecast-strip-wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: '0 2px' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--forest)' }}>{t('forecastTitle')}</span>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{t('swipeForMore')}</span>
          </div>
          <div className="forecast-strip">
            {weatherFull.forecast.map((day, idx) => (
              <div key={day.label + idx} className={`forecast-pill ${idx === 0 ? 'today' : ''}`}>
                <div className="day-lbl">{day.label}</div>
                <div className="day-icon">{day.icon}</div>
                <div className="day-temps">
                  <span>{day.high}°</span>
                  <span className="low">{day.low}°</span>
                </div>
                <div className="day-rain">
                  <Droplets size={10} />
                  <span>{day.rainProbability}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Crop Weather Insights / Advisory Cards */}
        <div className="crop-insights-grid">
          {weatherFull.insights.map((insight) => (
            <div
              key={insight.headline}
              className={`crop-insight-card ${insight.urgency === 'warning' ? 'urgent' : insight.urgency === 'caution' ? 'caution' : 'info'}`}
            >
              <div className="crop-insight-head">
                <span style={{ fontSize: 20 }}>{insight.icon}</span>
                <span
                  className="chip"
                  style={{
                    fontSize: 10,
                    padding: '2px 7px',
                    background:
                      insight.urgency === 'warning' ? '#f7dfd4' : insight.urgency === 'caution' ? '#fdf5e1' : '#dcebd8',
                    color:
                      insight.urgency === 'warning' ? '#a4462f' : insight.urgency === 'caution' ? '#8a6410' : '#347044',
                  }}
                >
                  {insight.urgency}
                </span>
              </div>
              <strong style={{ fontSize: 14, color: 'var(--ink)' }}>{insight.headline}</strong>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                {insight.advice}
              </p>
            </div>
          ))}
        </div>

        {/* Nearby Agricultural Help & KVK Quick Assist */}
        <div
          style={{
            marginTop: 16,
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
            border: '1.5px solid #a7f3d0',
            borderRadius: 18,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#10b981',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <MapPin size={22} />
            </div>
            <div>
              <strong style={{ fontSize: 15, color: '#065f46', display: 'block' }}>
                {isHindi ? 'नजदीकी कृषि विज्ञान केंद्र (KVK) व सेवा केंद्र' : 'Nearby KVK & Agricultural Support'}
              </strong>
              <span style={{ fontSize: 12.5, color: '#047857' }}>
                {isHindi
                  ? '3 प्रमाणित केंद्र आपके 10 किमी दायरे में उपलब्ध हैं - बीज, खाद व विशेषज्ञ सलाह।'
                  : '3 verified KVK & Krishi Seva Kendras within 10 km for soil tests and certified fungicides.'}
              </span>
            </div>
          </div>
          <Link
            href="/farmer/help"
            style={{
              background: '#059669',
              color: '#ffffff',
              borderRadius: 10,
              padding: '8px 16px',
              fontSize: 12.5,
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>{isHindi ? 'केंद्र सूची व दिशा देखें' : 'View Centers & Directions'}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* 12. Weather & Outbreak Risk Fusion Telemetry */}
      <WeatherRiskWidget />

      {/* ── 7. SECONDARY INFORMATION (Maps & Guides with Progressive Disclosure) ── */}
      {/* Geospatial Outbreak Clusters & Hotspots Map with Progressive Disclosure */}
      <section
        id="outbreak-map-section"
        style={{
          marginTop: 18,
          background: '#ffffff',
          borderRadius: 20,
          border: '1.5px solid var(--line)',
          padding: '18px 22px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Radio size={14} className="text-emerald-700 animate-pulse" />
              <span style={{ fontSize: 11, fontWeight: 750, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Regional Surveillance
              </span>
            </div>
            <h3 style={{ margin: '2px 0 0', fontSize: 17, fontWeight: 800, color: 'var(--ink)' }}>
              Geospatial Outbreak Clusters & Hotspots Map
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted)' }}>
              Live ICAR and village-level disease density clustering across your district.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowOutbreakMap((prev) => !prev)}
            aria-expanded={showOutbreakMap}
            aria-controls="outbreak-map-wrapper"
            style={{
              background: showOutbreakMap ? '#f3f4f6' : '#1b4d2e',
              color: showOutbreakMap ? 'var(--ink)' : '#ffffff',
              border: showOutbreakMap ? '1px solid var(--line)' : 0,
              borderRadius: 10,
              padding: '8px 16px',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            <span>{showOutbreakMap ? 'Collapse Map' : 'Explore Interactive Map'}</span>
            {showOutbreakMap ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {showOutbreakMap ? (
          <div id="outbreak-map-wrapper" style={{ marginTop: 16 }}>
            <OutbreakMap />
          </div>
        ) : (
          <div
            onClick={() => setShowOutbreakMap(true)}
            style={{
              marginTop: 12,
              padding: '16px',
              background: '#faf9f5',
              borderRadius: 14,
              border: '1px dashed var(--line)',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
              Map collapsed to save data and keep page light. Click to view 4 active village hotspots.
            </span>
          </div>
        )}
      </section>

      {/* 14. Interactive 5-Step Story Pipeline (Krishi Darpan Workflow) */}
      <section
        style={{
          marginTop: 24,
          background: 'linear-gradient(135deg, #ffffff, #f7faf7)',
          borderRadius: 20,
          border: '1.5px solid var(--line)',
          padding: '20px 24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 750, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Architecture Workflow
          </span>
          <h3 style={{ margin: '2px 0 0', fontSize: 17, fontWeight: 800, color: 'var(--ink)' }}>
            How Krishi Darpan Protects Your Harvest
          </h3>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 8,
            marginBottom: 16,
          }}
        >
          {[
            { step: 1, Icon: Search, label: t('storyDetect'), desc: 'Snap photo via camera or WhatsApp' },
            { step: 2, Icon: Brain, label: t('storyUnderstand'), desc: 'Vision AI + Grad-CAM neural diagnosis' },
            { step: 3, Icon: ShieldCheck, label: t('storyPrevent'), desc: 'ICAR precision fungicide & organic dosage' },
            { step: 4, Icon: MapPin, label: t('storyHelp'), desc: 'Nearest KVK agronomist ground support' },
            { step: 5, Icon: TrendingUp, label: t('storyTrack'), desc: 'Continuous field recovery telemetry' },
          ].map((item) => {
            const active = activeStoryStep === item.step
            return (
              <button
                key={item.step}
                type="button"
                onClick={() => setActiveStoryStep(item.step)}
                style={{
                  background: active ? '#1b4d2e' : '#ffffff',
                  color: active ? '#ffffff' : 'var(--ink)',
                  border: active ? '1.5px solid #1b4d2e' : '1px solid var(--line)',
                  borderRadius: 14,
                  padding: '12px 10px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: active ? '0 6px 18px rgba(27,77,46,0.2)' : 'none',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: active ? 'rgba(255,255,255,0.2)' : '#e8f7ec',
                    color: active ? '#ffffff' : '#1b4d2e',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <item.Icon size={16} />
                </div>
                <strong style={{ fontSize: 12 }}>
                  {item.step}. {item.label}
                </strong>
                <span style={{ fontSize: 10, color: active ? '#c4e3cc' : 'var(--muted)', lineHeight: 1.3 }}>
                  {item.desc}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Multi-Voice Interactive Demo Video Modal */}
      <FarmerTourVideoModal isOpen={tourOpen} onClose={() => setTourOpen(false)} />

      {/* ICAR Spray Calculator Modal */}
      <SprayCalculatorModal
        isOpen={sprayCalcOpen}
        onClose={() => setSprayCalcOpen(false)}
        initialCrop={currentCrop.name}
      />
    </div>
  )
}
