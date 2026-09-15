import { NASHIK_CENTER } from '@/data/farmer'
import type { NearbyPlace } from '@/types'

export const nearbyPlaces: NearbyPlace[] = [
  {
    id: 'seva',
    name: 'Krishi Seva Kendra',
    distanceKm: 2.4,
    distance: '2.4 km',
    category: 'Agriculture Supplies',
    status: 'Open',
    lat: 19.9998,
    lng: 73.7812,
    address: 'Trimbak Road, near CBS, Nashik',
    phone: '+91 98765 12001',
    relevantDiseases: ['Leaf Rust', 'Early Blight', 'Brown Spot', 'Bacterial Blight'],
  },
  {
    id: 'store',
    name: 'Nashik Agriculture Store',
    distanceKm: 3.1,
    distance: '3.1 km',
    category: 'Agriculture Store',
    status: 'Open',
    lat: 20.0042,
    lng: 73.7984,
    address: 'College Road, Nashik',
    phone: '+91 98765 12005',
    relevantDiseases: ['Leaf Rust', 'Early Blight'],
  },
  {
    id: 'fertilizer',
    name: 'Godavari Fertilizer Store',
    distanceKm: 3.8,
    distance: '3.8 km',
    category: 'Fertilizer Store',
    status: 'Open',
    lat: 19.9884,
    lng: 73.8021,
    address: 'Panchavati, Nashik',
    phone: '+91 98765 12004',
    relevantDiseases: ['Brown Spot', 'Leaf Rust'],
  },
  {
    id: 'expert',
    name: 'Agriculture Expert Center',
    distanceKm: 4.1,
    distance: '4.1 km',
    category: 'Crop Advisory',
    status: 'Open',
    lat: 20.0112,
    lng: 73.7746,
    address: 'Gangapur Road, Nashik',
    phone: '+91 98765 12002',
    relevantDiseases: ['Leaf Rust', 'Bacterial Blight', 'Early Blight'],
  },
  {
    id: 'govt',
    name: 'Government Agriculture Support Center',
    distanceKm: 5.8,
    distance: '5.8 km',
    category: 'Government Support',
    status: 'Open',
    lat: 19.9788,
    lng: 73.7689,
    address: 'Collector Office Complex, Nashik',
    phone: '+91 98765 12003',
    relevantDiseases: ['Leaf Rust', 'Early Blight', 'Brown Spot', 'Bacterial Blight'],
  },
]

export async function getNearbyLocations(disease?: string) {
  await new Promise((resolve) => setTimeout(resolve, 60))
  if (!disease) return nearbyPlaces
  return [...nearbyPlaces].sort((a, b) => {
    const aHit = a.relevantDiseases.includes(disease) ? 0 : 1
    const bHit = b.relevantDiseases.includes(disease) ? 0 : 1
    return aHit - bHit || a.distanceKm - b.distanceKm
  })
}

export function getMapCenter() {
  return NASHIK_CENTER
}
