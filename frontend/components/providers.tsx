'use client'

import { I18nProvider } from '@/lib/i18n'
import { AuthProvider } from '@/lib/auth'
import { ToastHost } from '@/components/toast'
import { FloatingFarmerAiButton } from '@/components/floating-farmer-ai-button'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        {children}
        <FloatingFarmerAiButton />
        <ToastHost />
      </AuthProvider>
    </I18nProvider>
  )
}
