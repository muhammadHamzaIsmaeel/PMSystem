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
    <div className="min-h-screen bg-slate-200 w-full grid grid-cols-1 md:grid-cols-2">
      {/* Left side: Form */}
      <div className="flex flex-col justify-center items-center p-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-start">
            <h1 className="text-4xl font-bold text-slate-800">ProjectFlow</h1>
            <h2 className="mt-6 text-3xl font-semibold text-slate-800">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Or{' '}
              <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                create a new account
              </Link>
            </p>
          </div>

          <LoginForm onSuccess={handleLoginSuccess} />
          
        </div>
      </div>

      {/* Right side: Image */}
      <div className="hidden m-10 md:block relative">
        <Image
          src="/auth-image.jpg"
          alt="Authentication background"
          layout="fill"
          objectFit="cover"
          className='rounded-2xl'
        />
      </div>
    </div>
  )
}