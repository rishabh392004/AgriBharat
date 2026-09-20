/**
 * AgriBharat Weather Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches real-time weather + 5-day forecast from OpenWeatherMap API
 * using the farmer's live GPS coordinates, then computes pathogen
 * incubation risk using epidemiological rules.
 *
 * Falls back to mock data if no API key is set or geolocation is denied.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { weather, weatherFull, alerts } from '@/data/mock'
import type { WeatherFull } from '@/types'

// ─── Legacy mock exports (used by other pages) ────────────────────────────────

export async function getWeather() {
  await new Promise((resolve) => setTimeout(resolve, 80))
  return weather
}

export async function getWeatherFull(): Promise<WeatherFull> {
  await new Promise((resolve) => setTimeout(resolve, 80))
  return weatherFull
}

export async function getAlerts() {
  return alerts
}

// ─── Types ────────────────────────────────────────────────────────────────────

const OWM_BASE = 'https://api.openweathermap.org/data/2.5'
const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ?? ''

export type RiskLevel = 'Low' | 'Moderate' | 'High'

export interface ForecastDay {
  day: string
  hi: number
  lo: number
  rain: number
  icon: string
  risk: RiskLevel
}

export interface LiveWeatherData {
  location: string
  tempC: number
  feelsLike: number
  humidity: number
  windKmh: number
  rainChance: number
  riskLevel: RiskLevel
  riskBg: string
  riskColor: string
  riskBorder: string
  advisoryNote: string
  sprayWindow: string
  forecast: ForecastDay[]
  foliarWetnessHrs: number
  lastUpdated: string
  isLive: true
}

// ─── Epidemiological risk engine ──────────────────────────────────────────────

/**
 * Disease incubation risk rules based on simplified versions of:
 * - Wallin's Potato Late Blight model  (humidity + temp)
 * - Powdery Mildew model               (humidity + warm nights)
 *
 *   High     → humidity ≥ 80% AND temp 15–30°C   (peak sporulation window)
 *            OR rainChance ≥ 70%
 *   Moderate → humidity 65–79% AND temp 10–32°C
 *            OR rainChance 40–69%
 *   Low      → everything else
 */
function computeRisk(tempC: number, humidity: number, rainChance: number): RiskLevel {
  const inFungalRange = tempC >= 15 && tempC <= 30
  if ((humidity >= 80 && inFungalRange) || rainChance >= 70) return 'High'
  if ((humidity >= 65 && tempC >= 10 && tempC <= 32) || rainChance >= 40) return 'Moderate'
  return 'Low'
}

function riskColors(risk: RiskLevel) {
  if (risk === 'High')     return { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' }
  if (risk === 'Moderate') return { bg: '#fef3c7', color: '#92400e', border: '#fde68a' }
  return                          { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' }
}

/**
 * Estimated leaf wetness hours — simplified heuristic.
 * Real LW models require dew-point + radiation data; this is a practical proxy.
 */
function estimateFoliarWetness(humidity: number, rainChance: number): number {
  if (humidity >= 85 || rainChance >= 70) return parseFloat((5 + Math.random() * 2).toFixed(1))
  if (humidity >= 70 || rainChance >= 40) return parseFloat((2 + Math.random() * 2).toFixed(1))
  return parseFloat((0.5 + Math.random()).toFixed(1))
}

function buildAdvisory(
  tempC: number,
  humidity: number,
  rainChance: number,
  risk: RiskLevel
): { note: string; sprayWindow: string } {
  if (risk === 'High') {
    return {
      note: `Critical: Humidity ${humidity}% with ${tempC}°C creates peak sporulation for Late Blight, Downy Mildew & Bacterial Spot. Apply systemic fungicide immediately.`,
      sprayWindow:
        rainChance >= 60
          ? '⚡ Apply contact fungicide before incoming rainfall — window closing fast'
          : '⚡ Urgent: Apply systemic protectant before evening dew (before 5:00 PM)',
    }
  }
  if (risk === 'Moderate') {
    return {
      note: `Humidity ${humidity}% with ${tempC}°C favours Early Blight and Powdery Mildew incubation. Monitor for initial lesions and consider preventive spray.`,
      sprayWindow:
        rainChance >= 40
          ? `🎯 Spray before ${rainChance}% rain event — optimal window: Morning 7–10 AM`
          : '🎯 Preventive spray window: 4:00 PM – 6:30 PM (low wind, pre-dew)',
    }
  }
  return {
    note: `Conditions are favourable for crop growth. Humidity ${humidity}% and ${tempC}°C keep pathogen pressure low. Maintain routine monitoring.`,
    sprayWindow: '✅ Safe window for foliar nutrient spray or routine pesticide application',
  }
}

/** OWM weather condition ID → emoji */
function idToEmoji(id: number, pop: number): string {
  if (id >= 200 && id < 300) return '⛈️'
  if (id >= 300 && id < 400) return '🌦️'
  if (id >= 500 && id < 600) return pop > 60 ? '🌧️' : '🌦️'
  if (id >= 600 && id < 700) return '❄️'
  if (id >= 700 && id < 800) return '🌫️'
  if (id === 800)             return '☀️'
  if (id <= 802)              return '🌤️'
  if (id <= 804)              return '⛅'
  return '🌡️'
}

function dayLabel(unixTs: number, index: number): string {
  if (index === 0) return 'Today'
  return new Date(unixTs * 1000).toLocaleDateString('en-IN', { weekday: 'short' })
}

// ─── OWM response shapes ──────────────────────────────────────────────────────

interface OWMCurrent {
  name: string
  sys: { country: string }
  main: { temp: number; feels_like: number; humidity: number }
  wind: { speed: number }
  weather: { id: number; description: string }[]
}

interface OWMForecastItem {
  dt: number
  main: { temp_max: number; temp_min: number; humidity: number }
  weather: { id: number }[]
  pop: number
}

interface OWMForecast {
  list: OWMForecastItem[]
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Fetch live weather data for the given GPS location.
 * Returns `null` when no valid API key is present or the request fails —
 * the widget must then fall back to its hardcoded demo data.
 */
export async function fetchLiveWeather(
  latitude: number,
  longitude: number,
  locationName: string
): Promise<LiveWeatherData | null> {
  if (!API_KEY || API_KEY === 'demo_key') return null

  try {
    const [curRes, fcRes] = await Promise.all([
      fetch(`${OWM_BASE}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`),
      fetch(`${OWM_BASE}/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&cnt=32`),
    ])

    if (!curRes.ok || !fcRes.ok) return null

    const cur: OWMCurrent = await curRes.json()
    const fc: OWMForecast  = await fcRes.json()

    // ── Current conditions ──────────────────────────────────────────────────
    const tempC     = Math.round(cur.main.temp * 10) / 10
    const feelsLike = Math.round(cur.main.feels_like * 10) / 10
    const humidity  = cur.main.humidity
    const windKmh   = Math.round(cur.wind.speed * 3.6)

    // Rain chance from the next 6 h of forecast (2 × 3 h slots)
    const rainChance = Math.round(Math.max(...fc.list.slice(0, 2).map((f) => f.pop)) * 100)

    const riskLevel = computeRisk(tempC, humidity, rainChance)
    const { bg, color, border } = riskColors(riskLevel)
    const { note, sprayWindow } = buildAdvisory(tempC, humidity, rainChance, riskLevel)
    const foliarWetnessHrs      = estimateFoliarWetness(humidity, rainChance)

    // ── 4-day daily forecast ────────────────────────────────────────────────
    const dailyMap = new Map<string, OWMForecastItem[]>()
    fc.list.forEach((item) => {
      const key = new Date(item.dt * 1000).toDateString()
      if (!dailyMap.has(key)) dailyMap.set(key, [])
      dailyMap.get(key)!.push(item)
    })

    const forecast: ForecastDay[] = Array.from(dailyMap.entries())
      .slice(0, 4)
      .map(([, items], idx) => {
        const hi  = Math.round(Math.max(...items.map((i) => i.main.temp_max)))
        const lo  = Math.round(Math.min(...items.map((i) => i.main.temp_min)))
        const pop = Math.round(Math.max(...items.map((i) => i.pop)) * 100)
        const mid = items[Math.floor(items.length / 2)]
        const avgHum = Math.round(items.reduce((s, i) => s + i.main.humidity, 0) / items.length)
        return {
          day:  dayLabel(mid.dt, idx),
          hi, lo,
          rain: pop,
          icon: idToEmoji(mid.weather[0].id, pop),
          risk: computeRisk((hi + lo) / 2, avgHum, pop),
        }
      })

    const displayLocation =
      locationName && locationName.length > 3
        ? locationName
        : `${cur.name}, ${cur.sys.country}`

    const lastUpdated = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })

    return {
      location: displayLocation,
      tempC, feelsLike, humidity, windKmh, rainChance,
      riskLevel,
      riskBg: bg, riskColor: color, riskBorder: border,
      advisoryNote: note, sprayWindow,
      forecast, foliarWetnessHrs, lastUpdated,
      isLive: true,
    }
  } catch {
    return null
  }
}
