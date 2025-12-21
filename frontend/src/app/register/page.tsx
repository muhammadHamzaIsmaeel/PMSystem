/**
 * Register Page
 */

'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  const router = useRouter()

  const handleRegisterSuccess = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2">
      {/* Left side: Image */}
      <div className="hidden md:block relative">
        <Image
          src="/auth-image.jpg"
          alt="Authentication background"
          layout="fill"
          objectFit="cover"
        />
      </div>

      {/* Right side: Form */}
      <div className="bg-slate-900 flex flex-col justify-center items-center p-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">ProjectFlow</h1>
            <h2 className="mt-6 text-2xl font-semibold text-white">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-blue-500 hover:text-blue-400">
                Sign in
              </Link>
            </p>
          </div>

          <RegisterForm onSuccess={handleRegisterSuccess} />

        </div>
      </div>
    </div>
  )
}