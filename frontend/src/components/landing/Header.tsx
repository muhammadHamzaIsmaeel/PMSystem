'use client'

import Link from 'next/link'
import { useIsAuthenticated, useAuth } from '@/hooks/useAuth'

const Header = () => {
  const isAuthenticated = useIsAuthenticated()
  const { user, logout } = useAuth()

  return (
    <header className="absolute top-0 left-0 w-full z-30 py-4">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-white">ProjectFlow</div>
        <nav className="flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              <span className="text-white">Welcome, {user?.name}</span>
              <Link
                href="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="text-gray-200 hover:text-white transition-colors duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-200 hover:text-white transition-colors duration-300"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
