import type { CropHealthPassport, PassportRecord } from '@/types'

const PASSPORT_STORAGE_KEY = 'krishi_crop_health_passport'

export const DEFAULT_PASSPORT: CropHealthPassport = {
  passportId: 'KRA-2026-NK-00124',
  farmerId: 'FARMER-001',
  farmerName: 'Vijay Patil',
  farmName: 'Patil Farm',
  location: 'Nashik, Maharashtra',
  farmArea: '4.5 acres',
  season: 'Kharif 2026',
  activeCrop: 'Wheat',
  createdAt: '15 Aug 2026',
  records: [
    {
      recordId: 'REC-2026-0902-01',
      diagnosisId: 'SCAN-101',
      date: '02 Sep 2026',
      dateIso: '2026-09-02',
      crop: 'Wheat',
      disease: 'Leaf Rust',
      aiConfidence: 94,
      severity: 'Moderate',
      riskLevel: 'High',
      verificationStatus: 'Officer Verified',
      locationName: 'Patil Farm, Plot B (Nashik)',
      latitude: 19.9975,
      longitude: 73.7898,
      officerId: 'OFF-NSK-042',
      officerName: 'Dr. Sanjay Deshmukh',
      officerDesignation: 'Taluka Agriculture Officer, Nashik',
      officerNotes: 'Fungal pustules and leaf yellowing confirmed during on-site inspection. Immediate preventive treatment recommended.',
      recommendedAction: 'Apply Propiconazole 25% EC @ 1ml/L of water. Spray during clear weather. Monitor affected leaves after 7 days.',
      symptoms: ['Orange-brown pustules on upper leaf surface', 'Stunted plant growth', 'Chlorotic leaf margins'],
      verifiedAt: '02 Sep 2026, 04:30 PM',
    },
    {
      recordId: 'REC-2026-0828-02',
      diagnosisId: 'SCAN-102',
      date: '28 Aug 2026',
      dateIso: '2026-08-28',
      crop: 'Tomato',
      disease: 'Early Blight',
      aiConfidence: 93,
      severity: 'Moderate',
      riskLevel: 'High',
      verificationStatus: 'Officer Verified',
      locationName: 'Patil Farm, Polyhouse A (Nashik)',
      latitude: 19.9982,
      longitude: 73.7885,
      officerId: 'OFF-NSK-042',
      officerName: 'Dr. Sanjay Deshmukh',
      officerDesignation: 'Taluka Agriculture Officer, Nashik',
      officerNotes: 'Concentric ring lesions observed on lower leaves. Microclimate humidity contributed to spore propagation.',
      recommendedAction: 'Apply Mancozeb 75% WP @ 2.5g/L. Remove and destroy infected bottom foliage to prevent canopy spread.',
      symptoms: ['Target-shaped brown lesions', 'Yellow halo surrounding spots', 'Premature leaf drop'],
      verifiedAt: '28 Aug 2026, 11:15 AM',
    },
    {
      recordId: 'REC-2026-0821-03',
      diagnosisId: 'SCAN-103',
      date: '21 Aug 2026',
      dateIso: '2026-08-21',
      crop: 'Rice',
      disease: 'Healthy',
      aiConfidence: 97,
      severity: 'None',
      riskLevel: 'Low',
      verificationStatus: 'Officer Verified',
      locationName: 'Patil Farm, Lowland Basin (Nashik)',
      latitude: 19.9969,
      longitude: 73.7912,
      officerId: 'OFF-NSK-042',
      officerName: 'Dr. Sanjay Deshmukh',
      officerDesignation: 'Taluka Agriculture Officer, Nashik',
      officerNotes: 'Paddy crop verified robust with healthy tiller density. Zero leaf blast or bacterial blight symptoms observed.',
      recommendedAction: 'Maintain optimal 2-5 cm water standing depth. Apply secondary potassium and nitrogen split as scheduled.',
      symptoms: ['Vibrant green leaf blades', 'Normal root aeration', 'No fungal spotting'],
      verifiedAt: '21 Aug 2026, 03:45 PM',
    },
  ],
}

/**
 * Read passport from LocalStorage or return default demo passport
 */
export function getStoredPassport(): CropHealthPassport {
  if (typeof window === 'undefined') return DEFAULT_PASSPORT
  try {
    const raw = localStorage.getItem(PASSPORT_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(PASSPORT_STORAGE_KEY, JSON.stringify(DEFAULT_PASSPORT))
      return DEFAULT_PASSPORT
    }
    return JSON.parse(raw) as CropHealthPassport
  } catch {
    return DEFAULT_PASSPORT
  }
}

/**
 * Save updated passport into LocalStorage
 */
export function saveStoredPassport(passport: CropHealthPassport): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PASSPORT_STORAGE_KEY, JSON.stringify(passport))
  } catch (err) {
    console.error('Failed to save crop health passport:', err)
  }
}

/**
 * Async API fetcher for passport
 */
export async function getPassport(passportId = 'KRA-2026-NK-00124'): Promise<CropHealthPassport> {
  const stored = getStoredPassport()
  if (stored.passportId === passportId) {
    return stored
  }
  return stored
}

/**
 * Add an officer verified diagnosis into the passport
 */
export async function addVerifiedRecordToPassport(
  recordData: Omit<PassportRecord, 'recordId' | 'verifiedAt'> & { recordId?: string; verifiedAt?: string }
): Promise<PassportRecord> {
  const passport = getStoredPassport()
  const recordId = recordData.recordId || `REC-2026-${Date.now().toString().slice(-6)}`
  const verifiedAt = recordData.verifiedAt || new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  const newRecord: PassportRecord = {
    ...recordData,
    recordId,
    verifiedAt,
    verificationStatus: 'Officer Verified',
  }

  // Remove duplicate if exists and prepend
  const filtered = passport.records.filter((r) => r.diagnosisId !== newRecord.diagnosisId && r.recordId !== newRecord.recordId)
  passport.records = [newRecord, ...filtered]
  passport.activeCrop = newRecord.crop

  saveStoredPassport(passport)
  return newRecord
}

/**
 * Check if a specific scan/diagnosis has been officer verified
 */
export function checkDiagnosisVerification(diagnosisId: string): PassportRecord | null {
  const passport = getStoredPassport()
  return passport.records.find((r) => r.diagnosisId === diagnosisId && r.verificationStatus === 'Officer Verified') || null
}
