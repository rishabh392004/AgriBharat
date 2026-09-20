'use client'

import { useState } from 'react'
import {
  X,
  FlaskConical,
  Droplets,
  Scale,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  Info,
  Clock,
  Wind,
  AlertTriangle,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface SprayCalculatorModalProps {
  isOpen: boolean
  onClose: () => void
  initialCrop?: string
}

interface RemedyOption {
  id: string
  name: string
  type: 'chemical' | 'organic'
  targetDisease: string
  dosePerLiter: number // grams or ml per liter
  unit: 'g' | 'ml'
  reiHours: number // Re-entry interval
  safeSprayWindow: string
  precaution: string
}

const REMEDIES: RemedyOption[] = [
  {
    id: 'mancozeb',
    name: 'Mancozeb 75% WP',
    type: 'chemical',
    targetDisease: 'Leaf Rust / Blight (रतुआ व झुलसा)',
    dosePerLiter: 2.0,
    unit: 'g',
    reiHours: 24,
    safeSprayWindow: '4:00 PM – 6:30 PM (Evening)',
    precaution: 'Use protective face mask and chemical-resistant gloves. Do not spray against wind.',
  },
  {
    id: 'propiconazole',
    name: 'Propiconazole 25% EC',
    type: 'chemical',
    targetDisease: 'Yellow Rust / Powdery Mildew (पीला रतुआ)',
    dosePerLiter: 1.0,
    unit: 'ml',
    reiHours: 48,
    safeSprayWindow: '7:00 AM – 9:30 AM (Morning)',
    precaution: 'Highly systemic. Maintain 15-day pre-harvest interval. Avoid waterway contamination.',
  },
  {
    id: 'neem',
    name: 'Neem Oil 10,000 PPM (Azadirachtin)',
    type: 'organic',
    targetDisease: 'Preventive Organic Antifungal / Insect',
    dosePerLiter: 3.5,
    unit: 'ml',
    reiHours: 4,
    safeSprayWindow: '5:00 PM – 7:00 PM (Late Afternoon)',
    precaution: 'Mix thoroughly with 0.5ml liquid soap per liter as surfactant. Safe for beneficial pollinators.',
  },
  {
    id: 'trichoderma',
    name: 'Trichoderma harzianum (Bio-Fungicide)',
    type: 'organic',
    targetDisease: 'Root Rot / Damping-off / Soil Pathogens',
    dosePerLiter: 5.0,
    unit: 'g',
    reiHours: 2,
    safeSprayWindow: 'Cloudy day or after light irrigation',
    precaution: 'Living biological agent. Never mix with chemical fungicides. Keep in cool, shaded storage.',
  },
  {
    id: 'copper',
    name: 'Copper Oxychloride 50% WP',
    type: 'chemical',
    targetDisease: 'Bacterial Blight / Leaf Spot',
    dosePerLiter: 2.5,
    unit: 'g',
    reiHours: 24,
    safeSprayWindow: '3:30 PM – 6:00 PM',
    precaution: 'Do not spray in extreme heat (>35°C) to prevent phytotoxic leaf scorch.',
  },
]

export function SprayCalculatorModal({ isOpen, onClose, initialCrop = 'Wheat' }: SprayCalculatorModalProps) {
  const { locale } = useI18n()
  const [selectedRemedyId, setSelectedRemedyId] = useState<string>('mancozeb')
  const [tankSizeLiters, setTankSizeLiters] = useState<number>(16)
  const [fieldAreaAcres, setFieldAreaAcres] = useState<number>(2.5)
  const [waterPerAcreLiters, setWaterPerAcreLiters] = useState<number>(150)

  if (!isOpen) return null

  const remedy = REMEDIES.find((r) => r.id === selectedRemedyId) || REMEDIES[0]

  // Calculations
  const dosePerTank = (remedy.dosePerLiter * tankSizeLiters).toFixed(1)
  const totalWaterNeeded = Math.round(fieldAreaAcres * waterPerAcreLiters)
  const totalChemicalNeeded = Math.round(totalWaterNeeded * remedy.dosePerLiter)
  const totalTanksNeeded = Math.ceil(totalWaterNeeded / tankSizeLiters)

  const isHindi = locale === 'hi'
  const isMarathi = locale === 'mr'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(10, 24, 16, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'grid',
        placeItems: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 24,
          border: '1.5px solid #d0e4d7',
          width: '100%',
          maxWidth: 620,
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            background: 'linear-gradient(135deg, #1b4d2e 0%, #11341f 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'rgba(232, 200, 104, 0.2)',
                border: '1px solid rgba(232, 200, 104, 0.4)',
                display: 'grid',
                placeItems: 'center',
                color: '#e8c868',
              }}
            >
              <FlaskConical size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>
                  {isHindi ? 'ICAR स्प्रे खुराक कैलकुलेटर' : isMarathi ? 'स्प्रे डोस कॅल्क्युलेटर' : 'ICAR Spray Dosage Calculator'}
                </h3>
                <span
                  style={{
                    background: 'rgba(232, 200, 104, 0.25)',
                    color: '#f3da89',
                    fontSize: 10,
                    fontWeight: 750,
                    padding: '2px 7px',
                    borderRadius: 99,
                  }}
                >
                  {initialCrop}
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                {isHindi ? 'सुरक्षित टैंक मिश्रण और सटीक दवा मात्रा' : 'Exact tank mixing & chemical ratios for your acreage'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: 0,
              color: '#ffffff',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Step 1: Select Remedy */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 750, color: 'var(--ink)', marginBottom: 8 }}>
              {isHindi ? '1. अनुशंसित उपचार व दवा चुनें:' : '1. Select Recommended Solution / Medicine:'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 8 }}>
              {REMEDIES.map((r) => {
                const selected = r.id === selectedRemedyId
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRemedyId(r.id)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 14px',
                      borderRadius: 14,
                      border: selected ? '2px solid #2b7a4d' : '1px solid var(--line)',
                      background: selected ? '#f0f9f3' : '#faf9f5',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <strong style={{ fontSize: 13, color: selected ? '#1b4d2e' : 'var(--ink)' }}>{r.name}</strong>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 99,
                          background: r.type === 'organic' ? 'rgba(46, 125, 50, 0.15)' : 'rgba(180, 83, 9, 0.12)',
                          color: r.type === 'organic' ? '#1b5e20' : '#b45309',
                        }}
                      >
                        {r.type.toUpperCase()}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block' }}>{r.targetDisease}</span>
                    <span style={{ fontSize: 11, fontWeight: 650, color: '#2b7a4d', marginTop: 4, display: 'block' }}>
                      Rate: {r.dosePerLiter} {r.unit}/L water
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 2: Tank Size & Area Selectors */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
            {/* Tank Capacity */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 750, color: 'var(--ink)', marginBottom: 6 }}>
                {isHindi ? '2. स्प्रेयर टैंक क्षमता:' : '2. Tank Size:'}
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[16, 20, 200].map((liters) => (
                  <button
                    key={liters}
                    type="button"
                    onClick={() => setTankSizeLiters(liters)}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      borderRadius: 10,
                      border: tankSizeLiters === liters ? '2px solid #2b7a4d' : '1px solid var(--line)',
                      background: tankSizeLiters === liters ? '#2b7a4d' : '#ffffff',
                      color: tankSizeLiters === liters ? '#ffffff' : 'var(--ink)',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    {liters === 200 ? '200L (Tractor)' : `${liters}L (${liters === 16 ? 'Manual' : 'Battery'})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Farm Area */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 750, color: 'var(--ink)', marginBottom: 6 }}>
                {isHindi ? '3. खेत क्षेत्रफल (एकड़):' : '3. Farm Area (Acres):'}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="number"
                  min="0.5"
                  max="50"
                  step="0.5"
                  value={fieldAreaAcres}
                  onChange={(e) => setFieldAreaAcres(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1.5px solid var(--line)',
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--ink)',
                  }}
                />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  {isHindi ? 'एकड़' : 'acres'}
                </span>
              </div>
            </div>
          </div>

          {/* Real-Time Dosage Calculation Summary Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1b4d2e, #133a23)',
              color: '#ffffff',
              borderRadius: 18,
              padding: '18px 20px',
              boxShadow: '0 8px 24px rgba(27, 77, 46, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} style={{ color: '#e8c868' }} />
                <span style={{ fontSize: 13, fontWeight: 800, color: '#e8c868', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {isHindi ? 'सटीक मिश्रण गणना' : 'Calculated Mixing Solution'}
                </span>
              </div>
              <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.14)', padding: '2px 8px', borderRadius: 99 }}>
                Per {tankSizeLiters}L Tank
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, textAlign: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 8px' }}>
                <small style={{ fontSize: 11, color: '#c2dec9', display: 'block' }}>
                  {isHindi ? 'प्रति टैंक दवा' : 'Per Tank Dose'}
                </small>
                <strong style={{ fontSize: 20, color: '#ffffff', marginTop: 3, display: 'block' }}>
                  {dosePerTank} {remedy.unit}
                </strong>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 8px' }}>
                <small style={{ fontSize: 11, color: '#c2dec9', display: 'block' }}>
                  {isHindi ? 'कुल पानी' : 'Total Water'}
                </small>
                <strong style={{ fontSize: 20, color: '#ffffff', marginTop: 3, display: 'block' }}>
                  {totalWaterNeeded} L
                </strong>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 8px' }}>
                <small style={{ fontSize: 11, color: '#c2dec9', display: 'block' }}>
                  {isHindi ? 'कुल टैंक संख्या' : 'Total Tanks'}
                </small>
                <strong style={{ fontSize: 20, color: '#e8c868', marginTop: 3, display: 'block' }}>
                  ~{totalTanksNeeded} tanks
                </strong>
              </div>
            </div>

            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#d2e8d7' }}>
                {isHindi ? 'पूरे खेत के लिए कुल दवा आवश्यकता:' : 'Total chemical required for entire field:'}
              </span>
              <strong style={{ fontSize: 14, color: '#e8c868' }}>
                {totalChemicalNeeded >= 1000
                  ? `${(totalChemicalNeeded / 1000).toFixed(2)} ${remedy.unit === 'g' ? 'kg' : 'litres'}`
                  : `${totalChemicalNeeded} ${remedy.unit}`}
              </strong>
            </div>
          </div>

          {/* Safety Advisory & Safe Window Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Clock size={16} style={{ color: '#b45309', flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ fontSize: 12, color: '#92400e', display: 'block' }}>
                  {isHindi ? 'अनुकूल छिड़काव समय:' : 'Optimal Spray Window:'}
                </strong>
                <span style={{ fontSize: 11, color: '#b45309' }}>{remedy.safeSprayWindow}</span>
              </div>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <ShieldAlert size={16} style={{ color: '#15803d', flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ fontSize: 12, color: '#166534', display: 'block' }}>
                  {isHindi ? 'पुनः प्रवेश अंतराल (REI):' : 'Field Re-entry Safe Period:'}
                </strong>
                <span style={{ fontSize: 11, color: '#15803d' }}>
                  {remedy.reiHours} {isHindi ? 'घंटे बाद खेत में जाएं' : 'hours after application'}
                </span>
              </div>
            </div>
          </div>

          {/* Cautionary note */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--muted)', background: '#faf9f5', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--line)' }}>
            <Info size={14} style={{ color: '#2b7a4d', flexShrink: 0 }} />
            <span>{remedy.precaution}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #1b4d2e, #2b7a4d)',
              color: '#ffffff',
              border: 0,
              borderRadius: 12,
              padding: '12px',
              fontSize: 14,
              fontWeight: 750,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(43,122,77,0.3)',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{isHindi ? 'खुराक विवरण समझ आ गया' : 'Got Dosage Breakdown'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
