/**
 * Auth Provider Component
 * Initializes auth state on app mount
 */

'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initialize = useAuth((state) => state.initialize)

  useEffect(() => {
    // Initialize auth state from localStorage on mount
    initialize()
  }, [initialize])

  return <>{children}</>
}
