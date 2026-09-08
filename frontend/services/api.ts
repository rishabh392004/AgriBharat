import { alerts, officerMetrics, regionalTrends, reports, scans, weather } from '@/data/mock'
import { apiHttp, getStoredToken } from '@/lib/api-client'
import { authService } from '@/services/authService'
import { predictCrop } from '@/services/cropService'
import { getScanHistory } from '@/services/historyService'
import { getNearbyLocations } from '@/services/locationService'
import { sendChatMessage } from '@/services/chatbotService'

export const api = {
  login: authService.login,
  register: authService.register,
  predictCrop,
  sendChatMessage: async (q: string, disease?: string) => sendChatMessage(q, disease),
  getNearbyLocations,
  getScanHistory,
  getWeather: async () => weather,
  getAlerts: async () => alerts,
  getOfficerMetrics: async () => officerMetrics,
  getOfficerProfile: async () => {
    const token = getStoredToken()
    if (token) {
      try {
        const res = await apiHttp.get('/officer/me')
        if (res && res.profile) return res.profile
      } catch (err) {
        console.warn('Could not fetch officer profile, using default:', err)
      }
    }
    return null
  },
  getReports: async () => reports,
  getRegionalTrends: async () => regionalTrends,
  getScans: async () => scans,
}
