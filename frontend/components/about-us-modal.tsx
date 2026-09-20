'use client'

import { useState } from 'react'
import {
  X,
  Sparkles,
  ShieldCheck,
  Brain,
  Mic,
  Cpu,
  Heart,
  Globe2,
  CheckCircle2,
  Award,
  ExternalLink,
  Users,
  Leaf,
  Layers,
  Activity,
  Zap,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface AboutUsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AboutUsModal({ isOpen, onClose }: AboutUsModalProps) {
  const { locale } = useI18n()
  const [activeTab, setActiveTab] = useState<'mission' | 'tech' | 'impact' | 'team'>('mission')

  if (!isOpen) return null

  const isHindi = locale === 'hi'
  const isMarathi = locale === 'mr'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(9, 20, 13, 0.82)',
        backdropFilter: 'blur(12px)',
        display: 'grid',
        placeItems: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(165deg, #112218 0%, #0d1a12 100%)',
          border: '1.5px solid rgba(232, 200, 104, 0.45)',
          borderRadius: 24,
          maxWidth: 720,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0,0,0,0.7), 0 0 40px rgba(46, 125, 50, 0.15)',
          color: 'white',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '24px 28px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
            background: 'linear-gradient(180deg, rgba(232, 200, 104, 0.08) 0%, transparent 100%)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span
                style={{
                  background: 'linear-gradient(135deg, #e8c868, #d4a017)',
                  color: '#0d2015',
                  fontSize: 10,
                  fontWeight: 900,
                  padding: '2px 8px',
                  borderRadius: 999,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                🇮🇳 SIH 2024 Initiative
              </span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                Smart India Hackathon
              </span>
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: 'clamp(20px, 3.5vw, 26px)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #ffffff 40%, #e8c868 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {isHindi ? 'AgriBharat • कृषि दर्पण AI' : isMarathi ? 'AgriBharat • कृषी दर्पण AI' : 'AgriBharat • Krishi Darpan AI'}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
              {isHindi
                ? 'भारतीय किसानों के लिए आधुनिक, भरोसेमंद और बहुभाषी AI फसल सुरक्षा प्रणाली'
                : 'Next-Generation AI Crop Diagnostics & Voice Advisory for Indian Agriculture'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'white',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: '12px 28px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(0,0,0,0.2)',
            overflowX: 'auto',
          }}
        >
          {[
            { key: 'mission', label: isHindi ? 'हमारा मिशन' : 'Our Mission', icon: Leaf },
            { key: 'tech', label: isHindi ? 'AI तकनीक' : 'AI Tech Stack', icon: Brain },
            { key: 'impact', label: isHindi ? 'प्रभाव व आंकड़े' : 'Impact & Stats', icon: Activity },
            { key: 'team', label: isHindi ? 'टीम व विज़न' : 'Team & Vision', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  background: active ? 'linear-gradient(135deg, rgba(232, 200, 104, 0.25), rgba(46, 125, 50, 0.3))' : 'transparent',
                  border: active ? '1px solid #e8c868' : '1px solid transparent',
                  color: active ? '#f3deb1' : 'rgba(255,255,255,0.65)',
                  fontWeight: active ? 750 : 600,
                  fontSize: 12,
                  padding: '7px 14px',
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div style={{ padding: '24px 28px 28px' }}>
          {activeTab === 'mission' && (
            <div style={{ display: 'grid', gap: 18, animation: 'fadeIn 0.2s' }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 16,
                  padding: 18,
                  lineHeight: 1.6,
                }}
              >
                <h4 style={{ margin: '0 0 8px', fontSize: 16, color: '#e8c868', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={18} />
                  {isHindi ? 'अन्नदाताओं की फसल का सुरक्षा कवच' : 'Shielding Farmers from Preventable Crop Losses'}
                </h4>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                  {isHindi
                    ? 'AgriBharat (कृषि दर्पण) को स्मार्ट इंडिया हैकथॉन के अंतर्गत विकसित किया गया है। हमारा उद्देश्य छोटे और सीमांत किसानों को उनकी स्थानीय भाषा में त्वरित, पारदर्शी और सटीक फसल रोग निदान उपलब्ध कराना है, ताकि बिना अनावश्यक कीटनाशक खर्च के फसल को बचाया जा सके।'
                    : 'AgriBharat (Krishi Darpan AI) is an indigenous agricultural innovation built to solve real-world crop health challenges. By marrying deep learning computer vision with transparent Explainable AI (Grad-CAM) and multilingual voice agents, we empower 140+ million Indian farmers to detect diseases early and spray responsibly.'}
                </p>
              </div>

              {/* 3 Pillars */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
                <div style={{ background: 'rgba(46, 125, 50, 0.15)', border: '1px solid rgba(46, 125, 50, 0.35)', borderRadius: 14, padding: 14 }}>
                  <span style={{ fontSize: 22 }}>🔍</span>
                  <strong style={{ display: 'block', fontSize: 14, color: '#a7f3d0', margin: '6px 0 3px' }}>
                    {isHindi ? 'पारदर्शी AI (Grad-CAM)' : 'Explainable AI'}
                  </strong>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
                    {isHindi ? 'केवल बीमारी का नाम नहीं, बल्कि पत्ती पर AI का फोकस हीटमैप दिखाता है।' : 'Visual heatmaps prove exactly where and why the model detected the disease.'}
                  </span>
                </div>

                <div style={{ background: 'rgba(232, 200, 104, 0.12)', border: '1px solid rgba(232, 200, 104, 0.3)', borderRadius: 14, padding: 14 }}>
                  <span style={{ fontSize: 22 }}>🎙️</span>
                  <strong style={{ display: 'block', fontSize: 14, color: '#fef08a', margin: '6px 0 3px' }}>
                    {isHindi ? '11 भारतीय भाषाएं व वॉयस' : '11 Regional Languages'}
                  </strong>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
                    {isHindi ? 'हिन्दी, मराठी, पंजाबी, गुजराती आदि में बोलकर सवाल पूछें और जवाब सुनें।' : 'Voice STT & TTS allowing seamless interaction without typing.'}
                  </span>
                </div>

                <div style={{ background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 14, padding: 14 }}>
                  <span style={{ fontSize: 22 }}>🛡️</span>
                  <strong style={{ display: 'block', fontSize: 14, color: '#bfdbfe', margin: '6px 0 3px' }}>
                    {isHindi ? 'आर्थिक सीमा (ETL) सलाह' : 'Economic Threshold (ETL)'}
                  </strong>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
                    {isHindi ? 'मौसम और संक्रमण स्तर के आधार पर केवल आवश्यक जैविक/रासायनिक उपचार।' : 'Prevents wasteful pesticide spray by factoring weather & damage severity.'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tech' && (
            <div style={{ display: 'grid', gap: 14, animation: 'fadeIn 0.2s' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Cpu size={18} className="text-emerald-400" />
                  <strong style={{ fontSize: 14, color: '#fff' }}>ResNet-34 Diagnostic Classifier (PyTorch)</strong>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                  Trained on 54,000+ authentic agricultural foliage images across 18 distinct plant-pathogen classes (Tomato, Potato, Corn, Chilli, Grape, Cotton, Rice, Sugarcane) with 99.6% benchmark confidence.
                </p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Layers size={18} className="text-amber-400" />
                  <strong style={{ fontSize: 14, color: '#fff' }}>YOLOv8 Edge Leaf Validator & Anti-Spoofing</strong>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                  Upstream filter that verifies genuine organic leaf morphology, rejecting paper, registration forms, clothing, faces, or background clutter before inference.
                </p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Sparkles size={18} className="text-sky-400" />
                  <strong style={{ fontSize: 14, color: '#fff' }}>Google Gemini 3.6 Flash & Kisan Salahkar</strong>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                  Multilingual AI agronomist providing tailored treatment schedules, organic alternatives (Neem oil, Trichoderma), chemical dosages, and weather-synchronized spraying windows.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'impact' && (
            <div style={{ display: 'grid', gap: 16, animation: 'fadeIn 0.2s' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 16, textAlign: 'center', border: '1px solid rgba(232, 200, 104, 0.25)' }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#e8c868' }}>16+</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                    {isHindi ? 'समर्थित मुख्य फसलें' : 'Core Indian Crops Supported'}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 16, textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#34d399' }}>18</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                    {isHindi ? 'रोग व स्वस्थ श्रेणियां' : 'Pathogen & Healthy Classes'}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 16, textAlign: 'center', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#60a5fa' }}>99.6%</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                    {isHindi ? 'शीर्ष मॉडल सटीकता' : 'Peak Inference Accuracy'}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 16, textAlign: 'center', border: '1px solid rgba(244, 114, 182, 0.25)' }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#f472b6' }}>11</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                    {isHindi ? 'भारतीय भाषाएं व वॉयस' : 'Indian Languages & Speech'}
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 14, padding: 14 }}>
                <strong style={{ fontSize: 13, color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} /> 100% Free & Open For Indian Kisans
                </strong>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                  Designed for deployment at Krishi Vigyan Kendras (KVK), CSC centers, and direct mobile web for farmers without high-end smartphones.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div style={{ display: 'grid', gap: 14, animation: 'fadeIn 0.2s' }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Award size={20} className="text-amber-400" />
                  <strong style={{ fontSize: 15, color: '#fff' }}>
                    {isHindi ? 'स्मार्ट इंडिया हैकथॉन (SIH 2024)' : 'Smart India Hackathon 2024'}
                  </strong>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                  Developed by passionate student engineers dedicated to building robust deep-tech public goods for India's agrarian backbone.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: '12px 16px' }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Platform Version: 2.5.0-SIH-PROD</span>
                <span style={{ fontSize: 12, color: '#e8c868', fontWeight: 700 }}>Made with ❤️ in India</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 28px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0,0,0,0.25)',
          }}
        >
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            AgriBharat • Empowering Every Kisan
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #e8c868, #d4a017)',
              color: '#122c1d',
              border: 0,
              fontWeight: 800,
              padding: '8px 20px',
              borderRadius: 999,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {isHindi ? 'समझ गया (Close)' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
}
