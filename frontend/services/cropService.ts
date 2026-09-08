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
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&auto=format&fit=crop&q=80',
    commonDiseases: ['Leaf Rust', 'Powdery Mildew', 'Yellow Rust'],
  },
  Tomato: {
    name: 'Tomato',
    hindi: 'टमाटर',
    marathi: 'टोमॅटो',
    icon: '🍅',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&auto=format&fit=crop&q=80',
    commonDiseases: ['Early Blight', 'Late Blight', 'Leaf Mold'],
  },
  Rice: {
    name: 'Rice',
    hindi: 'धान / चावल',
    marathi: 'भात / तांदूळ',
    icon: '🌱',
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=300&auto=format&fit=crop&q=80',
    commonDiseases: ['Brown Spot', 'Bacterial Leaf Blight', 'Blast'],
  },
  Cotton: {
    name: 'Cotton',
    hindi: 'कपास',
    marathi: 'कापूस',
    icon: '☁️',
    image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=300&auto=format&fit=crop&q=80',
    commonDiseases: ['Bacterial Blight', 'Leaf Curl Virus', 'Alternaria Leaf Spot'],
  },
  Onion: {
    name: 'Onion',
    hindi: 'प्याज',
    marathi: 'कांदा',
    icon: '🧅',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300&auto=format&fit=crop&q=80',
    commonDiseases: ['Purple Blotch', 'Stemphylium Leaf Blight', 'Downy Mildew'],
  },
  Potato: {
    name: 'Potato',
    hindi: 'आलू',
    marathi: 'बटाटा',
    icon: '🥔',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&auto=format&fit=crop&q=80',
    commonDiseases: ['Late Blight', 'Early Blight', 'Black Scurf'],
  },
  Sugarcane: {
    name: 'Sugarcane',
    hindi: 'गन्ना',
    marathi: 'ऊस',
    icon: '🎋',
    image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=300&auto=format&fit=crop&q=80',
    commonDiseases: ['Red Rot', 'Smut', 'Grassy Shoot'],
  },
  Soybean: {
    name: 'Soybean',
    hindi: 'सोयाबीन',
    marathi: 'सोयाबीन',
    icon: '🫘',
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=300&auto=format&fit=crop&q=80',
    commonDiseases: ['Yellow Mosaic Virus', 'Anthracnose', 'Rust'],
  },
  Mustard: {
    name: 'Mustard',
    hindi: 'सरसों',
    marathi: 'मोहरी',
    icon: '🌼',
    image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=300&auto=format&fit=crop&q=80',
    commonDiseases: ['White Rust', 'Alternaria Blight', 'Downy Mildew'],
  },
  Maize: {
    name: 'Maize',
    hindi: 'मक्का',
    marathi: 'मका',
    icon: '🌽',
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&auto=format&fit=crop&q=80',
    commonDiseases: ['Fall Armyworm', 'Turcicum Leaf Blight', 'Common Rust'],
  },
  Chilli: {
    name: 'Chilli',
    hindi: 'हरी मिर्च',
    marathi: 'मिरची',
    icon: '🌶️',
    image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=300&auto=format&fit=crop&q=80',
    commonDiseases: ['Chilli Leaf Curl', 'Anthracnose / Die Back', 'Powdery Mildew'],
  },
  Banana: {
    name: 'Banana',
    hindi: 'केला',
    marathi: 'केळी',
    icon: '🍌',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&auto=format&fit=crop&q=80',
    commonDiseases: ['Sigatoka Leaf Spot', 'Panama Wilt', 'Banana Bunchy Top'],
  },
  Mango: {
    name: 'Mango',
    hindi: 'आम',
    marathi: 'आंबा',
    icon: '🥭',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300&auto=format&fit=crop&q=80',
    commonDiseases: ['Anthracnose', 'Powdery Mildew', 'Die Back'],
  },
  Groundnut: {
    name: 'Groundnut',
    hindi: 'मूंगफली',
    marathi: 'भुईमूग',
    icon: '🥜',
    image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=300&auto=format&fit=crop&q=80',
    commonDiseases: ['Tikka Disease (Leaf Spot)', 'Collar Rot', 'Rust'],
  },
  Chickpea: {
    name: 'Chickpea',
    hindi: 'चना',
    marathi: 'हरभरा',
    icon: '🥣',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
    commonDiseases: ['Fusarium Wilt', 'Ascochyta Blight', 'Dry Root Rot'],
  },
  Brinjal: {
    name: 'Brinjal',
    hindi: 'बैंगन',
    marathi: 'वांगी',
    icon: '🍆',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=300&auto=format&fit=crop&q=80',
    commonDiseases: ['Shoot & Fruit Borer', 'Phomopsis Blight', 'Little Leaf Disease'],
  },
}

export async function predictCrop(image: File | Blob | null, crop = 'Wheat'): Promise<Prediction> {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  const base = predictionsByCrop[crop] ?? predictionsByCrop.Wheat

  // Realistic scanning delay
  await new Promise((resolve) => setTimeout(resolve, 600))
  void image

  return {
    ...base,
    scanId: `SCAN-${randomSuffix}`,
    confidence: Math.floor(89 + Math.random() * 9),
  }
}

