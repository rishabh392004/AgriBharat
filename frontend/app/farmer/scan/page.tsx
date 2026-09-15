'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState, useEffect, useMemo } from 'react'
import {
  Camera,
  Check,
  ScanLine,
  Upload,
  X,
  RefreshCw,
  Sparkles,
  Search,
  Zap,
  SunMedium,
  Focus,
  Leaf,
  ShieldCheck,
  MapPin,
  Loader2,
} from 'lucide-react'
import { CROPS, CROP_METADATA, predictCrop, type CropName } from '@/services/cropService'
import { saveLastPrediction } from '@/lib/prediction-store'
import { saveScan } from '@/services/historyService'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'
import { toast } from '@/components/toast'
import { detectLiveLocation } from '@/lib/location'

const steps = ['stepQuality', 'stepSymptoms', 'stepDisease', 'stepSeverity', 'stepRisk'] as const

type CropCategory = 'all' | 'cereals' | 'vegetables' | 'cash' | 'fruits_pulses'

const CROP_CATEGORIES: Record<CropCategory, { label: string; icon: string; crops: CropName[] }> = {
  all: { label: 'All Crops (16)', icon: '🌱', crops: [...CROPS] },
  cereals: { label: 'Cereals & Grains', icon: '🌾', crops: ['Wheat', 'Rice', 'Maize'] },
  vegetables: { label: 'Vegetables', icon: '🍅', crops: ['Tomato', 'Potato', 'Onion', 'Brinjal', 'Chilli'] },
  cash: { label: 'Cash & Oilseeds', icon: '☁️', crops: ['Cotton', 'Sugarcane', 'Soybean', 'Mustard', 'Groundnut'] },
  fruits_pulses: { label: 'Fruits & Pulses', icon: '🍌', crops: ['Banana', 'Mango', 'Chickpea'] },
}

export default function ScanPage() {
  const { t, locale } = useI18n()
  const { farmer, setFarmer } = useAuth()
  const router = useRouter()
  const galleryRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [selectedCrop, setSelectedCrop] = useState<CropName>('Wheat')
  const [selectedCategory, setSelectedCategory] = useState<CropCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')
  const [running, setRunning] = useState(false)
  const [doneSteps, setDoneSteps] = useState(0)
  const [locating, setLocating] = useState(false)

  // Live Camera Viewfinder State
  const [cameraActive, setCameraActive] = useState(false)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [cameraError, setCameraError] = useState('')
  const [flashSimulated, setFlashSimulated] = useState(false)

  // Filtered crops list
  const filteredCrops = useMemo(() => {
    const categoryCrops = CROP_CATEGORIES[selectedCategory].crops
    if (!searchQuery.trim()) return categoryCrops
    const q = searchQuery.toLowerCase()
    return categoryCrops.filter((crop) => {
      const meta = CROP_METADATA[crop]
      return (
        crop.toLowerCase().includes(q) ||
        meta.hindi.toLowerCase().includes(q) ||
        meta.marathi.toLowerCase().includes(q) ||
        meta.commonDiseases.some((d) => d.toLowerCase().includes(q))
      )
    })
  }, [selectedCategory, searchQuery])

  const pick = (next?: File | null) => {
    if (!next) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(next.type)) {
      setError(t('jpegHint'))
      return
    }
    setError('')
    setFile(next)
    setPreview(URL.createObjectURL(next))
  }

  // Open Live Camera Viewfinder
  const openCamera = () => {
    setCameraActive(true)
    setCameraError('')
  }

  // Close Live Camera
  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
    setCameraError('')
  }

  // Toggle front/back camera
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(nextMode)
  }

  // Manage Camera Stream Lifecycle safely
  useEffect(() => {
    let isCancelled = false

    const startStream = async () => {
      if (!cameraActive) return
      setCameraError('')

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not supported')
        }

        // Stop existing tracks first
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop())
          streamRef.current = null
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        streamRef.current = stream

        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          video.onloadedmetadata = () => {
            if (!isCancelled && video) {
              const playPromise = video.play()
              if (playPromise !== undefined) {
                playPromise.catch((playErr: any) => {
                  // Gracefully ignore AbortError caused by rapid reload/unmount
                  if (playErr.name !== 'AbortError') {
                    console.warn('Camera playback warning:', playErr)
                  }
                })
              }
            }
          }
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.warn('Camera stream error:', err)
          setCameraError('Camera access was blocked or busy. Click below to use your native device camera.')
        }
      }
    }

    if (cameraActive) {
      startStream()
    }

    return () => {
      isCancelled = true
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
    }
  }, [cameraActive, facingMode])

  // Capture Snapshot
  const captureSnapshot = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    setFlashSimulated(true)
    setTimeout(() => setFlashSimulated(false), 200)

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const capturedFile = new File([blob], `crop_scan_${selectedCrop.toLowerCase()}_${Date.now()}.jpg`, {
          type: 'image/jpeg',
        })
        pick(capturedFile)
        closeCamera()
      },
      'image/jpeg',
      0.92
    )
  }

  const analyze = async () => {
    if (!file) {
      setError(t('noImage'))
      return
    }
    setRunning(true)
    setDoneSteps(0)
    const timers = steps.map((_, i) => setTimeout(() => setDoneSteps(i + 1), 400 * (i + 1)))
    const result = await predictCrop(file, selectedCrop, {
      latitude: farmer.latitude,
      longitude: farmer.longitude,
    })
    if (preview) {
      result.imageUrl = preview
    }
    timers.forEach(clearTimeout)
    setDoneSteps(steps.length)
    saveLastPrediction(result)
    await saveScan({
      id: result.scanId,
      date: '08 Sep 2026',
      dateIso: '2026-09-08',
      crop: result.crop,
      disease: result.disease,
      confidence: result.confidence,
      severity: result.severity,
      risk: result.riskLevel,
      status: result.disease === 'Healthy' ? 'Healthy' : 'Needs attention',
      thumb: result.crop.toLowerCase(),
      symptoms: result.symptoms,
      precautions: result.precautions,
      actions: result.actions,
      expertHelp: result.expertHelp,
    })
    router.push('/farmer/result')
  }

  const selectedMeta = CROP_METADATA[selectedCrop]

  return (
    <div className="animate-fadeIn">
      {/* Page Header Card */}
      <div className="scan-header-card">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span className="chip low" style={{ fontSize: 11, padding: '3px 10px' }}>
              <Sparkles size={13} style={{ marginRight: 4 }} />
              AI Vision v2.4 Active
            </span>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
              16 Crops • Real-Time Diagnostics
            </span>
            <button
              type="button"
              onClick={async () => {
                setLocating(true)
                try {
                  const res = await detectLiveLocation()
                  setFarmer((prev) => ({
                    ...prev,
                    location: res.locationName,
                    latitude: res.latitude,
                    longitude: res.longitude,
                  }))
                  toast(`📍 Field location set: ${res.locationName}`)
                } catch (err: unknown) {
                  const msg = err instanceof Error ? err.message : 'Unable to retrieve live GPS'
                  toast(msg)
                } finally {
                  setLocating(false)
                }
              }}
              disabled={locating}
              style={{
                background: 'rgba(46, 125, 50, 0.1)',
                border: '1px solid rgba(46, 125, 50, 0.28)',
                color: 'var(--leaf)',
                borderRadius: 999,
                padding: '2px 9px',
                fontSize: 11,
                fontWeight: 700,
                cursor: locating ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
              title="Update live GPS for current field scan"
            >
              {locating ? (
                <>
                  <Loader2 size={11} className="spin" />
                  Detecting GPS...
                </>
              ) : (
                <>
                  <MapPin size={11} />
                  📍 {farmer.location || 'Detect GPS'}
                </>
              )}
            </button>
          </div>
          <h1 style={{ margin: '2px 0 6px', fontSize: 'clamp(24px, 4vw, 32px)', letterSpacing: '-0.02em' }}>
            {t('scanCrop')}
          </h1>
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>
            Select your crop below and take a live photo or upload an image to receive instant diagnosis & treatments.
          </p>
        </div>

        {/* Selected Crop Badge Display */}
        <div
          style={{
            background: 'var(--card)',
            border: '1.5px solid #2b7a4d',
            borderRadius: 16,
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 4px 14px rgba(43, 122, 77, 0.08)',
          }}
        >
          <img
            src={selectedMeta.image}
            alt={selectedCrop}
            style={{ width: 42, height: 42, borderRadius: 10, objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Target Crop
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)' }}>
              {selectedMeta.icon} {selectedCrop}
            </div>
            <div style={{ fontSize: 11, color: '#2b7a4d', fontWeight: 600 }}>
              {locale === 'mr' ? selectedMeta.marathi : selectedMeta.hindi}
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs & Crop Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div className="scan-cat-tabs" style={{ margin: 0 }}>
          {(Object.keys(CROP_CATEGORIES) as CropCategory[]).map((catKey) => {
            const cat = CROP_CATEGORIES[catKey]
            const isCatOn = selectedCategory === catKey
            return (
              <button
                key={catKey}
                type="button"
                className={`scan-cat-tab ${isCatOn ? 'on' : ''}`}
                onClick={() => setSelectedCategory(catKey)}
              >
                <span>{cat.icon}</span> {cat.label}
              </button>
            )
          })}
        </div>

        {/* Quick Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--card)',
            border: '1px solid var(--line)',
            borderRadius: 14,
            padding: '6px 12px',
            width: 'min(240px, 100%)',
          }}
        >
          <Search size={14} className="text-muted" />
          <input
            type="text"
            placeholder="Search crop..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 0, outline: 'none', background: 'transparent', fontSize: 12, width: '100%' }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ border: 0, background: 'none', cursor: 'pointer', color: 'var(--muted)' }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* 16 Crops Visual Grid */}
      <div className="crops-grid-16">
        {filteredCrops.map((item) => {
          const meta = CROP_METADATA[item]
          const isSelected = selectedCrop === item
          const localName = locale === 'mr' ? meta.marathi : meta.hindi

          return (
            <button
              key={item}
              className={`crop-card-item ${isSelected ? 'on' : ''}`}
              type="button"
              onClick={() => setSelectedCrop(item)}
            >
              <div className="crop-card-img-wrap">
                <img src={meta.image} alt={item} className="crop-img-thumb" />
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      background: '#2b7a4d',
                      color: 'white',
                      borderRadius: '50%',
                      width: 22,
                      height: 22,
                      display: 'grid',
                      placeItems: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    }}
                  >
                    <Check size={14} />
                  </div>
                )}
              </div>

              <div className="crop-card-content">
                <div className="crop-item-name">
                  {meta.icon} {item}
                </div>
                <div className="crop-item-local">{localName}</div>
                <div className="crop-item-tag" title={meta.commonDiseases.join(', ')}>
                  {meta.commonDiseases[0]}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Action Cards: Live Camera & Upload */}
      <div className="scan-action-grid">
        {/* Card 1: Live Leaf Camera */}
        <button className="scan-action-tile" type="button" onClick={openCamera}>
          <span className="scan-action-badge">{t('recommendedLabel')}</span>
          <div className="scan-action-icon-circle">
            <Camera size={28} />
          </div>
          <div>
            <strong style={{ fontSize: 16, display: 'block', color: 'var(--ink)', marginBottom: 3 }}>
              {t('takePhoto')} (Live Camera)
            </strong>
            <span className="muted" style={{ fontSize: 12 }}>
              Point camera at infected leaf with live framing reticle & instant capture
            </span>
          </div>
          <span className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 12, marginTop: 4, width: 'auto' }}>
            <Camera size={14} /> Open Live Camera
          </span>
        </button>

        {/* Card 2: Gallery Upload */}
        <button className="scan-action-tile" type="button" onClick={() => galleryRef.current?.click()}>
          <div className="scan-action-icon-circle" style={{ background: '#f6eedc', color: '#9d741c' }}>
            <Upload size={28} />
          </div>
          <div>
            <strong style={{ fontSize: 16, display: 'block', color: 'var(--ink)', marginBottom: 3 }}>
              {t('upload')} Leaf Image
            </strong>
            <span className="muted" style={{ fontSize: 12 }}>
              Choose clear leaf photo from your phone gallery or computer (JPEG, PNG, WEBP)
            </span>
          </div>
          <span
            className="btn btn-secondary"
            style={{ padding: '8px 18px', fontSize: 12, marginTop: 4, width: 'auto' }}
          >
            <Upload size={14} /> Browse Photo
          </span>
        </button>
      </div>

      {/* Hidden Inputs */}
      <input
        ref={galleryRef}
        hidden
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => pick(e.target.files?.[0])}
      />
      <input
        ref={cameraInputRef}
        hidden
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => pick(e.target.files?.[0])}
      />
      <canvas ref={canvasRef} hidden />

      {error && <p className="err" style={{ marginTop: 10, textAlign: 'center' }}>{error}</p>}

      {/* Live Interactive Camera Modal */}
      {cameraActive && (
        <div className="camera-modal-overlay">
          <div className="camera-modal-box">
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                color: 'white',
                background: '#111d15',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 700 }}>
                <span className="pulse-beacon" style={{ background: '#4ade80' }} />
                <span>Scanning {selectedCrop} Leaf</span>
              </div>
              <button
                type="button"
                onClick={closeCamera}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: 0,
                  color: 'white',
                  borderRadius: '50%',
                  width: 34,
                  height: 34,
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Camera Viewfinder View */}
            <div className="camera-viewfinder">
              <video ref={videoRef} playsInline autoPlay muted />
              {flashSimulated && (
                <div style={{ position: 'absolute', inset: 0, background: 'white', zIndex: 10 }} />
              )}
              <div className="camera-crop-target">
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 14,
                    color: '#e8c868',
                    fontSize: 12,
                    fontWeight: 750,
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Leaf size={14} /> Center infected spot inside target
                </div>
              </div>
            </div>

            {/* Shutter / Control Bar */}
            {cameraError ? (
              <div style={{ padding: 22, textAlign: 'center', background: '#241212', color: '#ffc0b3' }}>
                <p style={{ margin: '0 0 12px', fontSize: 13 }}>{cameraError}</p>
                <button
                  className="btn btn-gold"
                  type="button"
                  style={{ width: 'auto' }}
                  onClick={() => {
                    closeCamera()
                    cameraInputRef.current?.click()
                  }}
                >
                  <Camera size={16} /> Open Native Device Camera
                </button>
              </div>
            ) : (
              <div className="camera-shutter-bar">
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    borderRadius: 14,
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                  title="Switch Front / Rear Camera"
                >
                  <RefreshCw size={14} /> Flip
                </button>

                {/* Shutter Trigger Button */}
                <button
                  type="button"
                  className="camera-shutter-btn"
                  onClick={captureSnapshot}
                  title="Capture Photo"
                  aria-label="Capture crop leaf photo"
                >
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#2b7a4d' }} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    closeCamera()
                    cameraInputRef.current?.click()
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    borderRadius: 14,
                    padding: '10px 16px',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Native
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Image Preview & Analysis Stage */}
      {preview && (
        <div style={{ marginTop: 24 }}>
          <div className="preview">
            <img src={preview} alt={t('preview')} />
            {running && (
              <div className="scanline">
                <i />
              </div>
            )}
            <div
              style={{
                position: 'absolute',
                top: 14,
                left: 14,
                background: 'rgba(27,61,42,0.85)',
                backdropFilter: 'blur(8px)',
                color: 'white',
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <ShieldCheck size={14} className="text-[#e8c868]" />
              Ready for {selectedCrop} Diagnosis
            </div>
            <button
              className="iconish"
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                background: 'rgba(0,0,0,0.65)',
                color: 'white',
                cursor: 'pointer',
              }}
              onClick={() => {
                setFile(null)
                setPreview('')
              }}
              aria-label={t('remove')}
            >
              <X size={18} />
            </button>
          </div>

          {/* Running Step Status */}
          {running && (
            <ul className="steps">
              <p className="kicker" style={{ margin: '0 0 6px' }}>
                {t('analyzing')}
              </p>
              {steps.map((key, i) => (
                <li key={key} className={i < doneSteps ? 'done' : ''}>
                  <Check size={18} /> {t(key)}
                </li>
              ))}
            </ul>
          )}

          {/* Action Trigger Buttons */}
          <div className="actions" style={{ marginTop: 18, justifyContent: 'flex-start' }}>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => galleryRef.current?.click()}
              disabled={running}
            >
              {t('change')} Image
            </button>
            <button
              className="btn btn-primary"
              style={{ width: 'auto', minWidth: 240, fontSize: 15 }}
              disabled={running}
              onClick={analyze}
            >
              <ScanLine size={18} /> {running ? t('analyzing') : `⚡ ${t('analyze')} ${selectedCrop}`}
            </button>
          </div>
        </div>
      )}

      {/* Photography Accuracy & Best Practices Tips */}
      <div className="scan-tips-row">
        <div className="scan-tip-card">
          <SunMedium size={22} className="text-[#d4a017]" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong style={{ fontSize: 13, color: 'var(--ink)' }}>{t('daylightPhoto')}</strong>
            <p className="muted" style={{ margin: '2px 0 0', fontSize: 12 }}>
              Capture photos in bright, natural light without heavy shadows or artificial glare.
            </p>
          </div>
        </div>

        <div className="scan-tip-card">
          <Focus size={22} className="text-[#2b7a4d]" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong style={{ fontSize: 13, color: 'var(--ink)' }}>{t('closeUpFocus')}</strong>
            <p className="muted" style={{ margin: '2px 0 0', fontSize: 12 }}>
              Keep camera 10–15 cm from the leaf so disease spots and veins are clearly defined.
            </p>
          </div>
        </div>

        <div className="scan-tip-card">
          <Zap size={22} className="text-[#35925d]" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong style={{ fontSize: 13, color: 'var(--ink)' }}>{t('singleDiseaseArea')}</strong>
            <p className="muted" style={{ margin: '2px 0 0', fontSize: 12 }}>
              Isolate one leaf or fruit lesion per scan to ensure maximum AI model confidence.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
