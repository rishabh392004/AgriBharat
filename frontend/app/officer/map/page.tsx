'use client'

import { NearbyHelp } from '@/components/nearby-help'
import { useI18n } from '@/lib/i18n'

export default function OfficerMapPage() {
  const { t } = useI18n()
  return (
    <>
      <h1>{t('diseaseMap')}</h1>
      <p className="muted">Leaf rust cluster around Nashik — live OSM map</p>
      <NearbyHelp disease="Leaf Rust" />
    </>
  )
}
