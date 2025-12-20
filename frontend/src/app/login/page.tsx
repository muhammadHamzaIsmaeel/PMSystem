/**
 * Login Page
 */

'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  const router = useRouter()

  const handleLoginSuccess = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-secondary-900">Project Management</h1>
          <h2 className="mt-6 text-2xl font-semibold text-secondary-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Or{' '}
            <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
              create a new account
            </Link>
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <LoginForm onSuccess={handleLoginSuccess} />
        </div>

        {/* Demo Credentials */}
        <div className="bg-info-50 border border-info-200 rounded-lg p-4">
          <p className="text-sm font-medium text-info-900 mb-2">Demo Credentials:</p>
          <div className="text-xs text-info-800 space-y-1">
            <p>Admin: admin@example.com / admin123456</p>
            <p>PM: pm@example.com / pm123456</p>
            <p>Member: member@example.com / member123456</p>
            <p>Finance: finance@example.com / finance123456</p>
            <p>Viewer: viewer@example.com / viewer123456</p>
          </div>
        </div>
      </div>
    </div>
  )
}
