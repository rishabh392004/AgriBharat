'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { NearbyHelp } from '@/components/nearby-help'
import { useI18n } from '@/lib/i18n'

function HelpInner() {
  const { t } = useI18n()
  const disease = useSearchParams().get('for') || undefined
  return (
    <>
      <p className="kicker">📍 {t('nearbyTitle')}</p>
      <h1>{t('nearbyTitle')}</h1>
      <p className="muted">{t('nearbySub')}</p>
      <NearbyHelp disease={disease} />
    </>
  )
}

export default function HelpPage() {
  return (
    <Suspense>
      <HelpInner />
    </Suspense>
  )
}
