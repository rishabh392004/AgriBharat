'use client'

import dynamic from 'next/dynamic'
import { MapPin, Navigation, Phone, Search, Building2, Store, Clock } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { getMapCenter, getNearbyLocations } from '@/services/locationService'
import { useI18n } from '@/lib/i18n'
import type { NearbyPlace } from '@/types'

const Map = dynamic(() => import('@/components/nearby-map').then((m) => m.NearbyMap), {
  ssr: false,
  loading: () => (
    <div className="map-skel" style={{ height: '100%', display: 'grid', placeItems: 'center', background: '#e7efe2', borderRadius: 20 }}>
      <span className="muted">Loading interactive GIS map…</span>
    </div>
  ),
})

export function NearbyHelp({ disease, compact }: { disease?: string; compact?: boolean }) {
  void compact
  const { t } = useI18n()
  const [places, setPlaces] = useState<NearbyPlace[]>([])
  const [focus, setFocus] = useState<NearbyPlace | null>(null)
  const [catFilter, setCatFilter] = useState('All')
  const [search, setSearch] = useState('')
  const center = getMapCenter()

  useEffect(() => {
    getNearbyLocations(disease).then(setPlaces)
  }, [disease])

  const categories = useMemo(() => {
    const set = new Set(places.map((p) => p.category))
    return ['All', ...Array.from(set)]
  }, [places])

  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      const matchCat = catFilter === 'All' || p.category === catFilter
      const q = search.toLowerCase()
      const matchSearch =
        !q || p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)
      return matchCat && matchSearch
    })
  }, [places, catFilter, search])

  return (
    <div>
      {disease && (
        <div className="reco" style={{ marginBottom: 14 }}>
          {t('recommendedFor', { disease })}
        </div>
      )}

      {/* Category Tabs & Quick Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`chip ${catFilter === cat ? 'low' : ''}`}
              style={{
                cursor: 'pointer',
                background: catFilter === cat ? 'var(--forest)' : 'var(--card)',
                color: catFilter === cat ? '#ffffff' : 'var(--muted)',
                borderColor: catFilter === cat ? 'var(--forest)' : 'var(--line)',
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 700,
              }}
              onClick={() => setCatFilter(cat)}
            >
              {cat === 'All' ? t('allScans') : cat}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: 'min(280px, 100%)' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input
            placeholder={t('searchCenters')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              borderRadius: 999,
              border: '1px solid var(--line)',
              background: 'var(--card)',
              fontSize: 12,
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Split Layout: Map (Left) + Facility Cards (Right) */}
      <div className="help-split-layout">
        {/* Left: Sticky Full-Height Interactive Map */}
        <div className="help-map-pane">
          <Map center={center} places={filteredPlaces} focus={focus} disease={disease} />
        </div>

        {/* Right: Scrollable Facilities List */}
        <div className="help-cards-pane">
          {filteredPlaces.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', background: 'var(--card)', borderRadius: 20, border: '1px dashed var(--line)' }}>
              <p className="muted">{t('noFacilitiesFound')}</p>
            </div>
          ) : (
            filteredPlaces.map((place) => {
              const isSelected = focus?.id === place.id
              return (
                <article
                  key={place.id}
                  className={`place ${isSelected ? 'on' : ''}`}
                  style={{
                    flexDirection: 'column',
                    gap: 12,
                    borderWidth: isSelected ? 2 : 1,
                    borderColor: isSelected ? 'var(--gold)' : 'var(--line)',
                    transition: 'all 160ms ease',
                  }}
                  onClick={() => setFocus(place)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div>
                      <span className="kicker" style={{ margin: '0 0 2px', fontSize: 10 }}>{place.category}</span>
                      <h3 style={{ margin: '2px 0 4px', fontSize: 16, color: 'var(--forest)' }}>{place.name}</h3>
                      <p className="muted" style={{ margin: 0, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>📍 {place.distance}</span>
                        <span>•</span>
                        <span style={{ color: place.status === 'Open' ? '#347044' : '#a4462f', fontWeight: 700 }}>
                          {place.status === 'Open' ? t('openNow') : t('closed')}
                        </span>
                      </p>
                    </div>

                    <span
                      style={{
                        background: '#f4efe4',
                        color: 'var(--forest)',
                        fontSize: 11,
                        fontWeight: 750,
                        padding: '3px 8px',
                        borderRadius: 8,
                      }}
                    >
                      {place.distance}
                    </span>
                  </div>

                  <p className="muted" style={{ margin: 0, fontSize: 12 }}>{place.address}</p>

                  {/* Actions */}
                  <div className="place-actions" style={{ marginTop: 'auto', borderTop: '1px solid #f0e8d8', paddingTop: 10, width: '100%', justifyContent: 'space-between' }}>
                    <button
                      type="button"
                      className="ghost"
                      style={{
                        background: isSelected ? 'var(--forest)' : '#fbf8f1',
                        color: isSelected ? '#ffffff' : 'var(--forest)',
                        padding: '6px 12px',
                        fontSize: 12,
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setFocus(place)
                      }}
                    >
                      <MapPin size={14} />
                      <span>{isSelected ? t('pinHighlighted') : t('viewLocation')}</span>
                    </button>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <a
                        className="ghost"
                        href={`https://www.google.com/maps?q=${place.lat},${place.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Google Maps Navigation"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Navigation size={14} />
                        <span style={{ fontSize: 11 }}>{t('directions')}</span>
                      </a>
                      <a
                        className="ghost"
                        href={`tel:${place.phone}`}
                        title="Call Facility"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone size={14} />
                        <span style={{ fontSize: 11 }}>{t('call')}</span>
                      </a>
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
