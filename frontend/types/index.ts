export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical'
export type Severity = 'None' | 'Mild' | 'Moderate' | 'Severe'
export type ScanStatus = 'Healthy' | 'Needs attention'
export type UserRole = 'farmer' | 'officer'

export interface DemoFarmer {
  name: string
  firstName: string
  initials: string
  mobile: string
  location: string
  farmName: string
  farmArea: number
  primaryCrop: string
  otherCrops: string[]
  experience: number
  language: 'mr'
  soilType: string
  cropHealth: number
  diseaseRisk: RiskLevel
  latitude?: number
  longitude?: number
}

export interface DemoOfficer {
  name: string
  initials: string
  mobile: string
  role: 'officer'
  district: string
}

export interface SessionUser {
  name: string
  role: UserRole
  phone: string
}

export interface ScanRecord {
  id: string
  date: string
  dateIso: string
  crop: string
  disease: string
  confidence: number
  severity: Severity
  risk: RiskLevel
  status: ScanStatus
  thumb: string
  precautions: string[]
  actions: string[]
  expertHelp: string
  symptoms: string[]
}

export interface WeatherSnapshot {
  temperature: number
  humidity: number
  rainProbability: number
  wind: string
  condition: string
}

export interface AlertItem {
  id: string
  type: 'Critical' | 'Warning' | 'Information'
  title: string
  detail: string
  time: string
  read: boolean
}

export interface AttentionPoint {
  x: number // percentage 0-100 across image width
  y: number // percentage 0-100 across image height
  radius: number // pixel radius relative to canvas
  intensity: number // 0.0 - 1.0 focus weight
  label?: string
}

export interface Prediction {
  scanId: string
  crop: string
  disease: string
  confidence: number
  severity: Severity
  riskLevel: RiskLevel
  symptoms: string[]
  precautions: string[]
  actions: string[]
  expertHelp: string
  // Explainable AI / Grad-CAM extensions
  imageUrl?: string
  gradCamImage?: string
  heatmapUrl?: string
  explanationImage?: string
  explanation?: string
  attentionPoints?: AttentionPoint[]
  voiceAdvisoryUrl?: string
  voiceAdvisoryDuration?: string
}

export interface NearbyPlace {
  id: string
  name: string
  distanceKm: number
  distance: string
  category: string
  status: 'Open' | 'Closed'
  lat: number
  lng: number
  address: string
  phone: string
  relevantDiseases: string[]
}

export interface OfficerMetric {
  id: string
  labelKey: string
  value: number
  suffix?: string
  change: string
  tone: 'green' | 'amber' | 'red' | 'gold'
}

export interface Report {
  id: string
  farmer: string
  farm: string
  crop: string
  issue: string
  prediction: string
  risk: RiskLevel
  date: string
  status: 'Pending' | 'Under Review' | 'Verified' | 'Resolved'
}

export interface ChatMessage {
  id: string
  from: 'ai' | 'user'
  text: string
  time: string
  image?: string
}

export interface RegionalTrend {
  crop: string
  disease: string
  change: number
  farms: number
}

export type ReviewStatus = 'Pending' | 'Selected' | 'Rejected'
export type RiskLabel = 'Low' | 'Medium' | 'High' | 'Critical'

export interface ReviewRecord {
  id: string
  refId: string
  farmer: string
  location: string
  crop: string
  disease: string
  confidence: number
  severity: Severity
  riskLevel: RiskLevel
  submittedDate: string
  status: ReviewStatus
  imageThumb: string
  symptoms: string[]
  recommendations: string[]
  weatherContext: string
  rejectionReason?: string
}

export interface ForecastDay {
  label: string
  high: number
  low: number
  rainProbability: number
  icon: string
  condition: string
}

export interface CropWeatherInsight {
  icon: string
  headline: string
  advice: string
  urgency: 'info' | 'warning' | 'caution'
}

export interface WeatherFull extends WeatherSnapshot {
  feelsLike: number
  uvIndex: number
  location: string
  forecast: ForecastDay[]
  insights: CropWeatherInsight[]
}

export interface PassportRecord {
  recordId: string
  diagnosisId: string
  date: string
  dateIso: string
  crop: string
  disease: string
  aiConfidence: number
  severity: Severity
  riskLevel: RiskLevel
  verificationStatus: 'Officer Verified' | 'Awaiting Verification' | 'Rejected'
  locationName: string
  latitude: number
  longitude: number
  officerId: string
  officerName: string
  officerDesignation: string
  officerNotes: string
  recommendedAction: string
  symptoms: string[]
  verifiedAt: string
}

export interface CropHealthPassport {
  passportId: string
  farmerId: string
  farmerName: string
  farmName: string
  location: string
  farmArea: string
  season: string
  activeCrop: string
  createdAt: string
  records: PassportRecord[]
}

export type SeasonType = 'Kharif 2024' | 'Rabi 2024-25' | 'Zaid 2025' | 'Kharif 2025' | 'Rabi 2025-26' | 'Kharif 2026'

export interface HotspotCluster {
  id: string
  lat: number
  lng: number
  district: string
  state: string
  crop: string
  disease: string
  severity: Severity | RiskLevel | string
  reportedCasesCount: number
  radiusMeters: number
  lastReportedTime: string
  riskFactor: string
  officerValidatedCount: number
}

