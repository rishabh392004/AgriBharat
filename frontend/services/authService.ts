import { DEMO_FARMER, DEMO_OFFICER } from '@/data/farmer'
import type { SessionUser } from '@/types'

const KEY = 'kr-session'

export const authService = {
  async login(phone: string, _password: string): Promise<SessionUser> {
    await wait(320)
    const officer = phone.replace(/\s/g, '').endsWith('0000') || phone.replace(/\s/g, '').endsWith('99')
    return officer
      ? { name: DEMO_OFFICER.name, role: 'officer', phone: phone || DEMO_OFFICER.mobile }
      : { name: DEMO_FARMER.name, role: 'farmer', phone: phone || DEMO_FARMER.mobile }
  },
  async register(name: string, phone: string): Promise<SessionUser> {
    await wait(320)
    return { name: name || DEMO_FARMER.name, role: 'farmer', phone }
  },
  async demoFarmer(): Promise<SessionUser> {
    await wait(180)
    return { name: DEMO_FARMER.name, role: 'farmer', phone: DEMO_FARMER.mobile }
  },
  async demoOfficer(): Promise<SessionUser> {
    await wait(180)
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
  },
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
