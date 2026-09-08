import { scans } from '@/data/mock'
import type { ScanRecord } from '@/types'

const extra: ScanRecord[] = []

export async function getScanHistory(): Promise<ScanRecord[]> {
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
  return cleanRecord
}

