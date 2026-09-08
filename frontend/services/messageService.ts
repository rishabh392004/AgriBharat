import { apiHttp, getStoredToken } from '@/lib/api-client'

export interface MessageItem {
  id: number
  fromUserId: number
  toUserId: number
  content: string
  isRead: boolean
  createdAt: string
  from?: { id: number; name?: string; email: string; role: string }
  to?: { id: number; name?: string; email: string; role: string }
}

export interface ConversationThread {
  userId: number
  userName?: string
  lastMessage?: string
  lastMessageAt?: string
  unreadCount?: number
}

export const messageService = {
  async getConversations(): Promise<ConversationThread[]> {
    const token = getStoredToken()
    if (!token) return []

    try {
      const res = await apiHttp.get<{ conversations: ConversationThread[] }>('/messages/conversations')
      return res.conversations || []
    } catch (err) {
      console.warn('[MessageService] Could not fetch conversations:', err)
      return []
    }
  },

  async getMessages(targetUserId: number): Promise<MessageItem[]> {
    const token = getStoredToken()
    if (!token) return []

    try {
      const res = await apiHttp.get<{ messages: MessageItem[] }>(`/messages/${targetUserId}`)
      return res.messages || []
    } catch (err) {
      console.warn(`[MessageService] Could not fetch messages with user ${targetUserId}:`, err)
      return []
    }
  },

  async sendMessage(targetUserId: number, content: string): Promise<MessageItem | null> {
    const token = getStoredToken()
    if (!token) return null

    try {
      const res = await apiHttp.post<{ message: MessageItem }>(`/messages/${targetUserId}`, { content })
      return res.message || null
    } catch (err) {
      console.warn(`[MessageService] Could not send message to user ${targetUserId}:`, err)
      return null
    }
  },

  async getOfficers(): Promise<{ id: number; name?: string; email: string; designation?: string; district?: string }[]> {
    try {
      const res = await apiHttp.get<{ officers: any[] }>('/messages/officers')
      return res.officers || []
    } catch (err) {
      console.warn('[MessageService] Could not fetch officers list:', err)
      return []
    }
  },
}
