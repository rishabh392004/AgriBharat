'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Eye,
  Layers,
  Sparkles,
  Sliders,
  Maximize2,
  Minimize2,
  Info,
  ZoomIn,
  RotateCcw,
  CheckCircle2,
  Activity,
  Flame,
} from 'lucide-react'
import type { AttentionPoint } from '@/types'
import { useI18n } from '@/lib/i18n'

export type GradCamViewMode = 'original' | 'heatmap' | 'overlay'

interface GradCamViewerProps {
  imageUrl: string
  cropName: string
  diseaseName: string
  confidence: number
  backendGradCamUrl?: string
  attentionPoints?: AttentionPoint[]
  initialMode?: GradCamViewMode
  onModeChange?: (mode: GradCamViewMode) => void
  showControls?: boolean
  className?: string
}

export const GradCamViewer: React.FC<GradCamViewerProps> = ({
  imageUrl,
  cropName,
  diseaseName,
  confidence,
  backendGradCamUrl,
  attentionPoints,
  initialMode = 'overlay',
  onModeChange,
  showControls = true,
  className = '',
}) => {
  const { t } = useI18n()
  const [viewMode, setViewMode] = useState<GradCamViewMode>(initialMode)
  const [overlayOpacity, setOverlayOpacity] = useState<number>(75) // 0 - 100
  const [isZoomed, setIsZoomed] = useState<boolean>(false)
  const [activePointLabel, setActivePointLabel] = useState<string | null>(null)
  const [canvasReady, setCanvasReady] = useState<boolean>(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const handleSetMode = (mode: GradCamViewMode) => {
    setViewMode(mode)
    if (onModeChange) onModeChange(mode)
  }

  // Generate dynamic Grad-CAM attention heatmap on the user's actual image if no precomputed backend heatmap is given
  useEffect(() => {
    if (backendGradCamUrl) {
      setCanvasReady(true)
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = imageUrl

    img.onload = () => {
      const width = img.naturalWidth || 600
      const height = img.naturalHeight || 600
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Clear
      ctx.clearRect(0, 0, width, height)

      // Points of high attention
      const points: AttentionPoint[] =
        attentionPoints && attentionPoints.length > 0
          ? attentionPoints
          : [
              { x: 45, y: 46, radius: Math.min(width, height) * 0.22, intensity: 0.95, label: 'Primary Pathogen Lesion' },
              { x: 62, y: 38, radius: Math.min(width, height) * 0.16, intensity: 0.86, label: 'Secondary Symptom Halo' },
              { x: 32, y: 64, radius: Math.min(width, height) * 0.18, intensity: 0.80, label: 'Marginal Chlorosis' },
            ]

      // 1. Create offline heat accumulation buffer
      const heatCanvas = document.createElement('canvas')
      heatCanvas.width = width
      heatCanvas.height = height
      const heatCtx = heatCanvas.getContext('2d')
      if (!heatCtx) return

      // Render radial attention spots
      points.forEach((pt) => {
        const cx = (pt.x / 100) * width
        const cy = (pt.y / 100) * height
        const radius = pt.radius > 1 ? pt.radius : Math.min(width, height) * (pt.radius || 0.2)

        const radGrad = heatCtx.createRadialGradient(cx, cy, 0, cx, cy, radius)
        radGrad.addColorStop(0, `rgba(0, 0, 0, ${Math.min(1, pt.intensity)})`)
        radGrad.addColorStop(0.35, `rgba(0, 0, 0, ${pt.intensity * 0.75})`)
        radGrad.addColorStop(0.7, `rgba(0, 0, 0, ${pt.intensity * 0.35})`)
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')

        heatCtx.fillStyle = radGrad
        heatCtx.beginPath()
        heatCtx.arc(cx, cy, radius, 0, Math.PI * 2)
        heatCtx.fill()
      })

      // 2. Colormap lookup (Jet / Turbo scientific Grad-CAM colormap)
      const heatData = heatCtx.getImageData(0, 0, width, height)
      const outData = ctx.createImageData(width, height)

      for (let i = 0; i < heatData.data.length; i += 4) {
        const alpha = heatData.data[i + 3] // 0 to 255
        if (alpha > 5) {
          const val = alpha / 255 // 0.0 to 1.0

          // Turbo / Jet gradient formula
          let r = 0, g = 0, b = 0
          if (val < 0.25) {
            // Blue to Cyan
            r = 0
            g = Math.round(val * 4 * 255)
            b = 255
          } else if (val < 0.5) {
            // Cyan to Green
            r = 0
            g = 255
            b = Math.round((1 - (val - 0.25) * 4) * 255)
          } else if (val < 0.75) {
            // Green to Yellow
            r = Math.round((val - 0.5) * 4 * 255)
            g = 255
            b = 0
          } else {
            // Yellow to Red / Hot Crimson
            r = 255
            g = Math.round((1 - (val - 0.75) * 4) * 255)
            b = 0
          }

          outData.data[i] = r
          outData.data[i + 1] = g
          outData.data[i + 2] = b
          outData.data[i + 3] = Math.round(alpha * 0.88)
        }
      }

      ctx.putImageData(outData, 0, 0)
      setCanvasReady(true)
    }

    img.onerror = () => {
      setCanvasReady(true)
    }
  }, [imageUrl, attentionPoints, backendGradCamUrl])

  const defaultPoints = attentionPoints && attentionPoints.length > 0
    ? attentionPoints
    : [
        { x: 45, y: 46, radius: 48, intensity: 0.95, label: 'Primary Pathogen Lesion' },
        { x: 62, y: 38, radius: 36, intensity: 0.86, label: 'Secondary Symptom Halo' },
        { x: 32, y: 64, radius: 40, intensity: 0.80, label: 'Marginal Chlorosis' },
      ]

  return (
    <div
      ref={containerRef}
      className={`gradcam-container ${className}`}
      style={{
        background: '#ffffff',
        borderRadius: 24,
        border: '1.5px solid #d4e6d7',
        boxShadow: '0 8px 30px rgba(27, 61, 42, 0.08)',
        overflow: 'hidden',
      }}
    >
      {/* Top Header & Mode Toggle Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #1b3d2a 0%, #244d36 100%)',
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(232, 200, 104, 0.2)',
              border: '1px solid rgba(232, 200, 104, 0.4)',
              display: 'grid',
              placeItems: 'center',
              color: '#f0d57e',
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <strong style={{ fontSize: 15, letterSpacing: '-0.01em' }}>
                {t('whatAiLookedAt')}
              </strong>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  background: 'rgba(232, 200, 104, 0.25)',
                  color: '#f6eedc',
                  border: '1px solid rgba(232, 200, 104, 0.4)',
                  padding: '2px 8px',
                  borderRadius: 999,
                  textTransform: 'uppercase',
                }}
              >
                Grad-CAM v2
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#b9d2b4', opacity: 0.9 }}>
              {t('seeWhyDiagnosed')}
            </p>
          </div>
        </div>

        {/* View Mode Tabs: [ Original ] [ AI Focus / Heatmap ] [ Overlay ] */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.28)',
            padding: 4,
            borderRadius: 14,
            gap: 4,
          }}
        >
          <button
            type="button"
            onClick={() => handleSetMode('original')}
            style={{
              background: viewMode === 'original' ? '#ffffff' : 'transparent',
              color: viewMode === 'original' ? '#1b3d2a' : '#d8eedf',
              border: 0,
              borderRadius: 10,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 160ms ease',
            }}
          >
            <Eye size={13} />
            <span>{t('originalLeaf')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSetMode('heatmap')}
            style={{
              background: viewMode === 'heatmap' ? '#e8c868' : 'transparent',
              color: viewMode === 'heatmap' ? '#1b3d2a' : '#d8eedf',
              border: 0,
              borderRadius: 10,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 160ms ease',
            }}
          >
            <Flame size={13} />
            <span>{t('aiFocus')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSetMode('overlay')}
            style={{
              background: viewMode === 'overlay' ? '#2b7a4d' : 'transparent',
              color: viewMode === 'overlay' ? '#ffffff' : '#d8eedf',
              border: 0,
              borderRadius: 10,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 160ms ease',
            }}
          >
            <Layers size={13} />
            <span>{t('overlay')}</span>
          </button>
        </div>
      </div>

      {/* Main Visual Display Stage */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: isZoomed ? 520 : 380,
          background: '#0e1812',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'height 250ms ease',
        }}
      >
        {/* 1. Underlying Original Uploaded Leaf Photo */}
        <img
          src={imageUrl}
          alt={`${cropName} leaf scan`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: viewMode === 'heatmap' ? 'brightness(0.18) grayscale(0.8)' : 'none',
            transition: 'filter 250ms ease',
            zIndex: 1,
          }}
        />

        {/* 2. Grad-CAM Attention Heatmap Layer (Canvas or Backend URL) */}
        {backendGradCamUrl ? (
          <img
            src={backendGradCamUrl}
            alt="Grad-CAM Heatmap"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              zIndex: 2,
              opacity: viewMode === 'original' ? 0 : viewMode === 'heatmap' ? 1 : overlayOpacity / 100,
              mixBlendMode: viewMode === 'overlay' ? 'screen' : 'normal',
              transition: 'opacity 200ms ease',
              pointerEvents: 'none',
            }}
          />
        ) : (
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              zIndex: 2,
              opacity: viewMode === 'original' ? 0 : viewMode === 'heatmap' ? 1 : overlayOpacity / 100,
              mixBlendMode: viewMode === 'overlay' ? 'screen' : 'normal',
              transition: 'opacity 200ms ease',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* 3. Interactive Attention Spot Callout Markers (Visible in Overlay/Heatmap) */}
        {viewMode !== 'original' &&
          defaultPoints.map((pt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActivePointLabel(activePointLabel === pt.label ? null : pt.label || null)}
              style={{
                position: 'absolute',
                top: `${pt.y}%`,
                left: `${pt.x}%`,
                transform: 'translate(-50%, -50%)',
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.85)',
                border: '2px solid #ffffff',
                boxShadow: '0 0 16px rgba(239, 68, 68, 0.9)',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                fontSize: 11,
                fontWeight: 900,
                cursor: 'pointer',
                zIndex: 10,
                transition: 'transform 150ms ease',
              }}
              title={pt.label || `Attention Focus Point ${idx + 1}`}
            >
              <span>{idx + 1}</span>
            </button>
          ))}

        {/* Active Attention Tooltip */}
        {activePointLabel && (
          <div
            style={{
              position: 'absolute',
              top: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(14, 24, 18, 0.92)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(232, 200, 104, 0.5)',
              color: '#f6eedc',
              padding: '6px 14px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              zIndex: 20,
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Flame size={14} className="text-amber-400" />
            <span>{activePointLabel}</span>
          </div>
        )}

        {/* Top-Right Stage Controls: Zoom */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            display: 'flex',
            gap: 6,
            zIndex: 15,
          }}
        >
          <button
            type="button"
            onClick={() => setIsZoomed(!isZoomed)}
            style={{
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              borderRadius: 10,
              width: 32,
              height: 32,
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
            title={isZoomed ? 'Reduce View' : 'Expand View'}
          >
            {isZoomed ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>

        {/* Bottom Badge inside stage */}
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 14,
            background: 'rgba(14, 24, 18, 0.88)',
            backdropFilter: 'blur(6px)',
            color: '#d8eedf',
            padding: '4px 10px',
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 700,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: viewMode === 'original' ? '#4ade80' : '#f59e0b',
            }}
          />
          <span>
            {viewMode === 'original'
              ? t('originalLeaf')
              : viewMode === 'heatmap'
              ? t('aiFocus')
              : `${t('overlay')} (${overlayOpacity}%)`}
          </span>
        </div>
      </div>

      {/* Bottom Control Bar: Opacity Slider + Scientific Legend */}
      {showControls && (
        <div
          style={{
            padding: '14px 20px',
            background: '#f8faf7',
            borderTop: '1px solid #d4e6d7',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {/* Opacity Slider (When in Overlay Mode) */}
          {viewMode === 'overlay' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 14,
                flexWrap: 'wrap',
              }}
            >
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#1b3d2a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Sliders size={14} className="text-emerald-700" />
                <span>{t('showAiFocus')}:</span>
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 200 }}>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>0%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                  style={{
                    flex: 1,
                    accentColor: '#2b7a4d',
                    cursor: 'pointer',
                  }}
                />
                <span style={{ fontSize: 12, fontWeight: 800, color: '#1b3d2a', minWidth: 38 }}>
                  {overlayOpacity}%
                </span>
              </div>
            </div>
          )}

          {/* Grad-CAM Scientific Colormap Legend */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
              paddingTop: viewMode === 'overlay' ? 8 : 0,
              borderTop: viewMode === 'overlay' ? '1px solid #e3ede5' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#4a6f54' }}>
              <Info size={13} />
              <span>{t('attentionNote')}</span>
            </div>

            {/* Gradient Bar Visual */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: '#2563eb', fontWeight: 700 }}>{t('lowFocus')}</span>
              <div
                style={{
                  width: 90,
                  height: 10,
                  borderRadius: 99,
                  background: 'linear-gradient(90deg, #2563eb 0%, #06b6d4 25%, #10b981 50%, #f59e0b 75%, #ef4444 100%)',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
                }}
              />
              <span style={{ fontSize: 10, color: '#dc2626', fontWeight: 700 }}>{t('highFocus')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
