'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { NearbyHelp } from '@/components/nearby-help'
import { WhatsAppBanner } from '@/components/whatsapp/WhatsAppBanner'
import { useI18n } from '@/lib/i18n'

function HelpInner() {
  const { t } = useI18n()
  const disease = useSearchParams().get('for') || undefined
  return (
    <div className="space-y-4">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <p className="kicker">📍 {t('nearbyTitle')}</p>
          <h1 style={{ margin: '2px 0 4px' }}>{t('nearbyTitle')}</h1>
          <p className="muted" style={{ margin: 0 }}>{t('nearbySub')}</p>
        </div>
      </div>

      <WhatsAppBanner compact />

      <NearbyHelp disease={disease} />
    </div>
  )
}

export default function HelpPage() {
  return (
    <Suspense>
      <HelpInner />
    </Suspense>
  )
}
