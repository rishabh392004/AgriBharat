'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

// ─── STYLES & THEME CONSTANTS ───────────────────────────────────────────────
// Base: Deep Forest Green (#0B3D2E)
// Accent Gold: Golden Yellow (#F5C518)
// Accent Pink: Hot Pink (#FF2E88)
// Body Text: Warm Cream (#FFF6DC)
// Dark: Dark Forest (#051F17)

const KRISHI_COLORS = {
    bg: '#0B3D2E',
    bgDark: '#051F17',
    gold: '#F5C518',
    pink: '#FF2E88',
    cream: '#FFF6DC',
    greenMid: '#14523F',
    greenLight: '#1B6B52',
    borderDashed: '2px dashed #F5C518',
}

// ─── SAMPLE CROP DISEASES FOR SCANNER DEMO ────────────────────────────────────
const DEMO_DISEASES = [
    {
        id: 'wheat-yellow-rust',
        crop: 'Wheat (गेहूं)',
        disease: 'Yellow Rust (पीला रतुआ)',
        scientific: 'Puccinia striiformis',
        severity: '34% High Severity',
        confidence: '98.8%',
        symptoms: 'Yellow pustules arranged in linear stripes on leaf blades.',
        organicCure: 'Neem Oil emulsion (5ml/L) + Trichoderma viride bio-fungicide',
        chemicalCure: 'Propiconazole 25% EC @ 1ml/L water',
        precaution: 'Avoid excessive nitrogenous fertilizers. Maintain adequate field drainage.',
        audioTextHi: 'फसल: गेहूं। बीमारी: पीला रतुआ। रोग की तीव्रता: 34 प्रतिशत। जैविक उपचार: 5 मिलीलीटर प्रति लीटर नीम का तेल और ट्राइकोडर्मा विरिडी का छिड़काव करें।',
        image: '/leaf_sample.jpg',
        passportId: 'KD-2026-PB-84920',
    },
    {
        id: 'rice-blast',
        crop: 'Paddy / Rice (धान)',
        disease: 'Paddy Blast (धान का झुलसा रोग)',
        scientific: 'Magnaporthe oryzae',
        severity: '18% Moderate',
        confidence: '97.4%',
        symptoms: 'Spindle-shaped lesions with grey centers and dark reddish-brown borders.',
        organicCure: 'Pseudomonas fluorescens 10g/L spray at 10-day intervals',
        chemicalCure: 'Tricyclazole 75% WP @ 0.6g/L water',
        precaution: 'Use certified resistant seed varieties. Avoid late evening irrigation.',
        audioTextHi: 'फसल: धान। बीमारी: धान का झुलसा रोग। जैविक उपचार: स्यूडोमोनास फ्लोरेसेंस 10 ग्राम प्रति लीटर का 10 दिनों के अंतराल पर छिड़काव करें।',
        image: '/leaf_sample.jpg',
        passportId: 'KD-2026-HR-11029',
    },
    {
        id: 'tomato-late-blight',
        crop: 'Tomato (टमाटर)',
        disease: 'Late Blight (अगेती/पछेती झुलसा)',
        scientific: 'Phytophthora infestans',
        severity: '42% Severe',
        confidence: '99.1%',
        symptoms: 'Water-soaked dark lesions on leaf tips with white fungal growth underneath.',
        organicCure: 'Copper oxychloride 50% WP @ 2.5g/L + Vermicompost tea',
        chemicalCure: 'Mancozeb 75% WP @ 2g/L or Cymoxanil + Mancozeb',
        precaution: 'Remove infected plant residues immediately. Ensure drip irrigation.',
        audioTextHi: 'फसल: टमाटर। बीमारी: पछेती झुलसा। जैविक उपचार: कॉपर ऑक्सीक्लोराइड और वर्मीकम्पोस्ट चाय का छिड़काव करें।',
        image: '/leaf_sample.jpg',
        passportId: 'KD-2026-RJ-74821',
    }
]

// ─── KRISHI VIGYAN KENDRA (KVK) STATIONS ──────────────────────────────────────
const KVK_STATIONS = [
    {
        id: 'kvk-ludhiana',
        name: 'KVK Ludhiana (PAU Campus)',
        district: 'Ludhiana, Punjab',
        distance: '4.2 km',
        phone: '+91 98140-12345',
        officer: 'Dr. Gurpreet Singh (Senior Agronomist)',
        bioStock: 'Trichoderma viride, Neem Oil 10,000 PPM',
        status: 'Active · Stock Available',
        lat: '30.9010° N',
        lng: '75.8573° E',
    },
    {
        id: 'kvk-karnal',
        name: 'KVK Karnal (ICAR-CSSRI)',
        district: 'Karnal, Haryana',
        distance: '12.8 km',
        phone: '+91 98120-67890',
        officer: 'Dr. Ramesh Kumar (Plant Pathologist)',
        bioStock: 'Pseudomonas fluorescens, Copper Sulfate',
        status: 'Active · Officer On Duty',
        lat: '29.6857° N',
        lng: '76.9905° E',
    },
    {
        id: 'kvk-jaipur',
        name: 'KVK Jaipur (SKNAU Center)',
        district: 'Jaipur, Rajasthan',
        distance: '28.5 km',
        phone: '+91 94140-54321',
        officer: 'Dr. Sunita Verma (Bio-Pesticide Specialist)',
        bioStock: 'Beauveria bassiana, Verticillium lecanii',
        status: 'Active',
        lat: '26.9124° N',
        lng: '75.7873° E',
    },
    {
        id: 'kvk-pune',
        name: 'KVK Baramati (Agri College)',
        district: 'Pune, Maharashtra',
        distance: '45.1 km',
        phone: '+91 98220-99887',
        officer: 'Dr. Vijay Patil (Field Inspector)',
        bioStock: 'Metarhizium anisopliae, Bacillus thuringiensis',
        status: 'Active',
        lat: '18.1517° N',
        lng: '74.5771° E',
    }
]

export default function KrishiDarpanPosterLanding() {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)

    const [activeStep, setActiveStep] = useState<number>(1)
    const [selectedDisease, setSelectedDisease] = useState(DEMO_DISEASES[0])
    const [isScanning, setIsScanning] = useState<boolean>(false)
    const [scanCompleted, setScanCompleted] = useState<boolean>(true)
    const [scanProgress, setScanProgress] = useState<number>(100)
    const [currentTime, setCurrentTime] = useState<string>('')
    const [directoryOpen, setDirectoryOpen] = useState<boolean>(false)
    const [selectedLang, setSelectedLang] = useState<string>('hi')

    // 11/10 WINNER FEATURE STATES
    const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false)
    const [whatsappModalOpen, setWhatsappModalOpen] = useState<boolean>(false)
    const [kvkModalOpen, setKvkModalOpen] = useState<boolean>(false)
    const [passportModalOpen, setPassportModalOpen] = useState<boolean>(false)
    const [liveCameraModalOpen, setLiveCameraModalOpen] = useState<boolean>(false)
    const [whatsappPhone, setWhatsappPhone] = useState<string>('')
    const [whatsappSent, setWhatsappSent] = useState<boolean>(false)
    const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false)
    const [customUploadedImage, setCustomUploadedImage] = useState<string | null>(null)
    const [cameraStreamActive, setCameraStreamActive] = useState<boolean>(false)

    useEffect(() => {
        const updateTime = () => {
            const now = new Date()
            setCurrentTime(
                now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) +
                ' · PUNJAB & HARYANA BELT'
            )
        }
        updateTime()
        const interval = setInterval(updateTime, 1000)
        return () => clearInterval(interval)
    }, [])

    // 1. Text-to-Speech (Audio Voice Assistant)
    const handleSpeakAudio = () => {
        if ('speechSynthesis' in window) {
            if (isPlayingAudio) {
                window.speechSynthesis.cancel()
                setIsPlayingAudio(false)
                return
            }

            const utterance = new SpeechSynthesisUtterance(selectedDisease.audioTextHi)
            utterance.lang = selectedLang === 'pa' ? 'pa-IN' : 'hi-IN'
            utterance.rate = 0.88
            utterance.pitch = 1.0

            utterance.onstart = () => setIsPlayingAudio(true)
            utterance.onend = () => setIsPlayingAudio(false)
            utterance.onerror = () => setIsPlayingAudio(false)

            window.speechSynthesis.speak(utterance)
        } else {
            alert('Audio playback is not supported in this browser.')
        }
    }

    // 2. WhatsApp Report Dispatch
    const handleSendWhatsAppWeb = () => {
        const text = encodeURIComponent(
            `🌾 *KRISHI DARPAN AI DIAGNOSTIC REPORT* 🌾\n` +
            `----------------------------------------\n` +
            `🌱 *Crop:* ${selectedDisease.crop}\n` +
            `🦠 *Disease:* ${selectedDisease.disease}\n` +
            `🔬 *Pathogen:* ${selectedDisease.scientific}\n` +
            `⚡ *Severity:* ${selectedDisease.severity} (${selectedDisease.confidence} AI Confidence)\n\n` +
            `📜 *Passport ID:* ${selectedDisease.passportId}\n` +
            `🌿 *ICAR Approved Bio-Remedy:*\n${selectedDisease.organicCure}\n\n` +
            `🧪 *Chemical Control:*\n${selectedDisease.chemicalCure}\n\n` +
            `🛡️ *Precaution:*\n${selectedDisease.precaution}\n\n` +
            `📍 *Nearest KVK Station:* KVK Ludhiana (+91 98140-12345)\n` +
            `----------------------------------------\n` +
            `Issued by Krishi Darpan AI Portal 2026`
        )
        window.open(`https://wa.me/?text=${text}`, '_blank')
    }

    const handleSimulateWhatsAppSMS = (e: React.FormEvent) => {
        e.preventDefault()
        setWhatsappSent(true)
        setTimeout(() => {
            setWhatsappSent(false)
            setWhatsappModalOpen(false)
        }, 2200)
    }

    // 3. Voice Microphone Command Listener Simulation
    const handleVoiceCommandSearch = () => {
        setIsListeningVoice(true)
        setTimeout(() => {
            setIsListeningVoice(false)
            handleStartScan(DEMO_DISEASES[0])
        }, 2000)
    }

    // 4. Live WebCam / File Upload Handler
    const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            const imageUrl = URL.createObjectURL(file)
            setCustomUploadedImage(imageUrl)
            setLiveCameraModalOpen(true)
        }
    }

    const handleStartScan = (diseaseObj = DEMO_DISEASES[0]) => {
        if (isPlayingAudio) {
            window.speechSynthesis.cancel()
            setIsPlayingAudio(false)
        }
        setSelectedDisease(diseaseObj)
        setIsScanning(true)
        setScanCompleted(false)
        setScanProgress(0)

        let progress = 0
        const timer = setInterval(() => {
            progress += 5
            setScanProgress(progress)
            if (progress >= 100) {
                clearInterval(timer)
                setIsScanning(false)
                setScanCompleted(true)
            }
        }, 80)
    }

    return (
        <div
            style={{
                backgroundColor: KRISHI_COLORS.bg,
                color: KRISHI_COLORS.cream,
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                minHeight: '100vh',
                overflowX: 'hidden',
                position: 'relative',
            }}
        >
            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileUpload}
                accept="image/*"
                style={{ display: 'none' }}
            />

            {/* ── STYLES INJECTION FOR POSTER EFFECT & ANIMATIONS ────────────── */}
            <style>{`
        :root {
          --krishi-bg: #0B3D2E;
          --krishi-gold: #F5C518;
          --krishi-pink: #FF2E88;
          --krishi-cream: #FFF6DC;
          --krishi-dark: #051F17;
        }

        .poster-border {
          border: 2px dashed #F5C518;
        }
        .poster-border-pink {
          border: 2px dashed #FF2E88;
        }
        .poster-box-shadow {
          box-shadow: 4px 4px 0px #051F17;
        }
        .poster-box-shadow-gold {
          box-shadow: 4px 4px 0px #F5C518;
        }

        @keyframes rotateMandala {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes scanLineAnim {
          0% { top: 0%; opacity: 0.8; }
          50% { top: 92%; opacity: 1; }
          100% { top: 0%; opacity: 0.8; }
        }

        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; transform: scale(0.98); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }

        .mandala-spin {
          animation: rotateMandala 60s linear infinite;
        }

        .scan-laser {
          position: absolute;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, transparent, #FF2E88, #F5C518, #FF2E88, transparent);
          box-shadow: 0 0 15px #FF2E88, 0 0 25px #F5C518;
          animation: scanLineAnim 2s ease-in-out infinite;
          z-index: 10;
        }

        .hover-lift {
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
        }
        .hover-lift:hover {
          transform: translateY(-3px);
        }
      `}</style>

            {/* ── 🔴 LIVE OUTBREAK RADAR TICKER BAR ──────────────────────────── */}
            <div
                style={{
                    backgroundColor: '#8B0000',
                    color: '#FFF',
                    padding: '6px 16px',
                    fontSize: 12,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #FF2E88',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                        style={{
                            backgroundColor: '#FF2E88',
                            color: '#FFF',
                            padding: '1px 6px',
                            borderRadius: 3,
                            fontSize: 10,
                            fontWeight: 900,
                        }}
                    >
                        🔴 LIVE OUTBREAK ALERT
                    </span>
                    <span>HIGH RUST SPORE RISK: Ludhiana & Karnal Agri Belt (Humidity 92%) — Early Spray Recommended</span>
                </div>

                <button
                    onClick={() => setKvkModalOpen(true)}
                    style={{
                        backgroundColor: KRISHI_COLORS.gold,
                        color: '#000',
                        border: 'none',
                        padding: '2px 8px',
                        fontSize: 11,
                        fontWeight: 900,
                        borderRadius: 3,
                        cursor: 'pointer',
                    }}
                >
                    VIEW ADVISORY MAP 🗺️
                </button>
            </div>

            {/* ── TOP HEADER NAVBAR ────────────────────────────────────────── */}
            <header
                style={{
                    borderBottom: '2px solid rgba(245, 197, 24, 0.3)',
                    backgroundColor: KRISHI_COLORS.bgDark,
                    padding: '12px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                }}
            >
                {/* Brand & Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                        style={{
                            backgroundColor: KRISHI_COLORS.pink,
                            color: '#FFF',
                            fontWeight: 800,
                            fontSize: 14,
                            padding: '4px 12px',
                            borderRadius: 4,
                            letterSpacing: '0.05em',
                            boxShadow: '2px 2px 0 #F5C518',
                        }}
                    >
                        कृषि दर्पण
                    </div>
                    <span
                        style={{
                            color: KRISHI_COLORS.gold,
                            fontWeight: 900,
                            fontSize: 20,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                        }}
                    >
                        KRISHI DARPAN
                    </span>
                    <span
                        style={{
                            fontSize: 11,
                            backgroundColor: 'rgba(245,197,24,0.15)',
                            color: KRISHI_COLORS.gold,
                            padding: '2px 8px',
                            borderRadius: 12,
                            border: '1px solid #F5C518',
                            fontWeight: 600,
                        }}
                    >
                        AI PLANT PATHOLOGY 2026
                    </span>
                </div>

                {/* Live status ticker, Language & Feature Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {/* Voice Search Mic Button */}
                    <button
                        onClick={handleVoiceCommandSearch}
                        className="hover-lift"
                        style={{
                            backgroundColor: isListeningVoice ? '#FF2E88' : 'rgba(245, 197, 24, 0.15)',
                            color: isListeningVoice ? '#FFF' : KRISHI_COLORS.gold,
                            border: '1px solid #F5C518',
                            padding: '6px 10px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                        }}
                    >
                        <span>{isListeningVoice ? '🎙️ LISTENING...' : '🎙️ VOICE SEARCH'}</span>
                    </button>

                    {/* 🧮 1. DOSAGE CALCULATOR BUTTON */}
                    <button
                        onClick={() => router.push('/farmer')}
                        className="hover-lift"
                        style={{
                            backgroundColor: 'rgba(245, 197, 24, 0.15)',
                            color: KRISHI_COLORS.gold,
                            border: '1px solid #F5C518',
                            padding: '6px 10px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 800,
                            cursor: 'pointer',
                        }}
                    >
                        🧮 DOSAGE CALCULATOR
                    </button>

                    {/* 🛡️ 2. PMFBY INSURANCE BUTTON */}
                    <button
                        onClick={() => router.push('/farmer/crop-health-passport')}
                        className="hover-lift"
                        style={{
                            backgroundColor: 'rgba(255, 46, 136, 0.15)',
                            color: KRISHI_COLORS.pink,
                            border: '1px solid #FF2E88',
                            padding: '6px 10px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 800,
                            cursor: 'pointer',
                        }}
                    >
                        🛡️ PMFBY INSURANCE
                    </button>

                    {/* 🌤️ 3. SPRAY WEATHER BUTTON */}
                    <button
                        onClick={() => router.push('/farmer')}
                        className="hover-lift"
                        style={{
                            backgroundColor: 'rgba(5, 31, 23, 0.8)',
                            color: KRISHI_COLORS.gold,
                            border: '1px dashed #F5C518',
                            padding: '6px 10px',
                            fontSize: 11,
                            fontWeight: 800,
                            borderRadius: 4,
                            cursor: 'pointer',
                        }}
                    >
                        🌤️ SPRAY WEATHER
                    </button>

                    {/* 🛒 4. STORE PRICES BUTTON */}
                    <button
                        onClick={() => router.push('/farmer/help')}
                        className="hover-lift"
                        style={{
                            backgroundColor: '#FF2E88',
                            color: '#FFF',
                            border: 'none',
                            padding: '6px 10px',
                            fontSize: 11,
                            fontWeight: 900,
                            borderRadius: 4,
                            cursor: 'pointer',
                        }}
                    >
                        🛒 STORE PRICES
                    </button>

                    <select
                        value={selectedLang}
                        onChange={(e) => setSelectedLang(e.target.value)}
                        style={{
                            backgroundColor: KRISHI_COLORS.bg,
                            color: KRISHI_COLORS.gold,
                            border: '1px solid #F5C518',
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >
                        <option value="hi">हिंदी (Hindi)</option>
                        <option value="en">English</option>
                        <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                        <option value="bn">বাংলা (Bengali)</option>
                        <option value="mr">मराठी (Marathi)</option>
                    </select>

                    {/* 📍 KVK STATIONS MAP BUTTON */}
                    <button
                        onClick={() => setKvkModalOpen(true)}
                        className="hover-lift"
                        style={{
                            backgroundColor: 'rgba(5, 31, 23, 0.8)',
                            color: KRISHI_COLORS.gold,
                            border: '1.5px dashed #F5C518',
                            padding: '6px 10px',
                            fontWeight: 800,
                            fontSize: 11,
                            borderRadius: 4,
                            cursor: 'pointer',
                        }}
                    >
                        📍 KVK MAPS
                    </button>

                    {/* 📷 SCAN NOW BUTTON */}
                    <Link
                        href="/farmer/scan"
                        className="hover-lift"
                        style={{
                            backgroundColor: KRISHI_COLORS.pink,
                            color: '#FFF',
                            border: 'none',
                            padding: '6px 10px',
                            fontWeight: 900,
                            fontSize: 11,
                            borderRadius: 4,
                            boxShadow: '2px 2px 0 #F5C518',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            textDecoration: 'none',
                        }}
                    >
                        SCAN NOW 📷
                    </Link>

                    {/* 🔑 LOG IN BUTTON */}
                    <Link
                        href="/login"
                        className="hover-lift"
                        style={{
                            backgroundColor: 'transparent',
                            color: KRISHI_COLORS.gold,
                            border: '1.5px dashed #F5C518',
                            padding: '6px 10px',
                            fontWeight: 800,
                            fontSize: 11,
                            borderRadius: 4,
                            textDecoration: 'none',
                        }}
                    >
                        LOG IN
                    </Link>

                    {/* 📝 SIGN UP BUTTON */}
                    <Link
                        href="/signup"
                        className="hover-lift"
                        style={{
                            backgroundColor: KRISHI_COLORS.gold,
                            color: KRISHI_COLORS.bgDark,
                            border: 'none',
                            padding: '6px 12px',
                            fontWeight: 900,
                            fontSize: 12,
                            borderRadius: 4,
                            boxShadow: '2px 2px 0 #FF2E88',
                            textDecoration: 'none',
                        }}
                    >
                        SIGN UP
                    </Link>
                </div>
            </header>

            {/* ── 50/50 SPLIT SCREEN MAIN CONTAINER ──────────────────────── */}
            <main
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                    minHeight: 'calc(100vh - 85px)',
                    position: 'relative',
                }}
            >
                {/* Vertical Divider Line */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: '50%',
                        width: 2,
                        borderLeft: '2px dashed #F5C518',
                        zIndex: 20,
                        pointerEvents: 'none',
                        display: 'var(--divider-display, block)',
                    }}
                />

                {/* ═════════════════════════════════════════════════════════════
            LEFT PANEL: BRAND IDENTITY & POSTER ARTWORK
           ═════════════════════════════════════════════════════════════ */}
                <section
                    style={{
                        backgroundColor: KRISHI_COLORS.bg,
                        padding: '48px 36px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden',
                        borderRight: '1px solid rgba(245, 197, 24, 0.2)',
                    }}
                >
                    {/* Subtle Grain Overlay */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            opacity: 0.05,
                            backgroundImage: 'radial-gradient(#F5C518 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                            pointerEvents: 'none',
                        }}
                    />

                    {/* Top Brand Kicker */}
                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                backgroundColor: 'rgba(255, 46, 136, 0.15)',
                                border: '1.5px solid #FF2E88',
                                padding: '4px 12px',
                                borderRadius: 20,
                                color: KRISHI_COLORS.pink,
                                fontSize: 13,
                                fontWeight: 700,
                                marginBottom: 20,
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                            </svg>
                            AI-Powered Plant Pathology Platform
                        </div>

                        {/* Main Grand Headline */}
                        <h1
                            style={{
                                fontSize: 'clamp(2.8rem, 5vw, 4.5rem)',
                                fontWeight: 900,
                                lineHeight: 1.02,
                                color: KRISHI_COLORS.gold,
                                margin: '0 0 16px 0',
                                letterSpacing: '-0.02em',
                                textTransform: 'uppercase',
                                textShadow: '3px 3px 0px #051F17',
                            }}
                        >
                            DETECT EARLY.<br />
                            PROTECT YOUR CROP.
                        </h1>

                        <p
                            style={{
                                fontSize: 18,
                                lineHeight: 1.5,
                                color: KRISHI_COLORS.cream,
                                maxWidth: 520,
                                margin: '0 0 24px 0',
                                fontWeight: 500,
                            }}
                        >
                            Scan any diseased crop leaf with your phone camera. Instant diagnostic report with pathogen identification, bio-pesticide recommendations & precautions in seconds.
                        </p>

                        {/* Quick Action Pills */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                            <div
                                style={{
                                    border: '1.5px dashed #F5C518',
                                    padding: '6px 14px',
                                    borderRadius: 4,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: KRISHI_COLORS.gold,
                                    backgroundColor: 'rgba(5, 31, 23, 0.6)',
                                }}
                            >
                                🌾 42+ Crops Trained
                            </div>
                            <div
                                style={{
                                    border: '1.5px dashed #FF2E88',
                                    padding: '6px 14px',
                                    borderRadius: 4,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: KRISHI_COLORS.pink,
                                    backgroundColor: 'rgba(5, 31, 23, 0.6)',
                                }}
                            >
                                ⚡ 98.4% Precision
                            </div>
                            <div
                                style={{
                                    border: '1.5px dashed #F5C518',
                                    padding: '6px 14px',
                                    borderRadius: 4,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: KRISHI_COLORS.cream,
                                    backgroundColor: 'rgba(5, 31, 23, 0.6)',
                                }}
                            >
                                📶 Works Offline
                            </div>
                        </div>

                        {/* HERO CTA BUTTON GROUP */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="hover-lift"
                                style={{
                                    backgroundColor: KRISHI_COLORS.pink,
                                    color: '#FFF',
                                    padding: '14px 24px',
                                    fontWeight: 900,
                                    fontSize: 15,
                                    borderRadius: 6,
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase',
                                    boxShadow: '4px 4px 0px #F5C518',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                UPLOAD LEAF PHOTO 📤
                            </button>

                            <button
                                onClick={() => setPassportModalOpen(true)}
                                className="hover-lift"
                                style={{
                                    backgroundColor: KRISHI_COLORS.gold,
                                    color: KRISHI_COLORS.bgDark,
                                    padding: '14px 20px',
                                    fontWeight: 900,
                                    fontSize: 14,
                                    borderRadius: 6,
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase',
                                    boxShadow: '4px 4px 0px #FF2E88',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                CROP PASSPORT 📜
                            </button>
                        </div>
                    </div>

                    {/* Central Animated Mandala Motif */}
                    <div
                        style={{
                            position: 'relative',
                            width: '100%',
                            height: 200,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '10px 0',
                            zIndex: 5,
                        }}
                    >
                        <svg
                            className="mandala-spin"
                            width="220"
                            height="220"
                            viewBox="0 0 200 200"
                            fill="none"
                            style={{ opacity: 0.85 }}
                        >
                            <circle cx="100" cy="100" r="90" stroke="#F5C518" strokeWidth="1.5" strokeDasharray="4 4" />
                            <circle cx="100" cy="100" r="72" stroke="#FF2E88" strokeWidth="1" />
                            <circle cx="100" cy="100" r="54" stroke="#F5C518" strokeWidth="1.5" />
                            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
                                <g key={i} transform={`rotate(${angle} 100 100)`}>
                                    <path
                                        d="M100 10 C108 35, 108 65, 100 90 C92 65, 92 35, 100 10 Z"
                                        fill={i % 2 === 0 ? 'rgba(245, 197, 24, 0.12)' : 'rgba(255, 46, 136, 0.12)'}
                                        stroke={i % 2 === 0 ? '#F5C518' : '#FF2E88'}
                                        strokeWidth="1"
                                    />
                                    <circle cx="100" cy="20" r="3" fill="#F5C518" />
                                </g>
                            ))}
                        </svg>

                        <Link
                            href="/farmer/scan"
                            style={{
                                position: 'absolute',
                                width: 76,
                                height: 76,
                                borderRadius: '50%',
                                backgroundColor: KRISHI_COLORS.bgDark,
                                border: '3px solid #F5C518',
                                display: 'grid',
                                placeItems: 'center',
                                boxShadow: '0 0 25px rgba(245, 197, 24, 0.4)',
                                zIndex: 10,
                                cursor: 'pointer',
                            }}
                        >
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F5C518" strokeWidth="1.75">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                <circle cx="12" cy="13" r="4" />
                            </svg>
                        </Link>
                    </div>

                    {/* Bottom Crop & Tree Silhouette Banner */}
                    <div
                        style={{
                            position: 'relative',
                            zIndex: 10,
                            marginTop: 'auto',
                            borderTop: '2px dashed #F5C518',
                            paddingTop: 16,
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                            <div>
                                <span style={{ fontSize: 11, color: KRISHI_COLORS.gold, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    DEVELOPED FOR INDIAN AGRICULTURE
                                </span>
                                <div style={{ fontSize: 14, fontWeight: 800, color: KRISHI_COLORS.cream }}>
                                    ICAR Certified Disease Data & Bio-Solutions
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: 11, color: KRISHI_COLORS.pink, fontWeight: 700 }}>
                                    GOVERNMENT COMPLIANT
                                </span>
                                <div style={{ fontSize: 13, color: KRISHI_COLORS.gold, fontWeight: 700 }}>
                                    2026 EDITION
                                </div>
                            </div>
                        </div>

                        <div style={{ height: 40, width: '100%', overflow: 'hidden', opacity: 0.7 }}>
                            <svg viewBox="0 0 600 60" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                                <path
                                    d="M0 60 L0 45 Q 15 20, 30 45 Q 45 10, 60 45 Q 75 25, 90 45 Q 105 15, 120 45 Q 135 30, 150 45 L150 60 L180 60 L180 35 Q 200 5, 220 35 Q 240 20, 260 35 L260 60 L300 60 L300 40 Q 320 10, 340 40 L340 60 L380 60 Q 400 15, 420 40 L420 60 L480 60 L480 30 Q 510 5, 540 30 L540 60 L600 60 Z"
                                    fill="#051F17"
                                    stroke="#F5C518"
                                    strokeWidth="0.75"
                                />
                            </svg>
                        </div>
                    </div>
                </section>

                {/* ═════════════════════════════════════════════════════════════
            RIGHT PANEL: INTERACTIVE AI WORKFLOW & LEAF SCANNER DEMO
           ═════════════════════════════════════════════════════════════ */}
                <section
                    style={{
                        backgroundColor: KRISHI_COLORS.bgDark,
                        padding: '40px 32px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 28,
                        overflowY: 'auto',
                    }}
                >
                    {/* Section Subhead */}
                    <div style={{ borderBottom: '2px dashed #F5C518', paddingBottom: 16 }}>
                        <span
                            style={{
                                fontSize: 12,
                                fontWeight: 800,
                                color: KRISHI_COLORS.pink,
                                letterSpacing: '0.15em',
                                textTransform: 'uppercase',
                            }}
                        >
                            4 STEPS TO CROP HEALTH · INTENTIONAL & PRECISE
                        </span>
                        <h2
                            style={{
                                fontSize: 28,
                                fontWeight: 900,
                                color: KRISHI_COLORS.gold,
                                margin: '4px 0 0 0',
                                textTransform: 'uppercase',
                            }}
                        >
                            AI DIAGNOSIS WORKFLOW
                        </h2>
                    </div>

                    {/* 4-Step Interactive Timeline Tabs */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                        {[
                            { step: 1, label: '01 CAPTURE', sub: 'Snap Leaf' },
                            { step: 2, label: '02 DIAGNOSE', sub: 'AI Vision' },
                            { step: 3, label: '03 CURE', sub: 'Bio-Fungicide' },
                            { step: 4, label: '04 PREVENT', sub: 'Advisory' },
                        ].map((item) => (
                            <button
                                key={item.step}
                                onClick={() => setActiveStep(item.step)}
                                style={{
                                    backgroundColor: activeStep === item.step ? KRISHI_COLORS.gold : 'rgba(11, 61, 46, 0.6)',
                                    color: activeStep === item.step ? KRISHI_COLORS.bgDark : KRISHI_COLORS.cream,
                                    border: activeStep === item.step ? '2px solid #FF2E88' : '1px dashed rgba(245, 197, 24, 0.4)',
                                    padding: '10px 6px',
                                    borderRadius: 6,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    fontWeight: 800,
                                    fontSize: 11,
                                    boxShadow: activeStep === item.step ? '3px 3px 0px #FF2E88' : 'none',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <div>{item.label}</div>
                                <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 600 }}>{item.sub}</div>
                            </button>
                        ))}
                    </div>

                    {/* Dynamic Workflow Info Box */}
                    <div
                        style={{
                            backgroundColor: KRISHI_COLORS.bg,
                            border: '2px dashed #F5C518',
                            padding: 16,
                            borderRadius: 8,
                            boxShadow: '4px 4px 0px #051F17',
                        }}
                    >
                        {activeStep === 1 && (
                            <div>
                                <h4 style={{ margin: '0 0 6px 0', color: KRISHI_COLORS.gold, fontSize: 16, fontWeight: 800 }}>
                                    📷 Step 01: Capture diseased crop leaf
                                </h4>
                                <p style={{ margin: 0, fontSize: 13, color: KRISHI_COLORS.cream, lineHeight: 1.4 }}>
                                    Use any Android phone or web camera. Works offline in rural areas with low-bandwidth neural models.
                                </p>
                            </div>
                        )}
                        {activeStep === 2 && (
                            <div>
                                <h4 style={{ margin: '0 0 6px 0', color: KRISHI_COLORS.pink, fontSize: 16, fontWeight: 800 }}>
                                    ⚡ Step 02: Neural vision diagnosis
                                </h4>
                                <p style={{ margin: 0, fontSize: 13, color: KRISHI_COLORS.cream, lineHeight: 1.4 }}>
                                    Multi-spectral pattern match analyzes rust pustules, lesions, leaf curling, and fungal spore density.
                                </p>
                            </div>
                        )}
                        {activeStep === 3 && (
                            <div>
                                <h4 style={{ margin: '0 0 6px 0', color: KRISHI_COLORS.gold, fontSize: 16, fontWeight: 800 }}>
                                    🌿 Step 03: Targeted bio-pesticide treatment
                                </h4>
                                <p style={{ margin: 0, fontSize: 13, color: KRISHI_COLORS.cream, lineHeight: 1.4 }}>
                                    Get exact CIBRC-approved bio-pesticide dosages, organic remedies (Neem, Trichoderma), and chemical sprays.
                                </p>
                            </div>
                        )}
                        {activeStep === 4 && (
                            <div>
                                <h4 style={{ margin: '0 0 6px 0', color: KRISHI_COLORS.pink, fontSize: 16, fontWeight: 800 }}>
                                    🛡️ Step 04: Seasonal micro-climate prevention
                                </h4>
                                <p style={{ margin: 0, fontSize: 13, color: KRISHI_COLORS.cream, lineHeight: 1.4 }}>
                                    Receive humidity & temperature risk alerts to stop spore outbreaks before they infect adjacent crop acres.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ── LIVE INTERACTIVE SCANNER DEMO CARD ────────────────────────── */}
                    <div
                        style={{
                            backgroundColor: KRISHI_COLORS.bg,
                            border: '2px solid #F5C518',
                            borderRadius: 10,
                            padding: 20,
                            boxShadow: '6px 6px 0px #F5C518',
                            position: 'relative',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span
                                    style={{
                                        backgroundColor: KRISHI_COLORS.pink,
                                        color: '#FFF',
                                        fontWeight: 800,
                                        fontSize: 11,
                                        padding: '2px 8px',
                                        borderRadius: 3,
                                    }}
                                >
                                    LIVE SCAN DEMO
                                </span>
                                <span style={{ fontSize: 13, fontWeight: 800, color: KRISHI_COLORS.gold }}>
                                    {selectedDisease.crop}
                                </span>
                            </div>

                            {/* Sample Switcher */}
                            <div style={{ display: 'flex', gap: 6 }}>
                                {DEMO_DISEASES.map((d, index) => (
                                    <button
                                        key={d.id}
                                        onClick={() => handleStartScan(d)}
                                        style={{
                                            backgroundColor: selectedDisease.id === d.id ? KRISHI_COLORS.gold : 'transparent',
                                            color: selectedDisease.id === d.id ? KRISHI_COLORS.bgDark : KRISHI_COLORS.cream,
                                            border: '1px solid #F5C518',
                                            fontSize: 10,
                                            fontWeight: 700,
                                            padding: '2px 6px',
                                            borderRadius: 3,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Sample {index + 1}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Scanning Viewport Box */}
                        <div
                            style={{
                                position: 'relative',
                                width: '100%',
                                height: 220,
                                backgroundColor: '#000',
                                borderRadius: 6,
                                overflow: 'hidden',
                                border: '2px dashed #F5C518',
                                marginBottom: 16,
                            }}
                        >
                            <img
                                src={selectedDisease.image}
                                alt="Diseased Leaf Sample"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    filter: isScanning ? 'contrast(1.2) brightness(0.9)' : 'none',
                                }}
                            />

                            {isScanning && <div className="scan-laser" />}

                            <div
                                style={{
                                    position: 'absolute',
                                    top: '25%',
                                    left: '20%',
                                    width: '60%',
                                    height: '50%',
                                    border: '2px dashed #FF2E88',
                                    borderRadius: 8,
                                    pointerEvents: 'none',
                                    boxShadow: '0 0 12px rgba(255, 46, 136, 0.5)',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-between',
                                    padding: 6,
                                }}
                            >
                                <span
                                    style={{
                                        backgroundColor: KRISHI_COLORS.pink,
                                        color: '#FFF',
                                        fontSize: 9,
                                        fontWeight: 800,
                                        padding: '2px 4px',
                                        borderRadius: 2,
                                    }}
                                >
                                    ROI: RUST_LESION_01
                                </span>
                            </div>

                            {isScanning && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: 12,
                                        left: 12,
                                        right: 12,
                                        backgroundColor: 'rgba(5, 31, 23, 0.85)',
                                        padding: '8px 12px',
                                        borderRadius: 4,
                                        border: '1px solid #F5C518',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800, color: KRISHI_COLORS.gold, marginBottom: 4 }}>
                                        <span>ANALYZING LEAF PATTERNS...</span>
                                        <span>{scanProgress}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: 4, backgroundColor: '#14523F', borderRadius: 2, overflow: 'hidden' }}>
                                        <div style={{ width: `${scanProgress}%`, height: '100%', backgroundColor: KRISHI_COLORS.gold }} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Diagnostic Results Breakdown */}
                        {scanCompleted && (
                            <div
                                style={{
                                    backgroundColor: KRISHI_COLORS.bgDark,
                                    border: '1.5px solid #F5C518',
                                    padding: 16,
                                    borderRadius: 6,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 12,
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <span style={{ fontSize: 11, color: KRISHI_COLORS.pink, fontWeight: 800 }}>
                                            DIAGNOSIS RESULT
                                        </span>
                                        <h3 style={{ margin: '2px 0 0 0', fontSize: 18, color: KRISHI_COLORS.gold, fontWeight: 900 }}>
                                            {selectedDisease.disease}
                                        </h3>
                                        <div style={{ fontSize: 12, color: 'rgba(255,246,220,0.7)', fontStyle: 'italic' }}>
                                            Pathogen: {selectedDisease.scientific}
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <span
                                            style={{
                                                backgroundColor: 'rgba(245, 197, 24, 0.2)',
                                                color: KRISHI_COLORS.gold,
                                                border: '1px solid #F5C518',
                                                fontSize: 12,
                                                fontWeight: 800,
                                                padding: '3px 8px',
                                                borderRadius: 4,
                                            }}
                                        >
                                            CONFIDENCE: {selectedDisease.confidence}
                                        </span>
                                        <div style={{ fontSize: 11, color: KRISHI_COLORS.pink, fontWeight: 700, marginTop: 4 }}>
                                            {selectedDisease.severity}
                                        </div>
                                    </div>
                                </div>

                                {/* AUDIO VOICE ASSISTANT BUTTON */}
                                <button
                                    onClick={handleSpeakAudio}
                                    className="hover-lift"
                                    style={{
                                        backgroundColor: isPlayingAudio ? '#FF2E88' : 'rgba(245, 197, 24, 0.15)',
                                        color: isPlayingAudio ? '#FFF' : KRISHI_COLORS.gold,
                                        border: '1.5px solid #F5C518',
                                        padding: '8px 12px',
                                        borderRadius: 4,
                                        fontSize: 12,
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                    }}
                                >
                                    <span style={{ fontSize: 16 }}>{isPlayingAudio ? '⏹️' : '🔊'}</span>
                                    {isPlayingAudio
                                        ? 'STOPPING AUDIO ADVISORY...'
                                        : `LISTEN AUDIO ADVISORY (${selectedLang === 'pa' ? 'ਪੰਜਾਬੀ' : 'हिंदी Voice'})`}
                                </button>

                                {/* Treatment Details */}
                                <div style={{ borderTop: '1px dashed rgba(245, 197, 24, 0.3)', paddingTop: 10 }}>
                                    <div style={{ fontSize: 12, fontWeight: 800, color: KRISHI_COLORS.gold, marginBottom: 4 }}>
                                        🌱 RECOMMENDED BIO-TREATMENT:
                                    </div>
                                    <div style={{ fontSize: 13, color: KRISHI_COLORS.cream, fontWeight: 600 }}>
                                        {selectedDisease.organicCure}
                                    </div>
                                </div>

                                {/* ── 11/10 CROP PASSPORT CTA ──────────────────────────── */}
                                <div style={{ borderTop: '1px dashed rgba(245, 197, 24, 0.3)', paddingTop: 10, display: 'flex', gap: 8 }}>
                                    <button
                                        onClick={() => setPassportModalOpen(true)}
                                        className="hover-lift"
                                        style={{
                                            flex: 1,
                                            backgroundColor: KRISHI_COLORS.gold,
                                            color: KRISHI_COLORS.bgDark,
                                            border: 'none',
                                            padding: '8px 12px',
                                            borderRadius: 4,
                                            fontSize: 12,
                                            fontWeight: 900,
                                            cursor: 'pointer',
                                            boxShadow: '2px 2px 0 #FF2E88',
                                        }}
                                    >
                                        📜 VIEW DIGITAL CROP PASSPORT
                                    </button>

                                    <button
                                        onClick={handleSendWhatsAppWeb}
                                        className="hover-lift"
                                        style={{
                                            backgroundColor: '#25D366',
                                            color: '#000',
                                            border: 'none',
                                            padding: '8px 12px',
                                            borderRadius: 4,
                                            fontSize: 12,
                                            fontWeight: 900,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        💬 WHATSAPP
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Scan Action Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
                            <button
                                onClick={() => handleStartScan(selectedDisease)}
                                className="hover-lift"
                                style={{
                                    backgroundColor: KRISHI_COLORS.gold,
                                    color: KRISHI_COLORS.bgDark,
                                    border: 'none',
                                    padding: '12px',
                                    fontWeight: 900,
                                    fontSize: 13,
                                    borderRadius: 6,
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                    cursor: 'pointer',
                                    boxShadow: '3px 3px 0px #FF2E88',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6,
                                }}
                            >
                                {isScanning ? 'SCANNING...' : 'DEMO SCAN ⚡'}
                            </button>

                            <Link
                                href="/farmer/scan"
                                className="hover-lift"
                                style={{
                                    backgroundColor: KRISHI_COLORS.pink,
                                    color: '#FFF',
                                    border: 'none',
                                    padding: '12px',
                                    fontWeight: 900,
                                    fontSize: 13,
                                    borderRadius: 6,
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                    boxShadow: '3px 3px 0px #F5C518',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6,
                                    textDecoration: 'none',
                                }}
                            >
                                OPEN CAMERA 📷
                            </Link>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: 10,
                            borderTop: '2px dashed #F5C518',
                            paddingTop: 16,
                        }}
                    >
                        {[
                            { val: '42+', label: 'CROPS COVERED' },
                            { val: '98.4%', label: 'ACCURACY' },
                            { val: '< 3s', label: 'SCAN LATENCY' },
                            { val: '12+', label: 'LANGUAGES' },
                        ].map((stat, i) => (
                            <div
                                key={i}
                                style={{
                                    backgroundColor: KRISHI_COLORS.bg,
                                    border: '1px solid #F5C518',
                                    padding: '10px 4px',
                                    borderRadius: 6,
                                    textAlign: 'center',
                                }}
                            >
                                <div style={{ fontSize: 18, fontWeight: 900, color: KRISHI_COLORS.gold }}>{stat.val}</div>
                                <div style={{ fontSize: 9, fontWeight: 800, color: KRISHI_COLORS.pink, letterSpacing: '0.05em' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* ── 🏆 11/10 OFFICIAL DIGITAL CROP HEALTH PASSPORT MODAL ──────────── */}
            {passportModalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(5, 31, 23, 0.93)',
                        backdropFilter: 'blur(10px)',
                        zIndex: 100,
                        display: 'grid',
                        placeItems: 'center',
                        padding: 24,
                    }}
                >
                    <div
                        style={{
                            backgroundColor: '#FFF6DC',
                            color: '#051F17',
                            border: '4px solid #F5C518',
                            borderRadius: 14,
                            padding: 32,
                            maxWidth: 650,
                            width: '100%',
                            boxShadow: '10px 10px 0px #FF2E88',
                            position: 'relative',
                            backgroundImage: 'radial-gradient(#F5C518 0.5px, transparent 0.5px)',
                            backgroundSize: '16px 16px',
                        }}
                    >
                        <button
                            onClick={() => setPassportModalOpen(false)}
                            style={{
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                backgroundColor: KRISHI_COLORS.pink,
                                color: '#FFF',
                                border: 'none',
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                fontWeight: 900,
                                cursor: 'pointer',
                            }}
                        >
                            ✕
                        </button>

                        {/* Passport Header */}
                        <div style={{ borderBottom: '3px double #051F17', paddingBottom: 16, marginBottom: 20, textAlign: 'center' }}>
                            <div style={{ fontSize: 12, fontWeight: 900, color: '#FF2E88', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                                ICAR & GOVT OF INDIA COMPLIANT
                            </div>
                            <h2 style={{ fontSize: 26, fontWeight: 900, margin: '4px 0', textTransform: 'uppercase' }}>
                                OFFICIAL CROP HEALTH PASSPORT
                            </h2>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#14523F' }}>
                                PASSPORT ID: {selectedDisease.passportId}
                            </div>
                        </div>

                        {/* Passport Details */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                                <div><strong>Crop Type:</strong> {selectedDisease.crop}</div>
                                <div><strong>Diagnosed Pathogen:</strong> {selectedDisease.disease} ({selectedDisease.scientific})</div>
                                <div><strong>Infection Severity:</strong> <span style={{ color: '#FF2E88', fontWeight: 800 }}>{selectedDisease.severity}</span></div>
                                <div><strong>AI Precision Score:</strong> {selectedDisease.confidence}</div>
                                <div><strong>Recommended Bio-Remedy:</strong> {selectedDisease.organicCure}</div>
                                <div><strong>KVK Inspector:</strong> Dr. Gurpreet Singh (Ludhiana Station)</div>
                            </div>

                            {/* Simulated QR Code Stamp */}
                            <div
                                style={{
                                    border: '2px solid #051F17',
                                    backgroundColor: '#FFF',
                                    padding: 12,
                                    borderRadius: 8,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                }}
                            >
                                {/* QR Code SVG */}
                                <svg width="80" height="80" viewBox="0 0 100 100" fill="#000">
                                    <path d="M0 0h30v30H0zM10 10h10v10H10zM70 0h30v30H70zM80 10h10v10H80zM0 70h30v30H0zM10 80h10v10H10zM40 10h10v10H40zM50 40h20v20H50zM80 70h20v20H80zM30 40h10v30H30z" />
                                </svg>
                                <span style={{ fontSize: 9, fontWeight: 900, marginTop: 6, color: '#051F17' }}>
                                    SCAN TO VERIFY
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: 12 }}>
                            <Link
                                href={`/verify/passport/${selectedDisease.passportId}`}
                                style={{
                                    flex: 1,
                                    backgroundColor: KRISHI_COLORS.bgDark,
                                    color: KRISHI_COLORS.gold,
                                    padding: '12px',
                                    borderRadius: 6,
                                    fontWeight: 900,
                                    fontSize: 13,
                                    textAlign: 'center',
                                    textDecoration: 'none',
                                }}
                            >
                                VERIFY ON GOVERNMENT PORTAL 🛡️
                            </Link>

                            <button
                                onClick={() => alert('Downloading PDF Passport...')}
                                style={{
                                    backgroundColor: KRISHI_COLORS.pink,
                                    color: '#FFF',
                                    border: 'none',
                                    padding: '12px 18px',
                                    borderRadius: 6,
                                    fontWeight: 900,
                                    fontSize: 13,
                                    cursor: 'pointer',
                                }}
                            >
                                DOWNLOAD PDF 📥
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 📍 KVK STATIONS MAP MODAL ───────────────────────────────────── */}
            {kvkModalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(5, 31, 23, 0.92)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 100,
                        display: 'grid',
                        placeItems: 'center',
                        padding: 24,
                    }}
                >
                    <div
                        style={{
                            backgroundColor: KRISHI_COLORS.bg,
                            border: '3px solid #F5C518',
                            borderRadius: 12,
                            padding: 28,
                            maxWidth: 750,
                            width: '100%',
                            maxHeight: '85vh',
                            overflowY: 'auto',
                            boxShadow: '8px 8px 0px #F5C518',
                            position: 'relative',
                        }}
                    >
                        <button
                            onClick={() => setKvkModalOpen(false)}
                            style={{
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                backgroundColor: KRISHI_COLORS.pink,
                                color: '#FFF',
                                border: 'none',
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                fontWeight: 900,
                                cursor: 'pointer',
                            }}
                        >
                            ✕
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <span style={{ backgroundColor: KRISHI_COLORS.pink, color: '#FFF', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
                                GOVT. ICAR NETWORK
                            </span>
                            <span style={{ color: KRISHI_COLORS.gold, fontSize: 12, fontWeight: 700 }}>
                                4 NEARBY STATIONS PINNED
                            </span>
                        </div>

                        <h2 style={{ color: KRISHI_COLORS.gold, margin: '0 0 16px 0', fontSize: 24, fontWeight: 900 }}>
                            📍 KRISHI VIGYAN KENDRA (KVK) MAP LOCATIONS
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {KVK_STATIONS.map((st) => (
                                <div
                                    key={st.id}
                                    style={{
                                        backgroundColor: KRISHI_COLORS.bgDark,
                                        border: '1.5px solid #F5C518',
                                        padding: 16,
                                        borderRadius: 8,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        gap: 16,
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <span style={{ fontSize: 16 }}>📍</span>
                                            <h3 style={{ margin: 0, color: KRISHI_COLORS.gold, fontSize: 16, fontWeight: 800 }}>
                                                {st.name}
                                            </h3>
                                        </div>

                                        <div style={{ fontSize: 12, color: KRISHI_COLORS.cream, margin: '2px 0' }}>
                                            👨‍🔬 Officer: <strong>{st.officer}</strong>
                                        </div>

                                        <div style={{ fontSize: 12, color: KRISHI_COLORS.pink, margin: '2px 0', fontWeight: 600 }}>
                                            🌿 Bio-Stock: {st.bioStock}
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <span style={{ fontSize: 14, fontWeight: 900, color: KRISHI_COLORS.gold }}>
                                            {st.distance} away
                                        </span>
                                        <a
                                            href={`tel:${st.phone}`}
                                            style={{
                                                backgroundColor: KRISHI_COLORS.gold,
                                                color: KRISHI_COLORS.bgDark,
                                                padding: '6px 12px',
                                                borderRadius: 4,
                                                fontSize: 11,
                                                fontWeight: 900,
                                                textDecoration: 'none',
                                            }}
                                        >
                                            📞 CALL OFFICER
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── DISEASE DIRECTORY MODAL ────────────────────────────────────── */}
            {directoryOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(5, 31, 23, 0.9)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 100,
                        display: 'grid',
                        placeItems: 'center',
                        padding: 24,
                    }}
                >
                    <div
                        style={{
                            backgroundColor: KRISHI_COLORS.bg,
                            border: '3px solid #F5C518',
                            borderRadius: 12,
                            padding: 28,
                            maxWidth: 700,
                            width: '100%',
                            maxHeight: '85vh',
                            overflowY: 'auto',
                            boxShadow: '8px 8px 0px #FF2E88',
                            position: 'relative',
                        }}
                    >
                        <button
                            onClick={() => setDirectoryOpen(false)}
                            style={{
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                backgroundColor: KRISHI_COLORS.pink,
                                color: '#FFF',
                                border: 'none',
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                fontWeight: 900,
                                cursor: 'pointer',
                            }}
                        >
                            ✕
                        </button>

                        <h2 style={{ color: KRISHI_COLORS.gold, margin: '0 0 16px 0', fontSize: 24, fontWeight: 900 }}>
                            📖 CROP DISEASE DIRECTORY & BIO-PESTICIDE GUIDE
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {DEMO_DISEASES.map((item) => (
                                <div
                                    key={item.id}
                                    style={{
                                        backgroundColor: KRISHI_COLORS.bgDark,
                                        border: '1.5px dashed #F5C518',
                                        padding: 16,
                                        borderRadius: 8,
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <h3 style={{ margin: 0, color: KRISHI_COLORS.gold, fontSize: 16 }}>
                                            {item.crop} — {item.disease}
                                        </h3>
                                        <span style={{ color: KRISHI_COLORS.pink, fontSize: 12, fontWeight: 700 }}>
                                            Pathogen: {item.scientific}
                                        </span>
                                    </div>

                                    <p style={{ fontSize: 13, color: KRISHI_COLORS.cream, margin: '8px 0' }}>
                                        <strong>Symptoms:</strong> {item.symptoms}
                                    </p>
                                    <p style={{ fontSize: 13, color: '#00FF66', margin: '4px 0' }}>
                                        <strong>Organic Remedy:</strong> {item.organicCure}
                                    </p>
                                    <p style={{ fontSize: 13, color: KRISHI_COLORS.gold, margin: '4px 0' }}>
                                        <strong>Chemical Solution:</strong> {item.chemicalCure}
                                    </p>

                                    <button
                                        onClick={() => {
                                            handleStartScan(item)
                                            setDirectoryOpen(false)
                                        }}
                                        style={{
                                            marginTop: 10,
                                            backgroundColor: KRISHI_COLORS.pink,
                                            color: '#FFF',
                                            border: 'none',
                                            padding: '6px 12px',
                                            fontSize: 11,
                                            fontWeight: 800,
                                            borderRadius: 4,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        TEST THIS SAMPLE IN SCANNER ➔
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
