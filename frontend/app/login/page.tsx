'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LanguageSelector } from '@/components/language-selector'
import { LeafMark } from '@/components/leaf-mark'
import { toast } from '@/components/toast'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { authService } from '@/services/authService'

export default function LoginPage() {
  const { t } = useI18n()
  const { signIn } = useAuth()
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const go = async (user: Awaited<ReturnType<typeof authService.login>>) => {
    signIn(user)
    router.replace(user.role === 'officer' ? '/officer' : '/farmer')
  }

  return (
    <main className="auth">
      <section className="auth-card">
        <div className="auth-head">
          <div className="mini-brand">
            <span>
              <LeafMark />
            </span>
            {t('brand')}
          </div>
          <LanguageSelector />
        </div>
        <h1>{t('welcome')} 👋</h1>
        <p className="muted">{t('subtitle')}</p>
        <div className="field">
          <label>{t('phone')}</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="98765 43210" />
        </div>
        <div className="field">
          <label>{t('password')}</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <div className="row-links">
          <button type="button" onClick={() => toast(t('forgotToast'))}>
            {t('forgot')}
          </button>
          <Link href="/signup">{t('create')}</Link>
        </div>
        <button
          className="btn btn-primary"
          disabled={busy}
          onClick={async () => {
            setBusy(true)
            await go(await authService.login(phone, password))
            setBusy(false)
          }}
        >
          {t('continue')}
        </button>
        <div className="demo-stack">
          <button className="btn btn-gold" onClick={async () => go(await authService.demoFarmer())}>
            {t('demoFarmer')}
          </button>
          <button className="btn btn-ghost" onClick={async () => go(await authService.demoOfficer())}>
            {t('demoOfficer')}
          </button>
        </div>
        <p className="note">{t('demoNote')}</p>
      </section>
    </main>
  )
}
