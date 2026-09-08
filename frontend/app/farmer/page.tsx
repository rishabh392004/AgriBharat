'use client'

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
} from 'lucide-react'
import { CountUp } from '@/components/count-up'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { alerts, scans, weatherFull } from '@/data/mock'

export default function FarmerDashboard() {
  const { t } = useI18n()
  const { farmer } = useAuth()
  const latest = scans[0]

  return (
    <div className="animate-fadeIn space-y-2">
      <header className="hero">
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
          <p className="kicker" style={{ margin: 0 }}>{farmer.farmName}</p>
          <span className="chip low" style={{ fontSize: 10, padding: '2px 8px' }}>
            <span className="pulse-beacon" style={{ background: '#347044', marginRight: 5 }} />
            {t('liveFieldMonitoring')}
          </span>
        </div>
        <h1>
          {t('namaste', { name: farmer.firstName })} <span className="wave-hand">👋</span>
        </h1>
        <p className="muted">{t('keepHealthy')}</p>
        <p className="loc">📍 {farmer.location}</p>
      </header>

      {/* CTA Row with Interactive Hover Micro-Animations */}
      <div className="cta-row">
        <Link href="/farmer/scan" className="cta group">
          <Camera size={28} className="cta-icon" />
          <strong>
            <span>📷 {t('scanCrop')}</span>
            <ArrowRight size={18} style={{ opacity: 0.8 }} />
          </strong>
          <span>{t('subtitle')}</span>
        </Link>

        <Link href="/farmer/chat" className="cta alt group">
          <Bot size={28} className="cta-icon" />
          <strong>
            <span>🤖 {t('askAi')}</span>
            <ArrowRight size={18} style={{ opacity: 0.8 }} />
          </strong>
          <span>{t('chatSub')}</span>
        </Link>
      </div>

      {/* Stats Cards with Staggered Animations */}
      <div className="stats">
        <section className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="kicker">{t('cropHealth')}</p>
            <TrendingUp size={14} style={{ color: '#3d7a4a' }} />
          </div>
          <div className="big">
            <CountUp value={farmer.cropHealth} /> / 100
          </div>
          {/* Animated health progress bar */}
          <div style={{ height: 6, width: '100%', background: '#e8efe4', borderRadius: 99, marginTop: 4, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${farmer.cropHealth}%`,
                background: 'linear-gradient(90deg, #3d7a4a, #d4a017)',
                borderRadius: 99,
                transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>
          <p className="muted" style={{ fontSize: 11, marginTop: 8 }}>
            {t('optimalVegetativeState')}
          </p>
        </section>

        <section className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="kicker">{t('diseaseRisk')}</p>
            <ShieldAlert size={14} style={{ color: '#8a6410' }} />
          </div>
          <div className="big" style={{ fontSize: 28 }}>
            {t('medium')}
          </div>
          <span className="chip" style={{ marginTop: 2 }}>
            <span className="pulse-beacon" style={{ background: '#8a6410', marginRight: 5 }} />
            {t('riskLabel', { risk: farmer.diseaseRisk })}
          </span>
          <p className="muted" style={{ fontSize: 11, marginTop: 8 }}>
            {t('highHumidityDetected')}
          </p>
        </section>

        <section className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="kicker">{t('weather')}</p>
            <Sun size={14} style={{ color: '#d4a017' }} />
          </div>
          <div className="big">{weatherFull.temperature}°C</div>
          <p className="muted" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <Droplets size={12} style={{ color: '#3d7a4a' }} />
            <span>{weatherFull.humidity}% {t('humidity')}</span>
          </p>
          <p className="muted" style={{ fontSize: 11, marginTop: 6 }}>
            {t('optimalSprayWindow')}
          </p>
        </section>
      </div>

      {/* Feed Cards */}
      <div className="feed">
        <section className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p className="kicker">{t('recentAlert')}</p>
            <span style={{ fontSize: 10, color: 'var(--muted)', background: '#f4efe4', padding: '2px 6px', borderRadius: 6 }}>
              {t('twoHoursAgo')}
            </span>
          </div>
          <h2>{alerts[0].title}</h2>
          <p className="muted">{alerts[0].detail}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 12, color: 'var(--forest)', fontWeight: 650 }}>
            <CheckCircle2 size={14} style={{ color: '#3d7a4a' }} />
            <span>{t('recommendedNeemOil')}</span>
          </div>
        </section>

        <section className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p className="kicker">{t('recentScan')}</p>
            <span className="chip low" style={{ fontSize: 10, padding: '2px 6px' }}>
              {t('verified')}
            </span>
          </div>
          <h2>
            {latest.crop} · {latest.disease}
          </h2>
          <p className="muted">
            {latest.date} · {latest.confidence}% {t('confidence')}
          </p>
          <Link className="ghost" href={`/farmer/history/${latest.id}`} style={{ marginTop: 10, transition: 'all 160ms ease' }}>
            <span>{t('viewResult')}</span>
            <ArrowRight size={14} />
          </Link>
        </section>
      </div>

      {/* Full Weather & Field Advisory Section */}
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
              <strong>{weatherFull.rainfallProb}%</strong>
            </div>
            <div className="weather-metric-box">
              <small>{t('windSpeed')}</small>
              <strong>{weatherFull.windKmh} km/h</strong>
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
              className={`crop-insight-card ${insight.urgency === 'Urgent' ? 'urgent' : insight.urgency === 'Caution' ? 'caution' : 'info'}`}
            >
              <div className="crop-insight-head">
                <span style={{ fontSize: 20 }}>{insight.icon}</span>
                <span
                  className="chip"
                  style={{
                    fontSize: 10,
                    padding: '2px 7px',
                    background:
                      insight.urgency === 'Urgent' ? '#f7dfd4' : insight.urgency === 'Caution' ? '#fdf5e1' : '#dcebd8',
                    color:
                      insight.urgency === 'Urgent' ? '#a4462f' : insight.urgency === 'Caution' ? '#8a6410' : '#347044',
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
      </section>

      {/* Interactive Story Pills */}
      <div className="story" style={{ marginTop: 24 }}>
        <span>1. 🔍 {t('storyDetect')}</span>
        <span>2. 🧠 {t('storyUnderstand')}</span>
        <span>3. 🛡️ {t('storyPrevent')}</span>
        <span>4. 📍 {t('storyHelp')}</span>
        <span>5. 📈 {t('storyTrack')}</span>
      </div>
    </div>
  )
}
