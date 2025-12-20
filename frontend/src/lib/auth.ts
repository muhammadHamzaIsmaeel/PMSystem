/**
 * Authentication utilities for token storage and retrieval.
 * Uses cookies for access token and localStorage for other data.
 */

const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user'

/**
 * Store access token in a cookie
 */
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    const expires = new Date()
    expires.setDate(expires.getDate() + 7) // 7 days expiration
    document.cookie = `access_token=${token};expires=${expires.toUTCString()};path=/;SameSite=Lax;Secure`
  }
}

/**
 * Get access token from cookies
 */
export const getToken = (): string | null => {
  if (typeof document === 'undefined') {
    return null
  }
  const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'))
  if (match) {
    return match[2]
  }
  return null
}

/**
 * Remove access token cookie
 */
export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    document.cookie = 'access_token=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;'
  }
}

/**
 * Store refresh token in localStorage
 */
export const setRefreshToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  }
}

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }
  return null
}

/**
 * Remove refresh token from localStorage
 */
export const removeRefreshToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }
}

/**
 * Store user data in localStorage
 */
export const setUser = (user: unknown): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

/**
 * Get user data from localStorage
 */
export const getUser = <T>(): T | null => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem(USER_KEY)
    if (user) {
      try {
        return JSON.parse(user) as T
      } catch {
        return null
      }
    }
  }
  return null
}

/**
 * Remove user data from localStorage
 */
export const removeUser = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_KEY)
  }
}

/**
 * Clear all auth data from localStorage
 */
export const clearAuth = (): void => {
  removeToken()
  removeRefreshToken()
  removeUser()
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getToken() !== null
}
