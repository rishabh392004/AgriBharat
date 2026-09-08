import { DEMO_FARMER, DEMO_OFFICER } from '@/data/farmer'
import { apiHttp, setStoredToken, removeStoredToken } from '@/lib/api-client'
import type { SessionUser } from '@/types'

const KEY = 'kr-session'

export const authService = {
  async login(identifier: string, password = 'password123'): Promise<SessionUser> {
    const isEmail = identifier.includes('@')
    const email = isEmail ? identifier.trim() : `${identifier.replace(/\D/g, '')}@agribharat.com`

    // Attempt real backend authentication
    try {
      const res = await apiHttp.post<{
        token: string
        user: { id: number; email: string; name?: string; role: string }
      }>('/auth/login', { email, password })

      if (res && res.token && res.user) {
        setStoredToken(res.token)
        const role = res.user.role?.toLowerCase() === 'officer' ? 'officer' : 'farmer'
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
    const officer = identifier.replace(/\s/g, '').endsWith('0000') || identifier.replace(/\s/g, '').endsWith('99')
    return officer
      ? { name: DEMO_OFFICER.name, role: 'officer', phone: identifier || DEMO_OFFICER.mobile }
      : { name: DEMO_FARMER.name, role: 'farmer', phone: identifier || DEMO_FARMER.mobile }
  },

  async register(name: string, identifier: string, password = 'password123'): Promise<SessionUser> {
    const isEmail = identifier.includes('@')
    const email = isEmail ? identifier.trim() : `${identifier.replace(/\D/g, '')}@agribharat.com`

    try {
      const res = await apiHttp.post<{
        token: string
        user: { id: number; email: string; name?: string; role: string }
      }>('/auth/register', { email, password, name })

      if (res && res.token && res.user) {
        setStoredToken(res.token)
        const role = res.user.role?.toLowerCase() === 'officer' ? 'officer' : 'farmer'
        return {
          name: res.user.name || name,
          role,
          phone: identifier,
        }
      }
    } catch (err) {
      console.warn('Backend register failed or unavailable, fallback to session:', err)
    }

    await wait(250)
    return { name: name || DEMO_FARMER.name, role: 'farmer', phone: identifier }
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

  logout() {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(KEY)
    removeStoredToken()
  },
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
