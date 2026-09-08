'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { DEMO_FARMER } from '@/data/farmer'
import { authService } from '@/services/authService'
import { detectLiveLocation } from '@/lib/location'
import type { DemoFarmer, SessionUser } from '@/types'

type AuthContextValue = {
  user: SessionUser | null
  ready: boolean
  farmer: DemoFarmer
  setFarmer: (next: DemoFarmer | ((prev: DemoFarmer) => DemoFarmer)) => void
  signIn: (user: SessionUser) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [ready, setReady] = useState(false)
  const [farmer, setFarmerState] = useState<DemoFarmer>(DEMO_FARMER)

  useEffect(() => {
    const loadedUser = authService.load()
    setUser(loadedUser)
    const savedFarm = window.localStorage.getItem('kr-farmer')
    const isCustomUser = Boolean(loadedUser?.name && loadedUser.name !== 'Vijay Patil')

    if (savedFarm) {
      try {
        const parsed = JSON.parse(savedFarm)
        const isDefaultPatil = parsed.farmName === 'Patil Farm'
        const isDefaultNashik = parsed.location === 'Nashik, Maharashtra'
        const firstName = loadedUser?.name?.trim().split(/\s+/)[0] || 'My'

        const sanitizedFarmName = isCustomUser && isDefaultPatil
          ? `${firstName}'s Farm`
          : (parsed.farmName || `${DEMO_FARMER.farmName}`)

        const sanitizedLocation = isCustomUser && isDefaultNashik
          ? 'Detecting Live GPS...'
          : (parsed.location || DEMO_FARMER.location)

        setFarmerState({
          ...DEMO_FARMER,
          ...parsed,
          farmName: sanitizedFarmName,
          location: sanitizedLocation,
        })
      } catch {
        setFarmerState(DEMO_FARMER)
      }
    } else if (loadedUser?.name) {
      const parts = loadedUser.name.trim().split(/\s+/)
      const initials = parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase() || 'KB'
      const firstName = parts[0] || loadedUser.name

      setFarmerState({
        ...DEMO_FARMER,
        name: loadedUser.name,
        firstName,
        initials,
        mobile: loadedUser.phone || '',
        farmName: isCustomUser ? `${firstName}'s Farm` : DEMO_FARMER.farmName,
        location: isCustomUser ? 'Detecting Live GPS...' : DEMO_FARMER.location,
        farmArea: isCustomUser ? 0 : DEMO_FARMER.farmArea,
        primaryCrop: isCustomUser ? 'Not set' : DEMO_FARMER.primaryCrop,
        otherCrops: isCustomUser ? [] : DEMO_FARMER.otherCrops,
        experience: isCustomUser ? 0 : DEMO_FARMER.experience,
      })
    }
    setReady(true)

    // Automatically detect real live GPS location if not explicitly locked to a custom city
    detectLiveLocation()
      .then((loc) => {
        setFarmerState((prev) => {
          const shouldUpdate =
            !prev.location ||
            prev.location === 'Detecting Live GPS...' ||
            prev.location === 'Nashik, Maharashtra' ||
            prev.location === 'Click to detect Live GPS'

          if (shouldUpdate || isCustomUser) {
            const updated: DemoFarmer = {
              ...prev,
              location: loc.locationName,
              latitude: loc.latitude,
              longitude: loc.longitude,
            }
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('kr-farmer', JSON.stringify(updated))
            }
            return updated
          }
          return prev
        })
      })
      .catch(() => {
        // Location permission not yet granted or device offline
      })
  }, [])

  const setFarmer = (next: DemoFarmer | ((prev: DemoFarmer) => DemoFarmer)) => {
    setFarmerState((prev) => {
      const updated = typeof next === 'function' ? next(prev) : next
      const cleanName = updated.name?.trim() || 'Kisan User'
      const parts = cleanName.split(/\s+/)
      const initials = parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase() || 'KB'
      const firstName = parts[0] || cleanName

      const normalized: DemoFarmer = {
        ...updated,
        name: cleanName,
        firstName,
        initials,
      }

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('kr-farmer', JSON.stringify(normalized))
      }

      // Sync SessionUser across whole app (header, greetings, navbar)
      setUser((prevUser) => {
        const nextUser: SessionUser = prevUser
          ? { ...prevUser, name: cleanName, phone: normalized.mobile || prevUser.phone }
          : { name: cleanName, role: 'farmer', phone: normalized.mobile || DEMO_FARMER.mobile }
        authService.save(nextUser)
        return nextUser
      })

      // Sync with backend API
      authService.updateProfile({
        name: cleanName,
        mobile: normalized.mobile,
        location: normalized.location,
      }).catch(() => {})

      return normalized
    })
  }

  const signIn = (next: SessionUser) => {
    authService.save(next)
    setUser(next)

    // Also synchronize farmer profile name and initials
    setFarmerState((prev) => {
      const cleanName = next.name?.trim() || prev.name
      const parts = cleanName.split(/\s+/)
      const initials = parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase() || 'KB'
      const updated: DemoFarmer = {
        ...prev,
        name: cleanName,
        firstName: parts[0] || cleanName,
        initials,
        mobile: next.phone || prev.mobile,
      }
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('kr-farmer', JSON.stringify(updated))
      }
      return updated
    })
  }

  const signOut = () => {
    authService.logout()
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      ready,
      farmer,
      setFarmer,
      signIn,
      signOut,
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
