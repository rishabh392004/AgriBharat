import { apiHttp, getStoredToken } from '@/lib/api-client'

export interface Farm {
  id: number
  userId: number
  name: string
  location: string
  cropType: string
  area: number
  createdAt: string
  updatedAt: string
}

export const farmService = {
  async getFarms(): Promise<Farm[]> {
    const token = getStoredToken()
    if (!token) return []

    try {
      const res = await apiHttp.get<{ farms: Farm[] }>('/farms')
      return res.farms || []
    } catch (err) {
      console.warn('[FarmService] Could not fetch farms:', err)
      return []
    }
  },

  async createFarm(data: { name: string; location: string; cropType: string; area: number }): Promise<Farm | null> {
    try {
      const res = await apiHttp.post<{ farm: Farm }>('/farms', data)
      return res.farm
    } catch (err) {
      console.warn('[FarmService] Could not create farm:', err)
      return null
    }
  },

  async updateFarm(id: number, data: Partial<{ name: string; location: string; cropType: string; area: number }>): Promise<Farm | null> {
    try {
      const res = await apiHttp.patch<{ farm: Farm }>(`/farms/${id}`, data)
      return res.farm
    } catch (err) {
      console.warn('[FarmService] Could not update farm:', err)
      return null
    }
  },

  async deleteFarm(id: number): Promise<boolean> {
    try {
      await apiHttp.delete(`/farms/${id}`)
      return true
    } catch (err) {
      console.warn('[FarmService] Could not delete farm:', err)
      return false
    }
  },
}
