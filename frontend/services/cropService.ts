import { predictionsByCrop } from '@/data/mock'
import type { Prediction } from '@/types'

export const CROPS = [
  'Wheat',
  'Tomato',
  'Rice',
  'Cotton',
  'Onion',
  'Potato',
  'Sugarcane',
  'Soybean',
  'Mustard',
  'Maize',
  'Chilli',
  'Banana',
  'Mango',
  'Groundnut',
  'Chickpea',
  'Brinjal',
] as const

export type CropName = (typeof CROPS)[number]

export interface CropInfo {
  name: CropName
  hindi: string
  marathi: string
  icon: string
  image: string
  commonDiseases: string[]
}

export const CROP_METADATA: Record<CropName, CropInfo> = {
  Wheat: {
    name: 'Wheat',
    hindi: 'गेहूं',
    marathi: 'गहू',
    icon: '🌾',
    image: '/images/crops/wheat.jpg',
    commonDiseases: ['Leaf Rust', 'Powdery Mildew', 'Yellow Rust'],
  },
  Tomato: {
    name: 'Tomato',
    hindi: 'टमाटर',
    marathi: 'टोमॅटो',
    icon: '🍅',
    image: '/images/crops/tomato.jpg',
    commonDiseases: ['Early Blight', 'Late Blight', 'Leaf Mold'],
  },
  Rice: {
    name: 'Rice',
    hindi: 'धान / चावल',
    marathi: 'भात / तांदूळ',
    icon: '🌱',
    image: '/images/crops/rice.jpg',
    commonDiseases: ['Brown Spot', 'Bacterial Leaf Blight', 'Blast'],
  },
  Cotton: {
    name: 'Cotton',
    hindi: 'कपास',
    marathi: 'कापूस',
    icon: '☁️',
    image: '/images/crops/cotton.jpg',
    commonDiseases: ['Bacterial Blight', 'Leaf Curl Virus', 'Alternaria Leaf Spot'],
  },
  Onion: {
    name: 'Onion',
    hindi: 'प्याज',
    marathi: 'कांदा',
    icon: '🧅',
    image: '/images/crops/onion.jpg',
    commonDiseases: ['Purple Blotch', 'Stemphylium Leaf Blight', 'Downy Mildew'],
  },
  Potato: {
    name: 'Potato',
    hindi: 'आलू',
    marathi: 'बटाटा',
    icon: '🥔',
    image: '/images/crops/potato.jpg',
    commonDiseases: ['Late Blight', 'Early Blight', 'Black Scurf'],
  },
  Sugarcane: {
    name: 'Sugarcane',
    hindi: 'गन्ना',
    marathi: 'ऊस',
    icon: '🎋',
    image: '/images/crops/sugarcane.jpg',
    commonDiseases: ['Red Rot', 'Smut', 'Grassy Shoot'],
  },
  Soybean: {
    name: 'Soybean',
    hindi: 'सोयाबीन',
    marathi: 'सोयाबीन',
    icon: '🫘',
    image: '/images/crops/soybean.jpg',
    commonDiseases: ['Yellow Mosaic Virus', 'Anthracnose', 'Rust'],
  },
  Mustard: {
    name: 'Mustard',
    hindi: 'सरसों',
    marathi: 'मोहरी',
    icon: '🌼',
    image: '/images/crops/mustard.jpg',
    commonDiseases: ['White Rust', 'Alternaria Blight', 'Downy Mildew'],
  },
  Maize: {
    name: 'Maize',
    hindi: 'मक्का',
    marathi: 'मका',
    icon: '🌽',
    image: '/images/crops/maize.jpg',
    commonDiseases: ['Fall Armyworm', 'Turcicum Leaf Blight', 'Common Rust'],
  },
  Chilli: {
    name: 'Chilli',
    hindi: 'हरी मिर्च',
    marathi: 'मिरची',
    icon: '🌶️',
    image: '/images/crops/chilli.jpg',
    commonDiseases: ['Chilli Leaf Curl', 'Anthracnose / Die Back', 'Powdery Mildew'],
  },
  Banana: {
    name: 'Banana',
    hindi: 'केला',
    marathi: 'केळी',
    icon: '🍌',
    image: '/images/crops/banana.jpg',
    commonDiseases: ['Sigatoka Leaf Spot', 'Panama Wilt', 'Banana Bunchy Top'],
  },
  Mango: {
    name: 'Mango',
    hindi: 'आम',
    marathi: 'आंबा',
    icon: '🥭',
    image: '/images/crops/mango.jpg',
    commonDiseases: ['Anthracnose', 'Powdery Mildew', 'Die Back'],
  },
  Groundnut: {
    name: 'Groundnut',
    hindi: 'मूंगफली',
    marathi: 'भुईमूग',
    icon: '🥜',
    image: '/images/crops/groundnut.jpg',
    commonDiseases: ['Tikka Disease (Leaf Spot)', 'Collar Rot', 'Rust'],
  },
  Chickpea: {
    name: 'Chickpea',
    hindi: 'चना',
    marathi: 'हरभरा',
    icon: '🥣',
    image: '/images/crops/chickpea.jpg',
    commonDiseases: ['Fusarium Wilt', 'Ascochyta Blight', 'Dry Root Rot'],
  },
  Brinjal: {
    name: 'Brinjal',
    hindi: 'बैंगन',
    marathi: 'वांगी',
    icon: '🍆',
    image: '/images/crops/brinjal.jpg',
    commonDiseases: ['Shoot & Fruit Borer', 'Phomopsis Blight', 'Little Leaf Disease'],
  },
}

export async function predictCrop(image: File | Blob | string | null, crop = 'Wheat'): Promise<Prediction> {
  await new Promise((resolve) => setTimeout(resolve, 1200))
  
  let customImageUrl: string | undefined
  if (typeof image === 'string') {
    customImageUrl = image
  } else if (image instanceof Blob && typeof window !== 'undefined') {
    customImageUrl = URL.createObjectURL(image)
  }

  const base = predictionsByCrop[crop] ?? predictionsByCrop.Wheat
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  
  return {
    ...base,
    scanId: `SCAN-${randomSuffix}`,
    confidence: base.confidence || Math.floor(89 + Math.random() * 9),
    imageUrl: customImageUrl || base.imageUrl,
    explanation: base.explanation || `AI detected disease patterns on your ${crop} leaf consistent with ${base.disease}.`,
    attentionPoints: base.attentionPoints || [
      { x: 45, y: 45, radius: 48, intensity: 0.94, label: 'Primary Pathogen Lesion' },
      { x: 60, y: 55, radius: 36, intensity: 0.82, label: 'Secondary Symptom Zone' },
    ],
  }
}

