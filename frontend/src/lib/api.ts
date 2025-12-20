/**
 * API client with fetch wrapper and token handling.
 * Provides type-safe methods for all backend API calls.
 */

import { getToken, removeToken } from './auth'
import type { APIError } from '@/types/common'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export class APIClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = getToken()
    const headers = new Headers(options.headers)
    headers.set('Content-Type', 'application/json')

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    const url = `${this.baseURL}${endpoint}`

    console.log('API Request:', { url, method: options.method || 'GET', hasToken: !!token })

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include cookies
      })

      console.log('API Response:', { url, status: response.status, ok: response.ok })

      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        console.error('Unauthorized - redirecting to login')
        removeToken()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        throw new Error('Unauthorized')
      }

      // Parse response body
      let data = null
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        data = await response.json().catch(() => null)
      }

      if (!response.ok) {
        const error = data as APIError
        const errorMessage = error?.detail || `HTTP ${response.status}: ${response.statusText}`
        console.error('API Error:', errorMessage, data)
        throw new Error(errorMessage)
      }

      return data as T
    } catch (error) {
      console.error('API Request Failed:', { url, error })
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Network error - please check if backend is running')
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Export singleton instance
export const apiClient = new APIClient()

// Health check
export const checkHealth = async () => {
  try {
    const response = await fetch('http://localhost:8000/health')
    if (!response.ok) {
      throw new Error('Backend not responding')
    }
    return await response.json()
  } catch (error) {
    console.error('Backend health check failed:', error)
    throw new Error('Cannot connect to backend. Please ensure backend is running on port 8000')
  }
}
