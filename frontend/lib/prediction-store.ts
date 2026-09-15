import type { Prediction } from '@/types'

const KEY = 'kr-last-prediction'

export function saveLastPrediction(prediction: Prediction) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(KEY, JSON.stringify(prediction))
}

export function readLastPrediction(): Prediction | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Prediction
  } catch {
    return null
  }
}
