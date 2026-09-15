import { weather, weatherFull } from '@/data/mock'
import type { WeatherFull } from '@/types'

export async function getWeather() {
  await new Promise((resolve) => setTimeout(resolve, 80))
  return weather
}

export async function getWeatherFull(): Promise<WeatherFull> {
  await new Promise((resolve) => setTimeout(resolve, 80))
  return weatherFull
}

export async function getAlerts() {
  const { alerts } = await import('@/data/mock')
  return alerts
}
