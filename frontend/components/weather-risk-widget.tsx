'use client'

import React, { useState } from 'react'
import {
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  AlertTriangle,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface WeatherRiskWidgetProps {
  className?: string
}

export const WeatherRiskWidget: React.FC<WeatherRiskWidgetProps> = ({ className = '' }) => {
  const { t } = useI18n()
  const [activeStation, setActiveStation] = useState<'Baramati' | 'Nashik' | 'Ludhiana'>('Baramati')

  const stationData = {
    Baramati: {
      location: 'Baramati Agro-Met Station, Pune (MH)',
      cropFocus: 'Tomato & Pomegranate',
      tempC: 29.4,
      feelsLike: 32,
      humidity: 78,
      windKmh: 14,
      rainChance: 60,
      riskLevel: 'Moderate' as const,
      riskBg: '#fef3c7',
      riskColor: '#92400e',
      riskBorder: '#fde68a',
      advisoryNote:
        'High morning humidity (78%) with warm daytime conditions creates optimal incubation for Alternaria (Early Blight) in Tomato and Powdery Mildew in Grape.',
      forecast: [
        { day: 'Today', hi: 31, lo: 22, rain: 60, icon: '🌦️', risk: 'Moderate' },
        { day: 'Tomorrow', hi: 30, lo: 21, rain: 75, icon: '🌧️', risk: 'High' },
        { day: 'Friday', hi: 28, lo: 20, rain: 40, icon: '⛅', risk: 'Moderate' },
        { day: 'Saturday', hi: 32, lo: 22, rain: 15, icon: '☀️', risk: 'Low' },
      ],
      sprayWindow: 'Recommended Spray Window: Today before 3:00 PM before precipitation',
    },
    Nashik: {
      location: 'Dindori Vineyard Weather Hub, Nashik (MH)',
      cropFocus: 'Grape & Onion',
      tempC: 27.8,
      feelsLike: 30,
      humidity: 84,
      windKmh: 11,
      rainChance: 80,
      riskLevel: 'High' as const,
      riskBg: '#fee2e2',
      riskColor: '#b91c1c',
      riskBorder: '#fecaca',
      advisoryNote:
        'Severe Downy Mildew alert. 3-10 rule reached (10mm rain, 10°C min temp, active grape shoots). Apply systemic protectant immediately.',
      forecast: [
        { day: 'Today', hi: 29, lo: 19, rain: 80, icon: '🌧️', risk: 'High' },
        { day: 'Tomorrow', hi: 27, lo: 18, rain: 85, icon: '🌧️', risk: 'High' },
        { day: 'Friday', hi: 28, lo: 19, rain: 50, icon: '🌦️', risk: 'Moderate' },
        { day: 'Saturday', hi: 30, lo: 20, rain: 20, icon: '⛅', risk: 'Moderate' },
      ],
      sprayWindow: 'Urgent: Apply contact/penetrant fungicide before nightfall',
    },
    Ludhiana: {
      location: 'PAU Agrometeorological Observatory, Ludhiana (PB)',
      cropFocus: 'Wheat & Mustard',
      tempC: 24.2,
      feelsLike: 25,
      humidity: 65,
      windKmh: 9,
      rainChance: 10,
      riskLevel: 'Low' as const,
      riskBg: '#dcfce7',
      riskColor: '#166534',
      riskBorder: '#bbf7d0',
      advisoryNote:
        'Dry, sunny conditions favorable for wheat grain development. Low fungal pressure. Continue monitoring field edges for initial Yellow Rust pustules.',
      forecast: [
        { day: 'Today', hi: 26, lo: 14, rain: 10, icon: '☀️', risk: 'Low' },
        { day: 'Tomorrow', hi: 27, lo: 15, rain: 15, icon: '☀️', risk: 'Low' },
        { day: 'Friday', hi: 28, lo: 15, rain: 10, icon: '☀️', risk: 'Low' },
        { day: 'Saturday', hi: 28, lo: 16, rain: 20, icon: '⛅', risk: 'Low' },
      ],
      sprayWindow: 'Clear window for standard nutrient foliar application',
    },
  }

  const current = stationData[activeStation]

  return (
    <div className={`card ${className}`} style={{ padding: '22px 24px', background: '#ffffff' }}>
      {/* Header & Station Selector */}
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
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#2b7a4d',
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                textTransform: 'uppercase',
                color: '#2b7a4d',
                letterSpacing: 0.5,
              }}
            >
              Real-Time Microclimate Telemetry
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>
            Weather & Outbreak Risk Fusion
          </h2>
          <p className="muted" style={{ margin: 0, fontSize: 12 }}>
            Meteorological disease incubation models synced with Stage-2 AI Diagnosis
          </p>
        </div>

        {/* Station Selector Pills */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            background: '#f4f7f2',
            padding: 4,
            borderRadius: 12,
            border: '1px solid #dbe6d7',
          }}
        >
          {(['Baramati', 'Nashik', 'Ludhiana'] as const).map((station) => (
            <button
              key={station}
              type="button"
              onClick={() => setActiveStation(station)}
              style={{
                border: 'none',
                background: activeStation === station ? '#2b7a4d' : 'transparent',
                color: activeStation === station ? '#ffffff' : '#334155',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: activeStation === station ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              {station}
            </button>
          ))}
        </div>
      </div>

      {/* Main Temperature & Risk Status Row */}
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
            <MapPin size={14} />
            <span>{current.location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
            <span style={{ fontSize: 34, fontWeight: 900, color: 'var(--ink)' }}>
              {current.tempC}°C
            </span>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>
              {t('feelsLike')} {current.feelsLike}°C • Focus: {current.cropFocus}
            </span>
          </div>
        </div>

        <div
          style={{
            padding: '8px 16px',
            borderRadius: 12,
            background: current.riskBg,
            color: current.riskColor,
            border: `1.5px solid ${current.riskBorder}`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          <AlertTriangle size={18} />
          <span>{t('diseaseRisk')}: {current.riskLevel}</span>
        </div>
      </div>

      {/* 4 Telemetry Metrics Grid */}
      <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2ebd0', borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
            <Droplets size={14} style={{ color: '#2563eb' }} />
            <span>{t('relativeHumidity')}</span>
          </div>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>
            {current.humidity}%
          </p>
          <span style={{ fontSize: 10, color: '#64748b' }}>{t('humidityDesc')}</span>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2ebd0', borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
            <CloudSun size={14} style={{ color: '#d97706' }} />
            <span>{t('precipitationChance')}</span>
          </div>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>
            {current.rainChance}%
          </p>
          <span style={{ fontSize: 10, color: '#64748b' }}>{t('precipitationDesc')}</span>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2ebd0', borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
            <Wind size={14} style={{ color: '#059669' }} />
            <span>{t('windVelocity')}</span>
          </div>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>
            {current.windKmh} km/h
          </p>
          <span style={{ fontSize: 10, color: '#64748b' }}>{t('windDesc')}</span>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2ebd0', borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
            <Clock size={14} style={{ color: '#7c3aed' }} />
            <span>{t('foliarWetness')}</span>
          </div>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>
            {current.humidity > 75 ? '5.5 hrs' : '2.1 hrs'}
          </p>
          <span style={{ fontSize: 10, color: '#64748b' }}>{t('foliarWetnessDesc')}</span>
        </div>
      </div>

      {/* Advisory & Spray Window Banner */}
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
              🎯 {current.sprayWindow}
            </p>
          </div>
        </div>
      </div>

      {/* 4-Day Forecast Strip */}
      <div style={{ borderTop: '1px solid #eef2eb', paddingTop: 14 }}>
        <p className="kicker" style={{ margin: '0 0 10px', fontSize: 11 }}>
          4-Day Outbreak Tendency Forecast
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
              <span style={{ fontSize: 24, margin: '4px 0', display: 'block' }}>
                {fc.icon}
              </span>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)', display: 'block' }}>
                {fc.hi}° / {fc.lo}°
              </span>
              <span
                style={{
                  display: 'inline-block',
                  marginTop: 4,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background:
                    fc.risk === 'High' ? '#fee2e2' : fc.risk === 'Moderate' ? '#fef3c7' : '#dcfce7',
                  color:
                    fc.risk === 'High' ? '#b91c1c' : fc.risk === 'Moderate' ? '#92400e' : '#166534',
                }}
              >
                {fc.risk} Risk
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
