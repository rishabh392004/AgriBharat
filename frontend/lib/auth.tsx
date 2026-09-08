'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { DEMO_FARMER } from '@/data/farmer'
import { authService } from '@/services/authService'
import type { DemoFarmer, SessionUser } from '@/types'

type AuthContextValue = {
  user: SessionUser | null
  ready: boolean
  farmer: DemoFarmer
  setFarmer: (next: DemoFarmer) => void
  signIn: (user: SessionUser) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [ready, setReady] = useState(false)
  const [farmer, setFarmer] = useState<DemoFarmer>(DEMO_FARMER)

  useEffect(() => {
    setUser(authService.load())
    const savedFarm = window.localStorage.getItem('kr-farmer')
    if (savedFarm) {
      try {
        setFarmer({ ...DEMO_FARMER, ...JSON.parse(savedFarm) })
      } catch {
        setFarmer(DEMO_FARMER)
      }
    }
    setReady(true)
  }, [])

  const value = useMemo(
    () => ({
      user,
      ready,
      farmer,
      setFarmer: (next: DemoFarmer) => {
        setFarmer(next)
        window.localStorage.setItem('kr-farmer', JSON.stringify(next))
      },
      signIn: (next: SessionUser) => {
        authService.save(next)
        setUser(next)
      },
      signOut: () => {
        authService.logout()
        setUser(null)
      },
    }),
    [user, ready, farmer],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
