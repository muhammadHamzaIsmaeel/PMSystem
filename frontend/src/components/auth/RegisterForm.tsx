/**
 * RegisterForm Component
 * React Hook Form + Zod validation
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { UserRole } from '@/types/common'
import type { RegisterRequest, TokenResponse } from '@/types/user'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Full name is required'),
  role: z.nativeEnum(UserRole).optional(),
  hrmsx_user_id: z.string().optional(),
})

type RegisterFormData = z.infer<typeof registerSchema>

interface RegisterFormProps {
  onSuccess?: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const login = useAuth((state) => state.login)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: UserRole.TEAM_MEMBER,
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    setError('')
    setIsLoading(true)

    try {
      const response = await apiClient.post<TokenResponse>('/auth/register', data as RegisterRequest)

      // Store tokens and user data
      login(response.access_token, response.refresh_token, response.user)

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
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
        <label htmlFor="full_name" className="block text-sm font-medium text-slate-800 mb-1">
          Full Name
        </label>
        <input
          {...register('full_name')}
          id="full_name"
          type="text"
          autoComplete="name"
          className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-800 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none placeholder-slate-400"
          placeholder="John Doe"
        />
        {errors.full_name && (
          <p className="mt-1 text-sm text-red-500">{errors.full_name.message}</p>
        )}
      </div>

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
          autoComplete="new-password"
          className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-800 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none placeholder-slate-400"
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-slate-800 mb-1">
          Role
        </label>
        <select
          {...register('role')}
          id="role"
          className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-800 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
        >
          <option value={UserRole.TEAM_MEMBER}>Team Member</option>
          <option value={UserRole.PROJECT_MANAGER}>Project Manager</option>
          <option value={UserRole.FINANCE}>Finance</option>
          <option value={UserRole.VIEWER}>Viewer</option>
          <option value={UserRole.ADMIN}>Admin</option>
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="hrmsx_user_id" className="block text-sm font-medium text-slate-800 mb-1">
          HRMSX User ID <span className="text-slate-500">(Optional)</span>
        </label>
        <input
          {...register('hrmsx_user_id')}
          id="hrmsx_user_id"
          type="text"
          className="w-full px-4 py-2 border border-slate-300 bg-white text-slate-800 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none placeholder-slate-400"
          placeholder="HRMSX_USER_123"
        />
        {errors.hrmsx_user_id && (
          <p className="mt-1 text-sm text-red-500">{errors.hrmsx_user_id.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  )
}
