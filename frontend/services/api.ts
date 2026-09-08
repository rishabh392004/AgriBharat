import { alerts, officerMetrics, regionalTrends, reports, scans, weather } from '@/data/mock'
import { authService } from '@/services/authService'
import { predictCrop } from '@/services/cropService'
import { getScanHistory } from '@/services/historyService'
import { getNearbyLocations } from '@/services/locationService'
import { replyToChat } from '@/services/chatbotService'

export const api = {
  login: authService.login,
  register: authService.register,
  predictCrop,
  sendChatMessage: async (q: string, disease?: string) => replyToChat(q, disease),
  getNearbyLocations,
  getScanHistory,
  getWeather: async () => weather,
  getAlerts: async () => alerts,
  getOfficerMetrics: async () => officerMetrics,
  getReports: async () => reports,
  getRegionalTrends: async () => regionalTrends,
  getScans: async () => scans,
}
