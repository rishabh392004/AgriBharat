'use client'

import { useState } from 'react'
import {
  TrendingUp,
  Activity,
  Droplets,
  Sun,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface DataPoint {
  day: string
  date: string
  health: number
  risk: number
  humidity: number
  temp: number
  advisory: string
}

const SEVEN_DAYS_DATA: DataPoint[] = [
  { day: 'Wed', date: '03 Sep', health: 78, risk: 62, humidity: 88, temp: 24, advisory: 'High humidity; watch for fungal spores.' },
  { day: 'Thu', date: '04 Sep', health: 80, risk: 55, humidity: 84, temp: 25, advisory: 'Moderate risk; preventive neem spray suggested.' },
  { day: 'Fri', date: '05 Sep', health: 83, risk: 48, humidity: 79, temp: 26, advisory: 'Weather clearing; optimal spraying window.' },
  { day: 'Sat', date: '06 Sep', health: 86, risk: 36, humidity: 73, temp: 27, advisory: 'Good sunshine; foliar health improving.' },
  { day: 'Sun', date: '07 Sep', health: 88, risk: 28, humidity: 68, temp: 28, advisory: 'Favorable crop canopy; minimal pathogen spread.' },
  { day: 'Mon', date: '08 Sep', health: 91, risk: 22, humidity: 65, temp: 27, advisory: 'Safe monitoring threshold; vigorous growth.' },
  { day: 'Today', date: '09 Sep', health: 94, risk: 16, humidity: 62, temp: 26, advisory: 'Peak health status; low disease pressure.' },
]

export function CropHealthChart() {
  const { locale } = useI18n()
  const [activeMetric, setActiveMetric] = useState<'both' | 'health' | 'risk'>('both')
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(6) // default today

  const isHindi = locale === 'hi'

  const points = SEVEN_DAYS_DATA
  const selectedPoint = hoveredIdx !== null ? points[hoveredIdx] : points[points.length - 1]

  // Graph coordinate calculation
  const width = 640
  const height = 220
  const paddingX = 40
  const paddingY = 30
  const graphW = width - paddingX * 2
  const graphH = height - paddingY * 2

  const getX = (idx: number) => paddingX + (idx / (points.length - 1)) * graphW
  const getY = (val: number) => paddingY + graphH - (val / 100) * graphH

  // Build SVG Paths
  const healthPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.health)}`).join(' ')
  const healthArea = `${healthPath} L ${getX(points.length - 1)} ${paddingY + graphH} L ${getX(0)} ${paddingY + graphH} Z`

  const riskPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.risk)}`).join(' ')
  const riskArea = `${riskPath} L ${getX(points.length - 1)} ${paddingY + graphH} L ${getX(0)} ${paddingY + graphH} Z`

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1.5px solid var(--line)',
        borderRadius: 20,
        padding: '22px 24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Header & Filter Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 14,
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                background: 'rgba(46, 125, 50, 0.12)',
                color: 'var(--leaf)',
                fontSize: 11,
                fontWeight: 750,
                padding: '2px 8px',
                borderRadius: 999,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Activity size={12} />
              {isHindi ? 'लाइव फील्ड एनालिटिक्स' : 'Live Field Analytics'}
            </span>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
              {isHindi ? '7-दिवसीय स्वास्थ्य एवं रोग का ग्राफ' : '7-Day Crop Health & Disease Risk Trend'}
            </span>
          </div>

          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>
            {isHindi ? 'फसल स्वास्थ्य एवं रोग जोखिम रुझान' : 'Crop Health Index vs Pathogen Pressure'}
          </h3>
        </div>

        {/* Metric Switcher */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(0,0,0,0.04)',
            padding: 3,
            borderRadius: 999,
            gap: 4,
          }}
        >
          <button
            type="button"
            onClick={() => setActiveMetric('both')}
            style={{
              background: activeMetric === 'both' ? 'var(--card)' : 'transparent',
              color: activeMetric === 'both' ? 'var(--ink)' : 'var(--muted)',
              border: 0,
              fontSize: 11,
              fontWeight: 750,
              padding: '5px 12px',
              borderRadius: 999,
              cursor: 'pointer',
              boxShadow: activeMetric === 'both' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {isHindi ? 'दोनों (All)' : 'Combined'}
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('health')}
            style={{
              background: activeMetric === 'health' ? '#10b981' : 'transparent',
              color: activeMetric === 'health' ? '#fff' : 'var(--muted)',
              border: 0,
              fontSize: 11,
              fontWeight: 750,
              padding: '5px 12px',
              borderRadius: 999,
              cursor: 'pointer',
              boxShadow: activeMetric === 'health' ? '0 2px 6px rgba(16,185,129,0.3)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            🟢 {isHindi ? 'स्वास्थ्य (Health)' : 'Health Index'}
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('risk')}
            style={{
              background: activeMetric === 'risk' ? '#ef4444' : 'transparent',
              color: activeMetric === 'risk' ? '#fff' : 'var(--muted)',
              border: 0,
              fontSize: 11,
              fontWeight: 750,
              padding: '5px 12px',
              borderRadius: 999,
              cursor: 'pointer',
              boxShadow: activeMetric === 'risk' ? '0 2px 6px rgba(239,68,68,0.3)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            🔴 {isHindi ? 'जोखिम (Risk)' : 'Disease Risk'}
          </button>
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: 240,
            overflow: 'visible',
          }}
        >
          <defs>
            {/* Health Gradient */}
            <linearGradient id="healthGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>

            {/* Risk Gradient */}
            <linearGradient id="riskGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          {[100, 75, 50, 25, 0].map((val) => (
            <g key={val}>
              <line
                x1={paddingX}
                y1={getY(val)}
                x2={width - paddingX}
                y2={getY(val)}
                stroke="var(--line)"
                strokeDasharray="4 4"
                strokeWidth="1"
                opacity="0.65"
              />
              <text
                x={paddingX - 8}
                y={getY(val) + 4}
                textAnchor="end"
                fontSize="10"
                fill="var(--muted)"
                fontWeight="600"
              >
                {val}%
              </text>
            </g>
          ))}

          {/* Health Area & Line */}
          {(activeMetric === 'both' || activeMetric === 'health') && (
            <>
              <path d={healthArea} fill="url(#healthGrad)" />
              <path
                d={healthPath}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Risk Area & Line */}
          {(activeMetric === 'both' || activeMetric === 'risk') && (
            <>
              <path d={riskArea} fill="url(#riskGrad)" />
              <path
                d={riskPath}
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeDasharray="5 5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Hover highlight line */}
          {hoveredIdx !== null && (
            <line
              x1={getX(hoveredIdx)}
              y1={paddingY}
              x2={getX(hoveredIdx)}
              y2={paddingY + graphH}
              stroke="var(--leaf)"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
          )}

          {/* Data Points */}
          {points.map((p, idx) => {
            const x = getX(idx)
            const yHealth = getY(p.health)
            const yRisk = getY(p.risk)
            const isHovered = hoveredIdx === idx

            return (
              <g key={p.day} style={{ cursor: 'pointer' }} onMouseEnter={() => setHoveredIdx(idx)}>
                {/* Transparent wider touch target */}
                <rect x={x - 18} y={paddingY} width={36} height={graphH} fill="transparent" />

                {/* Health Dot */}
                {(activeMetric === 'both' || activeMetric === 'health') && (
                  <circle
                    cx={x}
                    cy={yHealth}
                    r={isHovered ? 6 : 4}
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    style={{ transition: 'all 0.15s ease' }}
                  />
                )}

                {/* Risk Dot */}
                {(activeMetric === 'both' || activeMetric === 'risk') && (
                  <circle
                    cx={x}
                    cy={yRisk}
                    r={isHovered ? 5.5 : 3.5}
                    fill="#ef4444"
                    stroke="#ffffff"
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    style={{ transition: 'all 0.15s ease' }}
                  />
                )}

                {/* Day Label at bottom */}
                <text
                  x={x}
                  y={height - 6}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={isHovered ? 800 : 600}
                  fill={isHovered ? 'var(--leaf)' : 'var(--muted)'}
                >
                  {p.day}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Selected Day Status Card (Interactive Tooltip Bar) */}
      <div
        style={{
          marginTop: 14,
          background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.06), rgba(232, 200, 104, 0.08))',
          border: '1px solid rgba(46, 125, 50, 0.2)',
          borderRadius: 14,
          padding: '12px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#10b981',
              color: 'white',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            {selectedPoint.health}%
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>
              {selectedPoint.day} ({selectedPoint.date}) • {selectedPoint.temp}°C
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              {selectedPoint.advisory}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
            <span style={{ fontWeight: 700, color: '#065f46' }}>
              {isHindi ? 'स्वास्थ्य:' : 'Health:'} {selectedPoint.health}%
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
            <span style={{ fontWeight: 700, color: '#991b1b' }}>
              {isHindi ? 'रोग जोखिम:' : 'Fungal Risk:'} {selectedPoint.risk}%
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--muted)' }}>
            <Droplets size={13} className="text-sky-500" />
            <span>{selectedPoint.humidity}% Hum.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
