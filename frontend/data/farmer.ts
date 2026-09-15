import type { DemoFarmer, DemoOfficer } from '@/types'

export const DEMO_FARMER: DemoFarmer = {
  name: 'Vijay Patil',
  firstName: 'Vijay',
  initials: 'VP',
  mobile: '+91 98765 43210',
  location: 'Nashik, Maharashtra',
  farmName: 'Patil Farm',
  farmArea: 4.5,
  primaryCrop: 'Wheat',
  otherCrops: ['Onion', 'Tomato'],
  experience: 12,
  language: 'mr',
  soilType: 'Black cotton soil',
  cropHealth: 82,
  diseaseRisk: 'Medium',
}

export const DEMO_OFFICER: DemoOfficer = {
  name: 'Dr. Meera Joshi',
  initials: 'MJ',
  mobile: '+91 99999 00000',
  role: 'officer',
  district: 'Nashik District',
}

export const NASHIK_CENTER = { lat: 19.9975, lng: 73.7898 }
