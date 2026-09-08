'use client'

import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { NearbyPlace } from '@/types'

const pulseIcon = (hot: boolean) =>
  L.divIcon({
    className: '',
    html: `<span class="pin ${hot ? 'hot' : ''}"><i></i></span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  })

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([lat, lng], 14, { duration: 0.7 })
  }, [lat, lng, map])
  return null
}

export function NearbyMap({
  center,
  places,
  focus,
  disease,
}: {
  center: { lat: number; lng: number }
  places: NearbyPlace[]
  focus?: NearbyPlace | null
  disease?: string
}) {
  const target = focus ?? { lat: center.lat, lng: center.lng }
  return (
    <MapContainer className="leaflet-host" center={[center.lat, center.lng]} zoom={13} scrollWheelZoom>
      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FlyTo lat={target.lat} lng={target.lng} />
      {places.map((place) => (
        <Marker
          key={place.id}
          position={[place.lat, place.lng]}
          icon={pulseIcon(!!disease && place.relevantDiseases.includes(disease))}
        >
          <Popup>
            <strong>{place.name}</strong>
            <br />
            {place.category} · {place.distance}
            <br />
            {place.address}
            <br />
            {place.status}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
