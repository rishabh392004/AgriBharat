import { DEMO_FARMER, DEMO_OFFICER } from '@/data/farmer'
import { apiHttp, setStoredToken, removeStoredToken } from '@/lib/api-client'
import type { SessionUser } from '@/types'

const KEY = 'kr-session'

export const authService = {
  async login(identifier: string, password = '', preferredRole?: 'farmer' | 'officer'): Promise<SessionUser> {
    const isEmail = identifier.includes('@')
    const cleanId = identifier.trim().replace(/\s+/g, '')
    const email = isEmail ? identifier.trim() : `${cleanId.toLowerCase()}@agribharat.com`
    const safePassword = password ? password.trim() : ''

    // Attempt real backend authentication
    try {
      const res = await apiHttp.post<{
        token: string
        user: { id: number; email: string; name?: string; role: string }
      }>('/auth/login', { email, password: safePassword })

      if (res && res.token && res.user) {
        setStoredToken(res.token)
        const backendRole = res.user.role?.toLowerCase()
        const role: 'farmer' | 'officer' =
          preferredRole === 'officer' || backendRole === 'officer' ? 'officer' : 'farmer'
        return {
          name: res.user.name || (role === 'officer' ? DEMO_OFFICER.name : DEMO_FARMER.name),
          role,
          phone: identifier,
        }
      }
    } catch (err) {
      console.warn('Backend login endpoint unavailable or rejected, using smart demo session:', err)
    }

    await wait(250)
    const isOfficer =
      preferredRole === 'officer' ||
      cleanId.endsWith('0000') ||
      cleanId.endsWith('99') ||
      cleanId.toLowerCase().includes('officer')

    return isOfficer
      ? { name: DEMO_OFFICER.name, role: 'officer', phone: identifier || DEMO_OFFICER.mobile }
      : { name: DEMO_FARMER.name, role: 'farmer', phone: identifier || DEMO_FARMER.mobile }
  },

  async register(name: string, identifier: string, password = '', farmName?: string, preferredRole?: 'farmer' | 'officer'): Promise<SessionUser> {
    const isEmail = identifier.includes('@')
    const cleanId = identifier.trim().replace(/\s+/g, '')
    const email = isEmail ? identifier.trim() : `${cleanId.toLowerCase()}@agribharat.com`
    const safePassword = password ? password.trim() : ''
    const safeName = name?.trim() || (preferredRole === 'officer' ? DEMO_OFFICER.name : 'Kisan User')

    try {
      const res = await apiHttp.post<{
        token: string
        user: { id: number; email: string; name?: string; role: string }
      }>('/auth/register', { email, password: safePassword, name: safeName })

      if (res && res.token && res.user) {
        setStoredToken(res.token)
        const backendRole = res.user.role?.toLowerCase()
        const role: 'farmer' | 'officer' =
          preferredRole === 'officer' || backendRole === 'officer' ? 'officer' : 'farmer'
        return {
          name: res.user.name || safeName,
          role,
          phone: identifier,
          ...(farmName ? { farmName } : {}),
        }
      }
    } catch (err) {
      // If user already exists, seamlessly attempt login
      try {
        const loginRes = await apiHttp.post<{
          token: string
          user: { id: number; email: string; name?: string; role: string }
        }>('/auth/login', { email, password: safePassword })

        if (loginRes && loginRes.token && loginRes.user) {
          setStoredToken(loginRes.token)
          const backendRole = loginRes.user.role?.toLowerCase()
          const role: 'farmer' | 'officer' =
            preferredRole === 'officer' || backendRole === 'officer' ? 'officer' : 'farmer'
          return {
            name: loginRes.user.name || safeName,
            role,
            phone: identifier,
            ...(farmName ? { farmName } : {}),
          }
        }
      } catch {
        // Continue to session fallback
      }
      console.warn('Backend register failed or unavailable, fallback to session:', err)
    }

    await wait(250)
    const role: 'farmer' | 'officer' = preferredRole === 'officer' ? 'officer' : 'farmer'
    return { name: safeName, role, phone: identifier, ...(farmName ? { farmName } : {}) }
  },

  async demoFarmer(): Promise<SessionUser> {
    await wait(150)
    return { name: DEMO_FARMER.name, role: 'farmer', phone: DEMO_FARMER.mobile }
  },

  async demoOfficer(): Promise<SessionUser> {
    await wait(150)
    return { name: DEMO_OFFICER.name, role: 'officer', phone: DEMO_OFFICER.mobile }
  },

  save(user: SessionUser) {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(KEY, JSON.stringify(user))
  },

  load(): SessionUser | null {
    if (typeof window === 'undefined') return null
    try {
      const raw = window.localStorage.getItem(KEY)
      return raw ? (JSON.parse(raw) as SessionUser) : null
    } catch {
      return null
    }
  },

  async updateProfile(data: { name?: string; mobile?: string; location?: string }): Promise<void> {
    try {
      if (data.name) {
        await apiHttp.patch('/auth/me', { name: data.name })
      }
    } catch (err) {
      console.warn('Backend profile update failed or offline, kept in local session:', err)
    }
  },

  logout() {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(KEY)
    removeStoredToken()
  },
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
