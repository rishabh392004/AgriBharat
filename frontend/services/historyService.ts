import { scans } from '@/data/mock'
import { apiHttp, getStoredToken } from '@/lib/api-client'
import type { ScanRecord } from '@/types'

const extra: ScanRecord[] = []

export async function getScanHistory(): Promise<ScanRecord[]> {
  // If user has a token, try to pull real scans from backend
  const token = getStoredToken()
  if (token) {
    try {
      const res = await apiHttp.get<{ scans: any[] }>('/scans')
      if (res && Array.isArray(res.scans)) {
        const backendScans: ScanRecord[] = res.scans.map((s) => ({
          id: `SCAN-${s.id}`,
          date: new Date(s.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          dateIso: s.createdAt ? s.createdAt.split('T')[0] : '2026-09-08',
          crop: 'Wheat',
          disease: s.status === 'COMPLETED' ? 'Diagnosed' : s.status,
          confidence: 92,
          severity: 'Moderate',
          risk: 'Medium',
          status: 'Needs attention',
          thumb: 'wheat',
          precautions: ['Monitor spread daily'],
          actions: ['Apply recommended spray'],
          expertHelp: 'KVK Assistant available',
          symptoms: ['Leaf spots observed'],
        }))
        if (backendScans.length > 0) {
          return [...extra, ...backendScans, ...scans]
        }
      }
    } catch (err) {
      console.warn('Could not fetch backend scans, using local history:', err)
    }
  }

  const combined = [...extra, ...scans]
  const seenIds = new Set<string>()
  return combined.map((item, index) => {
    if (seenIds.has(item.id)) {
      const uniqueId = `${item.id}-${index + 1}`
      seenIds.add(uniqueId)
      return { ...item, id: uniqueId }
    }
    seenIds.add(item.id)
    return item
  })
}

export async function getScanById(id: string): Promise<ScanRecord | undefined> {
  return (await getScanHistory()).find((item) => item.id === id)
}

export async function saveScan(record: ScanRecord) {
  let uniqueId = record.id || `SCAN-${Math.floor(1000 + Math.random() * 9000)}`
  const existingHistory = await getScanHistory()
  if (existingHistory.some((s) => s.id === uniqueId)) {
    uniqueId = `SCAN-${Math.floor(1000 + Math.random() * 9000)}`
  }
  const cleanRecord = { ...record, id: uniqueId }
  extra.unshift(cleanRecord)

  // Sync to backend if authenticated
  const token = getStoredToken()
  if (token) {
    apiHttp.post('/scans', {
      imageUrl: record.thumb || `https://agribharat.local/crops/${record.crop.toLowerCase()}.jpg`,
      cropName: record.crop,
    }).catch((err) => {
      console.warn('Could not sync scan to backend database:', err)
    })
  }

  return cleanRecord
}

