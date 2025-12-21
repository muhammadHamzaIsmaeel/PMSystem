/**
 * Login Page
 */

'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  const router = useRouter()

  const handleLoginSuccess = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2">
      {/* Left side: Form */}
      <div className="bg-slate-900 flex flex-col justify-center items-center p-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">ProjectFlow</h1>
            <h2 className="mt-6 text-2xl font-semibold text-white">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Or{' '}
              <Link href="/register" className="font-medium text-blue-500 hover:text-blue-400">
                create a new account
              </Link>
            </p>
          </div>

          <LoginForm onSuccess={handleLoginSuccess} />
        </div>
      </div>

      {/* Right side: Image */}
      <div className="hidden md:block relative">
        <Image
          src="/auth-image.jpg"
          alt="Authentication background"
          layout="fill"
          objectFit="cover"
        />
      </div>
    </div>
  )
}