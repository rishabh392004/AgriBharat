'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bot,
  Sparkles,
  MessageSquare,
  X,
  Volume2,
  ChevronRight,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'

type FarmerAction = 'waving' | 'inspecting' | 'spraying' | 'soil' | 'thumbs'

interface ActionConfig {
  id: FarmerAction
  enBubble: string
  hiBubble: string
  mrBubble: string
  tag: string
  accentColor: string
}

const ACTIONS: ActionConfig[] = [
  {
    id: 'waving',
    enBubble: 'Namaste! Ask me anything about your crop 👋',
    hiBubble: 'नमस्ते! मुझसे फसल व रोग के बारे में पूछें 👋',
    mrBubble: 'नमस्कार! पिकाबद्दल काहीही विचारा 👋',
    tag: 'Kisan AI',
    accentColor: '#10b981',
  },
  {
    id: 'inspecting',
    enBubble: 'Leaf spots or yellowing? Let me diagnose it! 🔍',
    hiBubble: 'पत्ते पर धब्बे या पीलापन? मुझे दिखाएं! 🔍',
    mrBubble: 'पानांवर डाग किंवा पिवळेपणा? मला दाखवा! 🔍',
    tag: 'Diagnosis',
    accentColor: '#f59e0b',
  },
  {
    id: 'spraying',
    enBubble: 'Check best time & safe dose for spraying! 🧪',
    hiBubble: 'दवा छिड़काव का सही समय व सुरक्षित खुराक जानें! 🧪',
    mrBubble: 'फवारणीची योग्य वेळ व प्रमाण जाणून घ्या! 🧪',
    tag: 'Spray Time',
    accentColor: '#3b82f6',
  },
  {
    id: 'soil',
    enBubble: 'Need NPK & fertilizer advice for high yield? 🌱',
    hiBubble: 'खाद और NPK पोषण सलाह चाहिए? मुझसे पूछें! 🌱',
    mrBubble: 'खत व NPK व्यवस्थापनाचा सल्ला हवाय? 🌱',
    tag: 'Nutrition',
    accentColor: '#10b981',
  },
  {
    id: 'thumbs',
    enBubble: 'Protecting Indian harvests with AI advisory! 👍',
    hiBubble: 'आपकी फसल की सुरक्षा — 11 भाषाओं में! 👍',
    mrBubble: 'तुमच्या पिकाचे रक्षण — AI तंत्रज्ञानाने! 👍',
    tag: 'Protection',
    accentColor: '#ec4899',
  },
]

export function FloatingFarmerAiButton() {
  const pathname = usePathname()
  const router = useRouter()
  const { locale } = useI18n()

  const [currentActionIndex, setCurrentActionIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isBubbleVisible, setIsBubbleVisible] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)

  // Hide when already inside the full chat page to avoid clutter
  const isChatPage = pathname === '/farmer/chat'

  // Cycle farmer action and speech bubble every 5.5 seconds
  useEffect(() => {
    if (isMinimized || isChatPage) return
    const interval = setInterval(() => {
      // Gentle fade out then change action
      setIsBubbleVisible(false)
      setTimeout(() => {
        setCurrentActionIndex((prev) => (prev + 1) % ACTIONS.length)
        setIsBubbleVisible(true)
      }, 350)
    }, 5500)

    return () => clearInterval(interval)
  }, [isMinimized, isChatPage])

  if (isChatPage) return null

  const action = ACTIONS[currentActionIndex]
  const bubbleText =
    locale === 'hi' ? action.hiBubble : locale === 'mr' ? action.mrBubble : action.enBubble

  const handleClick = () => {
    router.push('/farmer/chat')
  }

  return (
    <>
      <style>{`
        @keyframes farmerFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(1.5deg); }
        }
        @keyframes farmerWaveArm {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(26deg); }
          50% { transform: rotate(-8deg); }
          75% { transform: rotate(22deg); }
        }
        @keyframes bubblePopIn {
          0% { opacity: 0; transform: scale(0.85) translateY(10px); }
          70% { transform: scale(1.03) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes haloPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.45), 0 12px 32px rgba(27, 77, 46, 0.28); }
          50% { box-shadow: 0 0 0 12px rgba(46, 204, 113, 0), 0 16px 36px rgba(27, 77, 46, 0.35); }
        }
        @keyframes magnifyingInspect {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          30% { transform: translate(3px, -3px) rotate(8deg); }
          70% { transform: translate(-2px, 2px) rotate(-6deg); }
        }
        @keyframes sprayMist {
          0% { opacity: 0; transform: scale(0.5) translate(0, 0); }
          50% { opacity: 0.8; }
          100% { opacity: 0; transform: scale(1.4) translate(-14px, -12px); }
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'flex-end',
          flexDirection: 'column',
          gap: 8,
          pointerEvents: 'none',
        }}
      >
        {/* Interactive Speech Bubble Callout */}
        {!isMinimized && isBubbleVisible && (
          <div
            onClick={handleClick}
            style={{
              pointerEvents: 'auto',
              cursor: 'pointer',
              background: '#ffffff',
              color: '#1b4d2e',
              borderRadius: '18px 18px 4px 18px',
              padding: '10px 14px',
              maxWidth: 240,
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
              border: '1.5px solid #d4e8db',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              animation: 'bubblePopIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
              position: 'relative',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="hover:scale-103"
          >
            {/* Top row with category badge & close */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: 99,
                  background: 'rgba(46, 204, 113, 0.15)',
                  color: '#166534',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Sparkles size={10} style={{ color: '#f59e0b' }} />
                {action.tag}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMinimized(true)
                }}
                style={{
                  background: 'none',
                  border: 0,
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'grid',
                  placeItems: 'center',
                }}
                title="Minimize AI Assistant"
              >
                <X size={12} />
              </button>
            </div>

            {/* Speech message */}
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, lineHeight: 1.35, color: '#133a23' }}>
              {bubbleText}
            </p>

            {/* Micro Action prompt */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: '#2b7a4d', fontWeight: 750, marginTop: 2 }}>
              <span>{locale === 'hi' ? 'बात करने के लिए क्लिक करें' : 'Click to chat'}</span>
              <ChevronRight size={11} />
            </div>
          </div>
        )}

        {/* The Animated Farmer AI Character Button */}
        <div
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            pointerEvents: 'auto',
            cursor: 'pointer',
            position: 'relative',
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1b4d2e 0%, #2b7a4d 50%, #3ca368 100%)',
            border: '3px solid #ffffff',
            display: 'grid',
            placeItems: 'center',
            animation: 'farmerFloat 3.8s ease-in-out infinite, haloPulse 2.8s ease-in-out infinite',
            transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isHovered ? 'scale(1.1) translateY(-4px)' : 'scale(1)',
          }}
          title="Click to open Multilingual Kisan AI Chatbot"
        >
          {/* Detailed SVG Illustration of the Lively Farmer Mascot */}
          <svg
            width="58"
            height="58"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: 'visible' }}
          >
            <defs>
              {/* Saffron Turban Gradient */}
              <linearGradient id="turbanGrad" x1="20" y1="15" x2="80" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#ea580c" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>

              {/* Skin Tone Gradient */}
              <linearGradient id="skinGrad" x1="35" y1="35" x2="65" y2="65" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fed7aa" />
                <stop offset="100%" stopColor="#fba96b" />
              </linearGradient>

              {/* Kurta Gradient */}
              <linearGradient id="kurtaGrad" x1="25" y1="65" x2="75" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#15803d" />
                <stop offset="100%" stopColor="#052e16" />
              </linearGradient>
            </defs>

            {/* 1. Farmer Torso / Kurta */}
            <path
              d="M24 72 C24 64 36 62 50 62 C64 62 76 64 76 72 L78 95 L22 95 Z"
              fill="url(#kurtaGrad)"
            />
            {/* Kurta White Nehru Collar */}
            <path d="M44 62 L50 70 L56 62" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="50" cy="74" r="1.5" fill="#fde68a" />
            <circle cx="50" cy="80" r="1.5" fill="#fde68a" />

            {/* 2. Neck */}
            <rect x="44" y="54" width="12" height="10" rx="3" fill="url(#skinGrad)" />

            {/* 3. Farmer Face */}
            <circle cx="50" cy="44" r="18" fill="url(#skinGrad)" />

            {/* Ears */}
            <circle cx="31" cy="45" r="4" fill="url(#skinGrad)" />
            <circle cx="69" cy="45" r="4" fill="url(#skinGrad)" />

            {/* Friendly Smiling Eyes */}
            <ellipse cx="43" cy="41" rx="2.5" ry="3" fill="#1c1917" />
            <ellipse cx="57" cy="41" rx="2.5" ry="3" fill="#1c1917" />
            <circle cx="44" cy="40" r="0.9" fill="#ffffff" />
            <circle cx="58" cy="40" r="0.9" fill="#ffffff" />

            {/* Expressive Eyebrows */}
            <path d="M39 36 Q43 33 47 35" stroke="#44403c" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M53 35 Q57 33 61 36" stroke="#44403c" strokeWidth="1.8" strokeLinecap="round" />

            {/* Nose */}
            <path d="M50 42 Q52 46 49 48" stroke="#ea580c" strokeWidth="1.6" strokeLinecap="round" />

            {/* Classic Majestic Indian Farmer Mustache */}
            <path
              d="M38 50 Q45 47 50 51 Q55 47 62 50 Q66 53 64 54 Q56 52 50 54 Q44 52 36 54 Q34 53 38 50 Z"
              fill="#292524"
            />

            {/* Cheerful Smile below mustache */}
            <path d="M46 54 Q50 58 54 54" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />

            {/* 4. Grand Saffron Traditional Turban (Pagri) */}
            <path
              d="M26 34 C24 24 34 16 50 16 C66 16 76 24 74 34 C74 38 68 40 50 40 C32 40 26 38 26 34 Z"
              fill="url(#turbanGrad)"
            />
            {/* Turban Swirl Folds */}
            <path d="M30 28 Q50 20 70 28" stroke="#ea580c" strokeWidth="2" fill="none" opacity="0.6" />
            <path d="M34 22 Q50 17 66 22" stroke="#fde047" strokeWidth="1.6" fill="none" opacity="0.8" />
            {/* Turban Jewel / Kalgi */}
            <ellipse cx="50" cy="19" rx="3.5" ry="4.5" fill="#e8c868" />
            <circle cx="50" cy="19" r="2" fill="#15803d" />
            {/* Gold Turban Flap Top */}
            <path d="M48 15 C49 9 51 9 52 15" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />

            {/* 5. Dynamic Interactive Props & Animations According to Action */}
            {action.id === 'waving' && (
              /* Animated Waving Right Arm */
              <g
                style={{
                  transformOrigin: '72px 64px',
                  animation: 'farmerWaveArm 1.2s ease-in-out infinite',
                }}
              >
                {/* Arm */}
                <path d="M72 64 Q84 52 86 40" stroke="url(#skinGrad)" strokeWidth="6.5" strokeLinecap="round" />
                {/* Waving Hand & Fingers */}
                <circle cx="87" cy="38" r="5" fill="url(#skinGrad)" />
                <circle cx="84" cy="33" r="2" fill="url(#skinGrad)" />
                <circle cx="88" cy="32" r="2" fill="url(#skinGrad)" />
                <circle cx="92" cy="34" r="2" fill="url(#skinGrad)" />
              </g>
            )}

            {action.id === 'inspecting' && (
              /* Magnifying Glass Over Leaf */
              <g style={{ animation: 'magnifyingInspect 2s ease-in-out infinite' }}>
                <path d="M68 66 L78 54" stroke="url(#skinGrad)" strokeWidth="6" strokeLinecap="round" />
                {/* Green Leaf */}
                <path d="M74 48 C76 42 84 42 86 48 C86 54 78 56 74 48 Z" fill="#22c55e" />
                {/* Magnifier */}
                <circle cx="80" cy="46" r="8" stroke="#e8c868" strokeWidth="2.5" fill="rgba(255,255,255,0.4)" />
                <line x1="86" y1="52" x2="94" y2="60" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />
              </g>
            )}

            {action.id === 'spraying' && (
              /* Holding Spray Lance with Mist */
              <g>
                <path d="M68 68 L78 60" stroke="url(#skinGrad)" strokeWidth="6" strokeLinecap="round" />
                <line x1="74" y1="62" x2="88" y2="44" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
                <circle cx="88" cy="44" r="3" fill="#38bdf8" />
                {/* Animated Mist Droplets */}
                <circle cx="84" cy="38" r="2" fill="#60a5fa" style={{ animation: 'sprayMist 1.2s infinite' }} />
                <circle cx="92" cy="36" r="2.5" fill="#38bdf8" style={{ animation: 'sprayMist 1.2s 0.4s infinite' }} />
                <circle cx="90" cy="42" r="1.8" fill="#93c5fd" style={{ animation: 'sprayMist 1.2s 0.8s infinite' }} />
              </g>
            )}

            {action.id === 'soil' && (
              /* Holding Growing Green Sprout */
              <g>
                <circle cx="76" cy="62" r="6" fill="url(#skinGrad)" />
                {/* Soil clump */}
                <ellipse cx="76" cy="60" rx="5" ry="3" fill="#78350f" />
                {/* Green Sprout Seedling */}
                <path d="M76 60 Q76 52 74 48" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
                <path d="M74 48 Q70 44 68 46 Q70 50 74 48" fill="#22c55e" />
                <path d="M74 48 Q78 44 80 46 Q78 50 74 48" fill="#4ade80" />
                {/* Sparkle */}
                <circle cx="79" cy="42" r="1.5" fill="#fde047" />
              </g>
            )}

            {action.id === 'thumbs' && (
              /* Thumbs Up Hand */
              <g>
                <path d="M68 66 L78 56" stroke="url(#skinGrad)" strokeWidth="6" strokeLinecap="round" />
                <circle cx="78" cy="54" r="5" fill="url(#skinGrad)" />
                {/* Big Thumb sticking up */}
                <path d="M78 54 L78 44" stroke="url(#skinGrad)" strokeWidth="4.5" strokeLinecap="round" />
                {/* Star sparkle */}
                <polygon points="86,42 88,46 92,47 88,50 89,54 86,51 83,54 84,50 80,47 84,46" fill="#fde047" />
              </g>
            )}
          </svg>

          {/* Glowing AI Corner Pill Badge */}
          <div
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              borderRadius: '50%',
              width: 26,
              height: 26,
              display: 'grid',
              placeItems: 'center',
              border: '2px solid #ffffff',
              boxShadow: '0 3px 10px rgba(16, 185, 129, 0.5)',
            }}
          >
            <Bot size={14} />
          </div>
        </div>

        {/* Small restore toggle when minimized */}
        {isMinimized && (
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            style={{
              pointerEvents: 'auto',
              background: '#ffffff',
              border: '1px solid #c8decb',
              color: '#1b4d2e',
              borderRadius: 999,
              padding: '3px 10px',
              fontSize: 10,
              fontWeight: 750,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            Show Kisan AI
          </button>
        )}
      </div>
    </>
  )
}
