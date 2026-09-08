/**
 * Krishi Darpan - Centralized WhatsApp & Fallback Channel Configuration
 * 
 * Provides API endpoints, official phone numbers, message templates,
 * and deep links for the "No-App" WhatsApp diagnosis channel.
 */

export interface WhatsAppConfig {
  phoneNumber: string
  displayNumber: string
  ivrTollFreeNumber: string
  defaultMessage: string
  apiBaseUrl: string
  webhookEndpoint: string
  businessAccountId?: string
  supportedMediaTypes: string[]
  maxFileSizeMb: number
}

export const WHATSAPP_CONFIG: WhatsAppConfig = {
  // Configured WhatsApp Business phone number (E.164 format without '+')
  phoneNumber: process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '918005747440',
  displayNumber: '+91 800-KRISHI-01 (+91 80057 47440)',
  ivrTollFreeNumber: '1800-180-1551',
  defaultMessage: 'Namaste Krishi Darpan! I want to diagnose my crop disease and receive precautions in my language.',
  apiBaseUrl: process.env.NEXT_PUBLIC_WHATSAPP_API_URL || '/api/whatsapp',
  webhookEndpoint: '/api/whatsapp/webhook',
  businessAccountId: process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_ID || 'WA_BIZ_KRISHI_DARPAN',
  supportedMediaTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSizeMb: 16,
}

/**
 * Generate a direct WhatsApp click-to-chat deep link
 */
export function getWhatsAppDeepLink(customMessage?: string, cropContext?: string): string {
  const message = customMessage || (cropContext
    ? `Namaste Krishi Darpan! Please diagnose my ${cropContext} leaf photo and advise precautions.`
    : WHATSAPP_CONFIG.defaultMessage)

  const encoded = encodeURIComponent(message)
  return `https://wa.me/${WHATSAPP_CONFIG.phoneNumber}?text=${encoded}`
}

/**
 * WhatsApp Fallback Channel Step-by-Step Guide
 */
export interface WhatsAppFlowStep {
  step: number
  icon: string
  titleKey: string
  descKey: string
  actionKey?: string
}

export const WHATSAPP_FLOW_STEPS: WhatsAppFlowStep[] = [
  {
    step: 1,
    icon: '📱',
    titleKey: 'whatsappStep1Title',
    descKey: 'whatsappStep1Desc',
  },
  {
    step: 2,
    icon: '📷',
    titleKey: 'whatsappStep2Title',
    descKey: 'whatsappStep2Desc',
  },
  {
    step: 3,
    icon: '🤖',
    titleKey: 'whatsappStep3Title',
    descKey: 'whatsappStep3Desc',
  },
  {
    step: 4,
    icon: '🔊',
    titleKey: 'whatsappStep4Title',
    descKey: 'whatsappStep4Desc',
  },
]
