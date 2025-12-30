/**
 * LoginForm Component
 * React Hook Form + Zod validation
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import type { LoginRequest, TokenResponse } from '@/types/user'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const login = useAuth((state) => state.login)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setError('')
    setIsLoading(true)

    try {
      const response = await apiClient.post<TokenResponse>('/auth/login', data as LoginRequest)

      // Store tokens and user data
      login(response.access_token, response.refresh_token, response.user)

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-error-50 text-error-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-800 mb-1">
          Email
        </label>
        <input
          {...register('email')}
          id="email"
          type="email"
          autoComplete="email"
          className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-800 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none placeholder-slate-400"
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-800 mb-1">
          Password
        </label>
        <input
          {...register('password')}
          id="password"
          type="password"
          autoComplete="current-password"
          className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-800 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none placeholder-slate-400"
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Logging in...' : 'Log in'}
      </button>
    </form>
  )
}
