'use client'

import { useEffect, useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { LocateFixed, MapPin, Navigation, Phone, Store, X } from 'lucide-react'
import { nearbyPlaces, type NearbyPlace } from '@/services/location'

const INDIA_GEOJSON = 'https://cdn.jsdelivr.net/npm/india-map-data@1.0.0/india.json'
type Coordinates = { latitude: number; longitude: number }

export function GeoMap({ compact = false }: { compact?: boolean }) {
  const [position, setPosition] = useState<Coordinates | null>(null)
  const [status, setStatus] = useState('Location not shared')
  const [selected, setSelected] = useState<NearbyPlace | null>(null)

  const locate = () => {
    if (!navigator.geolocation) return setStatus('Location is not supported on this device')
    setStatus('Finding your farm…')
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setPosition({ latitude: coords.latitude, longitude: coords.longitude })
      setStatus('Live location found')
    }, () => setStatus('Showing Nashik demo location'), { enableHighAccuracy: true, timeout: 8000 })
  }
  useEffect(() => { locate() }, [])

  const farmMarker = position ? [position.longitude, position.latitude] as [number, number] : [73.7898, 19.9975] as [number, number]
  return <section className={`card geo-card ${compact ? 'geo-card-compact' : ''}`}>
    <div className="card-heading"><div><p className="eyebrow">Nearby help</p><h2>{compact ? 'Find help near you' : 'Nashik support network'}</h2><p className="muted">{status}. Select a marker for details.</p></div><button className="icon-button" aria-label="Find my location" onClick={locate}><LocateFixed /></button></div>
    <div className="geo-map-wrap">
      <ComposableMap projection="geoMercator" projectionConfig={{ center: [79, 22], scale: compact ? 760 : 930 }}>
        <Geographies geography={INDIA_GEOJSON}>{({ geographies }) => geographies.map((geo) => <Geography key={geo.rsmKey} geography={geo} fill="var(--map-land)" stroke="var(--map-stroke)" strokeWidth={0.55} />)}</Geographies>
        <Marker coordinates={farmMarker}><g className="geo-marker"><circle r={12} /><circle r={5} /></g></Marker>
        {nearbyPlaces.map((place) => <Marker key={place.id} coordinates={place.coordinates} onClick={() => setSelected(place)}><g className="geo-help-marker" role="button" aria-label={place.name}><circle r={8} /><Store width={8} height={8} /></g></Marker>)}
      </ComposableMap>
      <div className="geo-label"><MapPin /> <span>{position ? 'Your current position' : 'Patil Farm · Nashik'}</span></div>
      {selected && <div className="geo-popup"><button className="geo-popup-close" aria-label="Close location details" onClick={() => setSelected(null)}><X /></button><p className="eyebrow">Nearby support</p><h3>{selected.name}</h3><p className="muted">{selected.category} · {selected.distance}</p><div className="geo-popup-actions"><span className="open-status">{selected.status}</span><a href={`tel:${selected.phone}`} aria-label={`Call ${selected.name}`}><Phone /> Call</a></div></div>}
    </div>
    <div className="geo-footer"><span><Navigation /> {position ? `${position.latitude.toFixed(3)}°, ${position.longitude.toFixed(3)}°` : '19.998°, 73.790°'}</span><small>GPS accuracy varies by device</small></div>
    {!compact && <div className="nearby-list">{nearbyPlaces.map((place) => <button className="nearby-place" key={place.id} onClick={() => setSelected(place)}><span className="nearby-icon"><Store /></span><span><strong>{place.name}</strong><small>{place.distance} · {place.category}</small></span><span className="open-status">{place.status}</span></button>)}</div>}
  </section>
}
