'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { detectLiveLocation } from '@/lib/location'
import { fetchLiveWeather, type LiveWeatherData, type RiskLevel, type ForecastDay } from '@/services/weatherService'

// ─── Fallback (hardcoded) data shown when live API is unavailable ─────────────

interface FallbackStation {
  location: string
  cropFocus: string
  tempC: number
  feelsLike: number
  humidity: number
  windKmh: number
  rainChance: number
  riskLevel: RiskLevel
  riskBg: string
  riskColor: string
  riskBorder: string
  advisoryNote: string
  sprayWindow: string
  foliarWetnessHrs: number
  forecast: ForecastDay[]
}

const FALLBACK_STATIONS: Record<'Baramati' | 'Nashik' | 'Ludhiana', FallbackStation> = {
  Baramati: {
    location: 'Baramati Agro-Met Station, Pune (MH)',
    cropFocus: 'Tomato & Pomegranate',
    tempC: 29.4, feelsLike: 32, humidity: 78, windKmh: 14, rainChance: 60,
    riskLevel: 'Moderate', riskBg: '#fef3c7', riskColor: '#92400e', riskBorder: '#fde68a',
    foliarWetnessHrs: 4.2,
    advisoryNote: 'High morning humidity (78%) with warm daytime conditions creates optimal incubation for Alternaria (Early Blight) in Tomato and Powdery Mildew in Grape.',
    sprayWindow: '🎯 Recommended Spray Window: Today before 3:00 PM before precipitation',
    forecast: [
      { day: 'Today',     hi: 31, lo: 22, rain: 60, icon: '🌦️', risk: 'Moderate' },
      { day: 'Tomorrow',  hi: 30, lo: 21, rain: 75, icon: '🌧️', risk: 'High'     },
      { day: 'Friday',    hi: 28, lo: 20, rain: 40, icon: '⛅',  risk: 'Moderate' },
      { day: 'Saturday',  hi: 32, lo: 22, rain: 15, icon: '☀️',  risk: 'Low'      },
    ],
  },
  Nashik: {
    location: 'Dindori Vineyard Weather Hub, Nashik (MH)',
    cropFocus: 'Grape & Onion',
    tempC: 27.8, feelsLike: 30, humidity: 84, windKmh: 11, rainChance: 80,
    riskLevel: 'High', riskBg: '#fee2e2', riskColor: '#b91c1c', riskBorder: '#fecaca',
    foliarWetnessHrs: 6.8,
    advisoryNote: 'Severe Downy Mildew alert. 3-10 rule reached (10mm rain, 10°C min temp, active grape shoots). Apply systemic protectant immediately.',
    sprayWindow: '⚡ Urgent: Apply contact/penetrant fungicide before nightfall',
    forecast: [
      { day: 'Today',     hi: 29, lo: 19, rain: 80, icon: '🌧️', risk: 'High'     },
      { day: 'Tomorrow',  hi: 27, lo: 18, rain: 85, icon: '🌧️', risk: 'High'     },
      { day: 'Friday',    hi: 28, lo: 19, rain: 50, icon: '🌦️', risk: 'Moderate' },
      { day: 'Saturday',  hi: 30, lo: 20, rain: 20, icon: '⛅',  risk: 'Moderate' },
    ],
  },
  Ludhiana: {
    location: 'PAU Agrometeorological Observatory, Ludhiana (PB)',
    cropFocus: 'Wheat & Mustard',
    tempC: 24.2, feelsLike: 25, humidity: 65, windKmh: 9, rainChance: 10,
    riskLevel: 'Low', riskBg: '#dcfce7', riskColor: '#166534', riskBorder: '#bbf7d0',
    foliarWetnessHrs: 1.2,
    advisoryNote: 'Dry, sunny conditions favorable for wheat grain development. Low fungal pressure. Monitor field edges for initial Yellow Rust pustules.',
    sprayWindow: '✅ Clear window for standard nutrient foliar application',
    forecast: [
      { day: 'Today',    hi: 26, lo: 14, rain: 10, icon: '☀️', risk: 'Low' },
      { day: 'Tomorrow', hi: 27, lo: 15, rain: 15, icon: '☀️', risk: 'Low' },
      { day: 'Friday',   hi: 28, lo: 15, rain: 10, icon: '☀️', risk: 'Low' },
      { day: 'Saturday', hi: 28, lo: 16, rain: 20, icon: '⛅', risk: 'Low' },
    ],
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

interface WeatherRiskWidgetProps {
  className?: string
}

type LoadState = 'idle' | 'locating' | 'fetching' | 'done' | 'error'

export const WeatherRiskWidget: React.FC<WeatherRiskWidgetProps> = ({ className = '' }) => {
  const { t } = useI18n()

  // Live data state
  const [liveData, setLiveData]         = useState<LiveWeatherData | null>(null)
  const [loadState, setLoadState]       = useState<LoadState>('idle')
  const [loadError, setLoadError]       = useState<string | null>(null)

  // Fallback (demo) station selector — only visible when live data unavailable
  const [activeStation, setActiveStation] = useState<'Baramati' | 'Nashik' | 'Ludhiana'>('Baramati')

  // ── Live data fetch ─────────────────────────────────────────────────────────
  const loadLiveWeather = useCallback(async () => {
    setLoadState('locating')
    setLoadError(null)

    try {
      const loc = await detectLiveLocation()
      setLoadState('fetching')

      const data = await fetchLiveWeather(loc.latitude, loc.longitude, loc.locationName)

      if (data) {
        setLiveData(data)
        setLoadState('done')
      } else {
        // API key not set or request failed — silently fall back to demo data
        setLoadState('error')
        setLoadError('Live weather unavailable — showing representative demo data.')
      }
    } catch (err: any) {
      setLoadState('error')
      setLoadError(err?.message ?? 'Location access denied — showing demo data.')
    }
  }, [])

  // Auto-fetch on mount
  useEffect(() => {
    loadLiveWeather()
  }, [loadLiveWeather])

  // ── Resolve display data ────────────────────────────────────────────────────
  const isLive    = loadState === 'done' && liveData !== null
  const isFetching = loadState === 'locating' || loadState === 'fetching'

  const fallback  = FALLBACK_STATIONS[activeStation]
  const current   = isLive ? liveData! : fallback

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={`card ${className}`} style={{ padding: '22px 24px', background: '#ffffff' }}>

      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
          borderBottom: '1px solid #eef2eb',
          paddingBottom: 14,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                display: 'inline-block',
                width: 8, height: 8,
                borderRadius: '50%',
                background: isLive ? '#2b7a4d' : '#94a3b8',
                boxShadow: isLive ? '0 0 0 3px rgba(43,122,77,0.20)' : 'none',
                animation: isFetching ? 'pulse 1.5s infinite' : 'none',
              }}
            />
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: isLive ? '#2b7a4d' : '#94a3b8', letterSpacing: 0.5 }}>
              {isFetching ? 'Fetching live data…' : isLive ? 'Live Microclimate Data' : 'Demo Data (Enable Location)'}
            </span>
            {isLive && (
              <span style={{ fontSize: 10, color: '#64748b' }}>
                Updated {(liveData as LiveWeatherData).lastUpdated}
              </span>
            )}
          </div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>
            Weather & Outbreak Risk Fusion
          </h2>
          <p className="muted" style={{ margin: 0, fontSize: 12 }}>
            Meteorological disease incubation models · Stage-2 AI Diagnosis
          </p>
        </div>

        {/* Right side: Refresh button OR demo station pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Refresh live data */}
          <button
            type="button"
            onClick={loadLiveWeather}
            disabled={isFetching}
            title="Refresh live weather"
            style={{
              border: '1.5px solid #d1d5db',
              background: isFetching ? '#f1f5f9' : '#ffffff',
              borderRadius: 10,
              padding: '6px 10px',
              cursor: isFetching ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 12, fontWeight: 600, color: '#475569',
              transition: 'all 150ms ease',
            }}
          >
            <RefreshCw
              size={13}
              style={{
                animation: isFetching ? 'spin 1s linear infinite' : 'none',
                color: isFetching ? '#94a3b8' : '#2b7a4d',
              }}
            />
            {isFetching ? 'Loading…' : 'Refresh'}
          </button>

          {/* Demo station pills — only visible when live data not available */}
          {!isLive && !isFetching && (
            <div
              style={{
                display: 'flex', gap: 6,
                background: '#f4f7f2', padding: 4,
                borderRadius: 12, border: '1px solid #dbe6d7',
              }}
            >
              {(['Baramati', 'Nashik', 'Ludhiana'] as const).map((s) => (
                <button
                  key={s} type="button"
                  onClick={() => setActiveStation(s)}
                  style={{
                    border: 'none',
                    background: activeStation === s ? '#2b7a4d' : 'transparent',
                    color: activeStation === s ? '#fff' : '#334155',
                    borderRadius: 8, padding: '6px 12px',
                    fontSize: 12, fontWeight: activeStation === s ? 700 : 500,
                    cursor: 'pointer', transition: 'all 150ms ease',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Loading skeleton ── */}
      {isFetching && (
        <div
          style={{
            background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
            backgroundSize: '400% 100%',
            animation: 'shimmer 1.4s ease infinite',
            borderRadius: 16, height: 80, marginBottom: 16,
          }}
        />
      )}

      {/* ── Error notice (non-blocking) ── */}
      {loadError && !isFetching && (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#fefce8', border: '1px solid #fde68a',
            borderRadius: 8, padding: '8px 12px', marginBottom: 12,
            fontSize: 12, color: '#92400e',
          }}
        >
          <WifiOff size={13} />
          <span>{loadError}</span>
        </div>
      )}

      {/* ── Main temperature & risk row ── */}
      {!isFetching && (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
              background: 'linear-gradient(135deg, #f7faf5 0%, #edf4eb 100%)',
              padding: '16px 20px',
              borderRadius: 16,
              border: '1.5px solid #d9e8d5',
              marginBottom: 16,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 12 }}>
                {isLive ? <Wifi size={13} style={{ color: '#2b7a4d' }} /> : <MapPin size={14} />}
                <span>{current.location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
                <span style={{ fontSize: 34, fontWeight: 900, color: 'var(--ink)' }}>
                  {current.tempC}°C
                </span>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                  {t('feelsLike')} {current.feelsLike}°C
                  {!isLive && (fallback as FallbackStation).cropFocus && (
                    <span> • Focus: {(fallback as FallbackStation).cropFocus}</span>
                  )}
                </span>
              </div>
            </div>

            <div
              style={{
                padding: '8px 16px', borderRadius: 12,
                background: current.riskBg, color: current.riskColor,
                border: `1.5px solid ${current.riskBorder}`,
                display: 'flex', alignItems: 'center', gap: 8,
                fontWeight: 800, fontSize: 13,
              }}
            >
              <AlertTriangle size={18} />
              <span>{t('diseaseRisk')}: {current.riskLevel}</span>
            </div>
          </div>

          {/* ── 4 Telemetry metrics ── */}
          <div
            className="grid-2"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}
          >
            {/* Humidity */}
            <div style={{ background: '#fff', border: '1px solid #e2ebd0', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
                <Droplets size={14} style={{ color: '#2563eb' }} />
                <span>{t('relativeHumidity')}</span>
              </div>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>
                {current.humidity}%
              </p>
              <span style={{ fontSize: 10, color: '#64748b' }}>{t('humidityDesc')}</span>
            </div>

            {/* Rain chance */}
            <div style={{ background: '#fff', border: '1px solid #e2ebd0', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
                <CloudSun size={14} style={{ color: '#d97706' }} />
                <span>{t('precipitationChance')}</span>
              </div>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>
                {current.rainChance}%
              </p>
              <span style={{ fontSize: 10, color: '#64748b' }}>{t('precipitationDesc')}</span>
            </div>

            {/* Wind */}
            <div style={{ background: '#fff', border: '1px solid #e2ebd0', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
                <Wind size={14} style={{ color: '#059669' }} />
                <span>{t('windVelocity')}</span>
              </div>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>
                {current.windKmh} km/h
              </p>
              <span style={{ fontSize: 10, color: '#64748b' }}>{t('windDesc')}</span>
            </div>

            {/* Foliar wetness */}
            <div style={{ background: '#fff', border: '1px solid #e2ebd0', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
                <Clock size={14} style={{ color: '#7c3aed' }} />
                <span>{t('foliarWetness')}</span>
              </div>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>
                {isLive
                  ? `${(liveData as LiveWeatherData).foliarWetnessHrs} hrs`
                  : current.humidity > 75 ? '5.5 hrs' : '2.1 hrs'
                }
              </p>
              <span style={{ fontSize: 10, color: '#64748b' }}>{t('foliarWetnessDesc')}</span>
            </div>
          </div>

          {/* ── Advisory & spray window banner ── */}
          <div
            style={{
              background: '#f8fafc',
              borderLeft: '4px solid #2b7a4d',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <Sparkles size={18} style={{ color: '#2b7a4d', flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                  Incubation Warning: {current.advisoryNote}
                </p>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#2b7a4d' }}>
                  {current.sprayWindow}
                </p>
              </div>
            </div>
          </div>

          {/* ── 4-day forecast strip ── */}
          <div style={{ borderTop: '1px solid #eef2eb', paddingTop: 14 }}>
            <p className="kicker" style={{ margin: '0 0 10px', fontSize: 11 }}>
              {isLive ? '4-Day Live Forecast · Outbreak Tendency' : '4-Day Outbreak Tendency Forecast'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10 }}>
              {current.forecast.map((fc, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#fbfcf9',
                    border: '1px solid #e5ecd8',
                    borderRadius: 12,
                    padding: '10px 12px',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block' }}>
                    {fc.day}
                  </span>
                  <span style={{ fontSize: 24, margin: '4px 0', display: 'block' }}>{fc.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)', display: 'block' }}>
                    {fc.hi}° / {fc.lo}°
                  </span>
                  <span
                    style={{
                      display: 'inline-block', marginTop: 4,
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                      background: fc.risk === 'High' ? '#fee2e2' : fc.risk === 'Moderate' ? '#fef3c7' : '#dcfce7',
                      color:      fc.risk === 'High' ? '#b91c1c' : fc.risk === 'Moderate' ? '#92400e' : '#166534',
                    }}
                  >
                    {fc.risk} Risk
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* CSS keyframes injected once */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 100% 0 }
          100% { background-position: -100% 0 }
        }
        @keyframes spin {
          from { transform: rotate(0deg) }
          to   { transform: rotate(360deg) }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1 }
          50%       { opacity: 0.4 }
        }
      `}</style>
    </div>
  )
}
