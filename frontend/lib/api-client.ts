/**
 * Centralized API Client for AgriBharat Frontend
 * Handles base URLs, token authentication, and unified error handling.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'

const TOKEN_KEY = 'agribharat-token'

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function removeStoredToken() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(TOKEN_KEY)
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

export async function apiClient<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...customConfig } = options

  let url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`

  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })
    const query = searchParams.toString()
    if (query) {
      url += (url.includes('?') ? '&' : '?') + query
    }
  }

  const token = getStoredToken()

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...(headers as Record<string, string>),
    },
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch {
      // Keep default error message
    }
    throw new Error(errorMessage)
  }

  // If status is 204 No Content
  if (response.status === 204) {
    return {} as T
  }

  return (await response.json()) as T
}

export const apiHttp = {
  get: <T = any>(url: string, options?: RequestOptions) =>
    apiClient<T>(url, { ...options, method: 'GET' }),

  post: <T = any>(url: string, body?: any, options?: RequestOptions) =>
    apiClient<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(url: string, body?: any, options?: RequestOptions) =>
    apiClient<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(url: string, options?: RequestOptions) =>
    apiClient<T>(url, { ...options, method: 'DELETE' }),
}
