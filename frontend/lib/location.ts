/**
 * Browser Geolocation & Reverse-Geocoding Utility
 * Enables farmers and officers to access their live field GPS coordinates and human-readable address.
 */

export interface LiveLocationResult {
  latitude: number
  longitude: number
  accuracy?: number
  locationName: string
}

/**
 * Request high-accuracy GPS coordinates from the browser.
 */
export function getCurrentCoordinates(): Promise<{ latitude: number; longitude: number; accuracy: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by your device/browser.'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location permission denied. Please enable location access in your browser settings.'))
            break
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location information is currently unavailable. Please check GPS signal.'))
            break
          case error.TIMEOUT:
            reject(new Error('Location request timed out. Please try again.'))
            break
          default:
            reject(new Error(error.message || 'Unable to retrieve your live location.'))
            break
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000,
      }
    )
  })
}

/**
 * Reverse geocode latitude & longitude to a friendly Indian village/city/state name.
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4500)

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en,hi,mr',
      },
      signal: controller.signal,
    })
    clearTimeout(timer)

    if (res.ok) {
      const data = await res.json()
      const addr = data.address || {}

      const place =
        addr.village ||
        addr.town ||
        addr.suburb ||
        addr.city ||
        addr.county ||
        addr.district ||
        addr.state_district ||
        ''
      const district = addr.state_district || addr.county || ''
      const state = addr.state || ''

      const parts: string[] = []
      if (place) parts.push(place)
      if (district && district !== place && !place.includes(district)) parts.push(district)
      if (state && !place.includes(state) && !district.includes(state)) parts.push(state)

      if (parts.length > 0) {
        return parts.slice(0, 2).join(', ')
      }
    }
  } catch {
    // Network or timeout failure; fallback to formatted coordinates
  }

  const latDir = latitude >= 0 ? 'N' : 'S'
  const lonDir = longitude >= 0 ? 'E' : 'W'
  return `${Math.abs(latitude).toFixed(4)}° ${latDir}, ${Math.abs(longitude).toFixed(4)}° ${lonDir}`
}

/**
 * Detects live GPS and resolves the human-friendly location string.
 */
export async function detectLiveLocation(): Promise<LiveLocationResult> {
  const coords = await getCurrentCoordinates()
  const locationName = await reverseGeocode(coords.latitude, coords.longitude)

  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy,
    locationName,
  }
}
