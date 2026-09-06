export type NearbyPlace = { id: string; name: string; distance: string; category: string; status: 'Open' | 'Closed'; coordinates: [number, number]; phone: string }

export const nearbyPlaces: NearbyPlace[] = [
  { id: 'seva', name: 'Krishi Seva Kendra', distance: '2.4 km', category: 'Agriculture supplies', status: 'Open', coordinates: [73.7898, 19.9975], phone: '+91 98765 12001' },
  { id: 'expert', name: 'Agriculture Expert Center', distance: '4.1 km', category: 'Crop advisory', status: 'Open', coordinates: [73.82, 20.01], phone: '+91 98765 12002' },
  { id: 'govt', name: 'Government Agriculture Support Center', distance: '5.8 km', category: 'Farmer support', status: 'Open', coordinates: [73.76, 20.03], phone: '+91 98765 12003' },
  { id: 'fertilizer', name: 'Nashik Fertilizer Store', distance: '6.3 km', category: 'Fertilizer store', status: 'Open', coordinates: [73.84, 19.96], phone: '+91 98765 12004' },
]

export function getNearbyStores() { return Promise.resolve(nearbyPlaces) }
export function getCurrentLocation(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation is not supported'))
    navigator.geolocation.getCurrentPosition(({ coords }) => resolve(coords), reject, { enableHighAccuracy: true, timeout: 8000 })
  })
}
