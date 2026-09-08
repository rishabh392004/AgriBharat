'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LanguageSelector } from '@/components/language-selector'
import { LeafMark } from '@/components/leaf-mark'
import { useAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'
import { authService } from '@/services/authService'

export default function SignupPage() {
  const { t } = useI18n()
  const { signIn } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

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
        <h1>{t('register')}</h1>
        <div className="field">
          <label>{t('name')}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>{t('phone')}</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
        </div>
        <div className="field">
          <label>{t('password')}</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button
          className="btn btn-primary"
          style={{ marginTop: 16 }}
          onClick={async () => {
            const user = await authService.register(name, phone, password)
            signIn(user)
            router.replace('/farmer')
          }}
        >
          {t('continue')}
        </button>
        <p className="note">
          <Link href="/login">{t('login')}</Link>
        </p>
      </section>
    </main>
  )
}
