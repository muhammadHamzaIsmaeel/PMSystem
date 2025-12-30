/**
 * User-related TypeScript types
 */

import { UserRole } from './common'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  hrmsx_user_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
  role?: UserRole
  hrmsx_user_id?: string | null
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
}

export interface UserUpdateRequest {
  full_name?: string
  email?: string
  hrmsx_user_id?: string | null
}

export interface RefreshTokenRequest {
  refresh_token: string
}
