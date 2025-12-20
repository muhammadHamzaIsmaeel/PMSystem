/**
 * Zustand auth store with persistence
 * Manages authentication state and user data
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  setToken,
  getToken,
  removeToken,
  setRefreshToken,
  removeRefreshToken,
  setUser as setStoredUser,
  getUser as getStoredUser,
  removeUser as removeStoredUser,
  clearAuth as clearStoredAuth,
  isAuthenticated as checkIsAuthenticated,
} from '@/lib/auth'
import { UserRole } from '@/types/common'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthActions {
  login: (token: string, refreshToken: string, user: User) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  setLoading: (isLoading: boolean) => void
  initialize: () => void
}

type AuthStore = AuthState & AuthActions

/**
 * Auth store with persistence to localStorage
 */
export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      // Actions
      login: (token: string, refreshToken: string, user: User) => {
        setToken(token)
        setRefreshToken(refreshToken)
        setStoredUser(user)

        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        })
      },

      logout: () => {
        clearStoredAuth()

        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        })

        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (!currentUser) return

        const updatedUser = { ...currentUser, ...userData }
        setStoredUser(updatedUser)

        set({ user: updatedUser })
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading })
      },

      initialize: () => {
        const token = getToken()
        const isAuth = checkIsAuthenticated()
        const storedUser = getStoredUser<User>()

        set({
          user: storedUser,
          token,
          isAuthenticated: isAuth,
          isLoading: false,
        })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Selector hooks for optimized re-renders
export const useUser = () => useAuth((state) => state.user)
export const useIsAuthenticated = () => useAuth((state) => state.isAuthenticated)
export const useAuthLoading = () => useAuth((state) => state.isLoading)
export const useUserRole = () => useAuth((state) => state.user?.role)

// Helper hook to check if user has required role
export const useHasRole = (requiredRoles: UserRole[]): boolean => {
  const userRole = useUserRole()
  return userRole ? requiredRoles.includes(userRole) : false
}
