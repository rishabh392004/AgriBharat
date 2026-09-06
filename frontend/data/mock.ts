import type { Alert, Farm, Hotspot, OfficerMetric, Prediction, Report, Scan, Weather } from '@/types'

export const farms: Farm[] = [
  { id: 'F-1042', name: 'Shinde Family Farm', location: 'Nashik, Maharashtra', crop: 'Wheat', area: '4 acres', health: 'Needs attention', risk: 'High', lastScan: '30 Aug 2026' },
  { id: 'F-1043', name: 'Green Valley Plot', location: 'Pune, Maharashtra', crop: 'Tomato', area: '2.5 acres', health: 'Healthy', risk: 'Low', lastScan: '28 Aug 2026' },
  { id: 'F-1044', name: 'Riverbank Fields', location: 'Satara, Maharashtra', crop: 'Rice', area: '6 acres', health: 'Healthy', risk: 'Medium', lastScan: '25 Aug 2026' },
]
export const scans: Scan[] = [
  { id: 'SCAN123', date: '30 Aug 2026', crop: 'Wheat', disease: 'Leaf Rust', confidence: 94, severity: 'Moderate', risk: 'High', status: 'Needs attention' },
  { id: 'SCAN122', date: '22 Aug 2026', crop: 'Wheat', disease: 'Healthy', confidence: 91, severity: 'None', risk: 'Low', status: 'Healthy' },
  { id: 'SCAN121', date: '14 Aug 2026', crop: 'Tomato', disease: 'Early Blight', confidence: 87, severity: 'Mild', risk: 'Medium', status: 'Needs attention' },
]
export const weather: Weather = { temperature: '26°C', humidity: '82%', rainProbability: '65%', wind: '12 km/h', condition: 'Partly cloudy' }
export const alerts: Alert[] = [
  { id: 'A1', type: 'Critical', title: 'Leaf Rust detected nearby', detail: 'A high-risk case was reported within 5 km of your farm.', time: '2 hours ago', read: false },
  { id: 'A2', type: 'Warning', title: 'Weather may increase fungal risk', detail: 'High humidity and rain are expected through tomorrow.', time: '5 hours ago', read: false },
  { id: 'A3', type: 'Information', title: 'Your crop analysis is ready', detail: 'View the latest scan and recommended next steps.', time: 'Yesterday', read: true },
]
export const prediction: Prediction = { scanId: 'SCAN123', crop: 'Wheat', disease: 'Leaf Rust', confidence: 94, severity: 'Moderate', riskLevel: 'High', symptoms: ['Orange/brown spots on leaves', 'Leaf discoloration', 'Rust-like lesions'], recommendations: ['Remove severely infected leaves.', 'Monitor nearby plants daily.', 'Follow treatment guidance from a local agriculture expert.', 'Re-scan the crop after treatment.'] }
export const metrics: OfficerMetric[] = [
  { label: 'Total farms', value: '1,248', change: '+8.4%', tone: 'blue' }, { label: 'Healthy farms', value: '892', change: '+3.2%', tone: 'green' }, { label: 'At risk', value: '287', change: '+12.1%', tone: 'amber' }, { label: 'Critical cases', value: '69', change: '-4.6%', tone: 'red' },
]
export const reports: Report[] = [
  { id: 'R-8821', farmer: 'Vijay Patil', farm: 'Shinde Family Farm', crop: 'Wheat', issue: 'Orange spots', prediction: 'Leaf Rust', risk: 'High', date: '30 Aug 2026', status: 'Pending' },
  { id: 'R-8819', farmer: 'Anita Jadhav', farm: 'Green Valley Plot', crop: 'Tomato', issue: 'White powder', prediction: 'Powdery Mildew', risk: 'Medium', date: '29 Aug 2026', status: 'Under Review' },
  { id: 'R-8814', farmer: 'Ramesh Kale', farm: 'Riverbank Fields', crop: 'Rice', issue: 'Yellowing leaves', prediction: 'Healthy', risk: 'Low', date: '28 Aug 2026', status: 'Verified' },
]
export const hotspots: Hotspot[] = [
  { id: 'F-1042', farm: 'Shinde Family Farm', location: 'Nashik', crop: 'Wheat', disease: 'Leaf Rust', risk: 'High', x: 67, y: 36 }, { id: 'F-1034', farm: 'Patil Fields', location: 'Sinnar', crop: 'Wheat', disease: 'Leaf Rust', risk: 'High', x: 55, y: 48 }, { id: 'F-1021', farm: 'Green Valley Plot', location: 'Pune', crop: 'Tomato', disease: 'Healthy', risk: 'Low', x: 38, y: 67 }, { id: 'F-1018', farm: 'Riverbank Fields', location: 'Satara', crop: 'Rice', disease: 'Stem Borer', risk: 'Medium', x: 29, y: 76 },
]
