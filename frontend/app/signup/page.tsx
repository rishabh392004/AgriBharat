import { Suspense } from 'react'
import { KrishiDarpanAuth } from '@/components/krishi-darpan-auth'

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0e2a1f' }} />}>
      <KrishiDarpanAuth initialTab="signup" />
    </Suspense>
  )
}
