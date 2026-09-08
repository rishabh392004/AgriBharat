'use client'

import { I18nProvider } from '@/lib/i18n'
import { AuthProvider } from '@/lib/auth'
import { ToastHost } from '@/components/toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        {children}
        <ToastHost />
      </AuthProvider>
    </I18nProvider>
  )
}
