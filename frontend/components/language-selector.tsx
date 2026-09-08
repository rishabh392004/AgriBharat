'use client'

import { Check, Globe2, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { localeLabels, useI18n, type Locale } from '@/lib/i18n'

const languageDetails: Record<Locale, { native: string; english: string; region: string }> = {
  en: { native: 'English', english: 'English', region: 'Default' },
  hi: { native: 'हिन्दी', english: 'Hindi', region: 'National' },
  mr: { native: 'मराठी', english: 'Marathi', region: 'Maharashtra' },
  bn: { native: 'বাংলা', english: 'Bengali', region: 'West Bengal' },
  gu: { native: 'ગુજરાતી', english: 'Gujarati', region: 'Gujarat' },
  ta: { native: 'தமிழ்', english: 'Tamil', region: 'Tamil Nadu' },
  te: { native: 'తెలుగు', english: 'Telugu', region: 'Andhra / Telangana' },
  pa: { native: 'ਪੰਜਾਬੀ', english: 'Punjabi', region: 'Punjab' },
  kn: { native: 'ಕನ್ನಡ', english: 'Kannada', region: 'Karnataka' },
  ml: { native: 'മലയാളം', english: 'Malayalam', region: 'Kerala' },
  as: { native: 'অসমীয়া', english: 'Assamese', region: 'Assam' },
}

export function LanguageSelector({ align = 'right' }: { align?: 'left' | 'right' }) {
  const { locale, setLocale, t } = useI18n()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const options = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (Object.keys(languageDetails) as Locale[]).filter((code) => {
      const item = languageDetails[code]
      return (
        !q ||
        item.native.toLowerCase().includes(q) ||
        item.english.toLowerCase().includes(q) ||
        item.region.toLowerCase().includes(q) ||
        code.includes(q)
      )
    })
  }, [query])

  return (
    <div className={`lang ${align}`} ref={ref}>
      <button
        className="lang-btn"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title="Change Language"
      >
        <Globe2 size={16} />
        <span>{languageDetails[locale]?.native || localeLabels[locale]}</span>
        <span className="caret" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 180ms ease' }}>
          ▾
        </span>
      </button>

      {open && (
        <div className="lang-pop" role="listbox">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <p style={{ margin: 0 }}>{t('selectLanguage')}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ border: 0, background: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 2 }}
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>

          <label className="lang-search">
            <Search size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search / भाषा खोजें..."
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                style={{ border: 0, background: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0 }}
              >
                <X size={12} />
              </button>
            )}
          </label>

          <div className="lang-list">
            {options.length === 0 ? (
              <div style={{ padding: '12px', textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>
                No language found
              </div>
            ) : (
              options.map((code) => {
                const item = languageDetails[code]
                const isSelected = code === locale
                return (
                  <button
                    key={code}
                    type="button"
                    className={isSelected ? 'on' : ''}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                    }}
                    onClick={() => {
                      setLocale(code)
                      setOpen(false)
                      setQuery('')
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {isSelected ? (
                        <Check size={16} style={{ color: 'var(--forest)', strokeWidth: 2.5 }} />
                      ) : (
                        <span className="gap" style={{ width: 16 }} />
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
                        <span style={{ fontWeight: isSelected ? 750 : 600, fontSize: 13.5 }}>
                          {item.native}
                        </span>
                        {code !== 'en' && (
                          <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>
                            {item.english}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        padding: '2px 6px',
                        borderRadius: 6,
                        background: isSelected ? 'rgba(27,61,42,0.12)' : 'rgba(0,0,0,0.04)',
                        color: isSelected ? 'var(--forest)' : 'var(--muted)',
                      }}
                    >
                      {code}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
