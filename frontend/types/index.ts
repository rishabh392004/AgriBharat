export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical'
export type Severity = 'None' | 'Mild' | 'Moderate' | 'Severe'
export type ScanStatus = 'Healthy' | 'Needs attention'

export interface Farm { id: string; name: string; location: string; crop: string; area: string; health: ScanStatus; risk: RiskLevel; lastScan: string }
export interface Scan { id: string; date: string; crop: string; disease: string; confidence: number; severity: Severity; risk: RiskLevel; status: ScanStatus }
export interface Weather { temperature: string; humidity: string; rainProbability: string; wind: string; condition: string }
export interface Alert { id: string; type: 'Critical' | 'Warning' | 'Information'; title: string; detail: string; time: string; read: boolean }
export interface Prediction { scanId: string; crop: string; disease: string; confidence: number; severity: Severity; riskLevel: RiskLevel; symptoms: string[]; recommendations: string[] }
export interface OfficerMetric { label: string; value: string; change: string; tone: 'green' | 'amber' | 'red' | 'blue' }
export interface Report { id: string; farmer: string; farm: string; crop: string; issue: string; prediction: string; risk: RiskLevel; date: string; status: 'Pending' | 'Under Review' | 'Verified' | 'Resolved' }
export interface Hotspot { id: string; farm: string; location: string; crop: string; disease: string; risk: RiskLevel; x: number; y: number }
