'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  PhoneCall,
  PlayCircle,
  HelpCircle,
  Camera,
  Bot,
  ShieldCheck,
  MapPin,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sparkles,
  Search,
  ExternalLink,
} from 'lucide-react'
import { NearbyHelp } from '@/components/nearby-help'
import { WhatsAppBanner } from '@/components/whatsapp/WhatsAppBanner'
import { FarmerTourVideoModal } from '@/components/farmer-tour-video-modal'
import { useI18n } from '@/lib/i18n'

function HelpInner() {
  const { t, locale } = useI18n()
  const disease = useSearchParams().get('for') || undefined
  const [videoOpen, setVideoOpen] = useState(false)
  const [initialVideoStep, setInitialVideoStep] = useState(0)
  const [activeFaq, setActiveFaq] = useState<number | null>(0)
  const [faqSearch, setFaqSearch] = useState('')

  const openVideoAt = (stepIndex: number) => {
    setInitialVideoStep(stepIndex)
    setVideoOpen(true)
  }

  const faqs = [
    {
      q: locale === 'hi' ? 'फसल की पत्ती को सही तरीके से कैसे स्कैन करें?' : 'How do I take a clear photo of an infected leaf?',
      a: locale === 'hi'
        ? 'दिन के प्राकृतिक उजाले में पत्ती की तस्वीर लें। फोन को पत्ती से 10-15 सेमी दूर रखें और बीमारी वाले धब्बे को कैमरे के चौकोर फ्रेम के बीच में रखें। फ्लैश या छाया से बचें।'
        : 'Take photos under bright daylight. Hold your camera 10-15 cm away from the affected leaf and ensure the diseased spot is centered inside the target reticle without strong shadows.',
      stepIndex: 1,
    },
    {
      q: locale === 'hi' ? 'अगर इंटरनेट धीमा या बंद हो तो क्या ऐप काम करेगा?' : 'Can I use Krishi Darpan when internet is slow or offline?',
      a: locale === 'hi'
        ? 'हाँ! हमारी एआई दृष्टि मॉडल मोबाइल ब्राउज़र में तुरंत कैश हो जाती है, और आप व्हाट्सएप चैनल (+91 800-KRISHI) के माध्यम से भी बिना ऐप खोले फोटो भेजकर निदान पा सकते हैं।'
        : 'Yes! Krishi Darpan supports offline-first caching for your scanned records. You can also send leaf photos directly via our official WhatsApp companion number anytime.',
      stepIndex: 0,
    },
    {
      q: locale === 'hi' ? 'क्रॉप हेल्थ पासपोर्ट क्या है और इसका क्या लाभ है?' : 'What is the Crop Health Passport and how does it help me?',
      a: locale === 'hi'
        ? 'क्रॉप हेल्थ पासपोर्ट आपके खेत का आधिकारिक डिजिटल स्वास्थ्य रिकॉर्ड है। जब कृषि अधिकारी आपकी रिपोर्ट सत्यापित करते हैं, तो आपको एक क्यूआर-सत्यापित प्रमाण पत्र मिलता है जिससे बैंक में फसल ऋण और मंडियों में प्रीमियम मूल्य पाना आसान होता है।'
        : 'The Crop Health Passport is an official digital agronomist record of your farm. Certified by Taluka Agriculture Officers, it provides a shareable QR code that helps you secure faster crop loans and prove quality in mandis.',
      stepIndex: 3,
    },
    {
      q: locale === 'hi' ? 'कृषि एआई से अपनी भाषा में कैसे बात करें?' : 'How do I speak to Krishi AI in Hindi or Marathi?',
      a: locale === 'hi'
        ? 'कृषि एआई (AI Assistant) पेज पर जाएं और माइक आइकन दबाएं। आप हिंदी, मराठी या अंग्रेजी में बोलकर दवा की मात्रा, जैविक कीटनाशक या खाद का समय पूछ सकते हैं।'
        : 'Navigate to AI Assistant and tap the microphone icon. You can speak naturally in Hindi, Marathi, or English to get instant agronomic remedies and dosage instructions.',
      stepIndex: 2,
    },
  ]

  const filteredFaqs = faqs.filter(
    (f) => !faqSearch.trim() || f.q.toLowerCase().includes(faqSearch.toLowerCase()) || f.a.toLowerCase().includes(faqSearch.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Top Banner & Audio-Visual Video Tour Hero Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1b432a 0%, #0d2818 100%)',
          borderRadius: 22,
          padding: '22px 24px',
          color: '#ffffff',
          boxShadow: '0 12px 32px rgba(18, 51, 30, 0.25)',
          border: '1px solid rgba(232, 200, 104, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ maxWidth: 540 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                background: 'rgba(232, 200, 104, 0.2)',
                color: '#e8c868',
                fontSize: 11,
                fontWeight: 750,
                padding: '3px 10px',
                borderRadius: 99,
                border: '1px solid rgba(232, 200, 104, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Sparkles size={13} /> {locale === 'hi' ? 'किसान सहायता एवं वीडियो गाइड' : 'Farmer Support & Interactive Video Tour'}
            </span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
              5 Languages Available
            </span>
          </div>
          <h1 style={{ margin: '4px 0 6px', fontSize: 'clamp(22px, 3.5vw, 28px)', color: '#ffffff' }}>
            {locale === 'hi' ? 'सहायता केंद्र और वेबसाइट गाइड' : 'Farmer Help Center & Website Tour'}
          </h1>
          <p style={{ margin: 0, color: '#d1fae5', fontSize: 14, lineHeight: 1.5 }}>
            {locale === 'hi'
              ? 'फसल कैसे स्कैन करें, एआई सहायक का उपयोग कैसे करें और नजदीकी कृषि केंद्रों से कैसे जुड़ें — यह सब ऑडियो और वीडियो के साथ सीखें।'
              : 'Learn how to scan crop leaves, speak with Krishi AI in your native dialect, download your Crop Passport, and navigate nearby KVK centers.'}
          </p>
        </div>

        {/* Video Launch Button */}
        <button
          onClick={() => openVideoAt(0)}
          type="button"
          style={{
            background: 'linear-gradient(135deg, #e8c868 0%, #d4a017 100%)',
            color: '#122c1d',
            border: 0,
            borderRadius: 99,
            padding: '14px 24px',
            fontSize: 14,
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(212, 160, 23, 0.35)',
            transition: 'all 0.2s ease',
          }}
        >
          <PlayCircle size={22} />
          <span>{locale === 'hi' ? 'वीडियो वॉयस डेमो चलाएं' : 'Watch Video Demo with Voice'}</span>
        </button>
      </div>

      {/* Quick Action Interactive Cards for website navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <button
          type="button"
          onClick={() => openVideoAt(1)}
          style={{
            background: 'var(--card)',
            border: '1px solid var(--line)',
            borderRadius: 18,
            padding: '16px',
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            transition: 'transform 0.15s ease',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'rgba(46, 125, 50, 0.12)',
              color: '#2e7d32',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <Camera size={22} />
          </div>
          <div>
            <strong style={{ display: 'block', fontSize: 14, color: 'var(--text)' }}>
              {locale === 'hi' ? 'फसल स्कैन करना सीखें' : 'How to Scan a Crop'}
            </strong>
            <span style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, display: 'block' }}>
              {locale === 'hi' ? 'कैमरा फोकस और फोटो टिप्स' : 'Viewfinder guide & 16 crop types'}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => openVideoAt(2)}
          style={{
            background: 'var(--card)',
            border: '1px solid var(--line)',
            borderRadius: 18,
            padding: '16px',
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            transition: 'transform 0.15s ease',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'rgba(52, 211, 153, 0.15)',
              color: '#059669',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <Bot size={22} />
          </div>
          <div>
            <strong style={{ display: 'block', fontSize: 14, color: 'var(--text)' }}>
              {locale === 'hi' ? 'कृषि एआई से बात करें' : 'Talk with Krishi AI'}
            </strong>
            <span style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, display: 'block' }}>
              {locale === 'hi' ? 'माइक से अपनी भाषा में पूछें' : 'Voice questions & organic remedies'}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => openVideoAt(3)}
          style={{
            background: 'var(--card)',
            border: '1px solid var(--line)',
            borderRadius: 18,
            padding: '16px',
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            transition: 'transform 0.15s ease',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'rgba(232, 200, 104, 0.2)',
              color: '#b45309',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <strong style={{ display: 'block', fontSize: 14, color: 'var(--text)' }}>
              {locale === 'hi' ? 'क्रॉप पासपोर्ट और लोन' : 'Crop Passport & Loans'}
            </strong>
            <span style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, display: 'block' }}>
              {locale === 'hi' ? 'सत्यापित क्यूआर और पीडीएफ' : 'Bank verification & ICAR record'}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => openVideoAt(4)}
          style={{
            background: 'var(--card)',
            border: '1px solid var(--line)',
            borderRadius: 18,
            padding: '16px',
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            transition: 'transform 0.15s ease',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'rgba(59, 130, 246, 0.12)',
              color: '#2563eb',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <MapPin size={22} />
          </div>
          <div>
            <strong style={{ display: 'block', fontSize: 14, color: 'var(--text)' }}>
              {locale === 'hi' ? 'केवीके और दवा दुकानें' : 'Nearby KVK Centers'}
            </strong>
            <span style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, display: 'block' }}>
              {locale === 'hi' ? 'जीपीएस रास्ता और फोन नंबर' : 'Live map & agriculture offices'}
            </span>
          </div>
        </button>
      </div>

      {/* Emergency Kisan Toll-Free Support Row */}
      <div
        style={{
          background: 'rgba(234, 88, 12, 0.08)',
          border: '1px solid rgba(234, 88, 12, 0.3)',
          borderRadius: 18,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: '#ea580c',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <PhoneCall size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: 15, color: '#9a3412' }}>
              {locale === 'hi' ? 'सरकारी किसान कॉल सेंटर (टोल-फ्री)' : 'Government Kisan Call Centre (Toll-Free)'}
            </h4>
            <span style={{ fontSize: 13, color: '#c2410c' }}>
              {locale === 'hi'
                ? 'कृषि वैज्ञानिकों से 22 भाषाओं में सुबह 6:00 बजे से रात 10:00 बजे तक मुफ्त बात करें'
                : 'Direct agronomist assistance across 22 regional languages (6 AM - 10 PM daily)'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <a
            href="tel:18001801551"
            style={{
              background: '#ea580c',
              color: '#ffffff',
              padding: '10px 18px',
              borderRadius: 99,
              fontWeight: 750,
              fontSize: 13,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <PhoneCall size={16} /> 1800-180-1551
          </a>
        </div>
      </div>

      {/* WhatsApp Banner */}
      <WhatsAppBanner compact />

      {/* Interactive FAQ & Help Section */}
      <section
        style={{
          background: 'var(--card)',
          borderRadius: 20,
          border: '1px solid var(--line)',
          padding: '22px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <HelpCircle size={20} style={{ color: 'var(--leaf)' }} />
              {locale === 'hi' ? 'अक्सर पूछे जाने वाले सवाल (FAQ)' : 'Frequently Asked Questions'}
            </h3>
            <p className="muted" style={{ margin: '2px 0 0', fontSize: 13 }}>
              {locale === 'hi' ? 'वेबसाइट और फसल देखभाल से जुड़े आम सवालों के त्वरित समाधान' : 'Quick answers on website navigation and crop disease prevention'}
            </p>
          </div>

          <div style={{ position: 'relative', minWidth: 240 }}>
            <input
              placeholder={locale === 'hi' ? 'प्रश्न खोजें...' : 'Search questions...'}
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: 99,
                border: '1px solid var(--line)',
                fontSize: 13,
                background: 'var(--background)',
              }}
            />
            <Search size={15} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--muted)' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {filteredFaqs.map((item, idx) => {
            const isOpen = activeFaq === idx
            return (
              <div
                key={idx}
                style={{
                  border: '1px solid var(--line)',
                  borderRadius: 14,
                  overflow: 'hidden',
                  background: isOpen ? 'rgba(46, 125, 50, 0.03)' : 'transparent',
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 0,
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 650,
                    color: 'var(--text)',
                  }}
                >
                  <span>{item.q}</span>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {isOpen && (
                  <div style={{ padding: '0 18px 16px', color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>
                    <p style={{ margin: 0 }}>{item.a}</p>
                    <button
                      type="button"
                      onClick={() => openVideoAt(item.stepIndex)}
                      style={{
                        marginTop: 10,
                        background: 'transparent',
                        border: 0,
                        color: 'var(--leaf)',
                        fontWeight: 750,
                        fontSize: 12,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: 0,
                      }}
                    >
                      <PlayCircle size={15} /> {locale === 'hi' ? 'इस विषय का वीडियो गाइड देखें' : 'Watch video explanation for this step'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Nearby Centers & Agricultural GIS Map */}
      <div style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 12 }}>
          <p className="kicker" style={{ margin: 0 }}>📍 {t('nearbyTitle')}</p>
          <h2 style={{ margin: '2px 0 4px', fontSize: 20 }}>{t('nearbyTitle')}</h2>
          <p className="muted" style={{ margin: 0, fontSize: 13 }}>{t('nearbySub')}</p>
        </div>
        <NearbyHelp disease={disease} />
      </div>

      {/* Multi-Voice Interactive Demo Video Modal */}
      <FarmerTourVideoModal
        isOpen={videoOpen}
        onClose={() => setVideoOpen(false)}
        initialStepIndex={initialVideoStep}
      />
    </div>
  )
}

export default function HelpPage() {
  return (
    <Suspense>
      <HelpInner />
    </Suspense>
  )
}

