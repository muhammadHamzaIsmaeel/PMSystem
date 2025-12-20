/**
 * Navbar Component
 * Top navigation bar with user menu and notifications
 */

'use client'

import Link from 'next/link'
import { useAuth, useUser } from '@/hooks/useAuth'
import { NotificationBell } from './NotificationBell'

export function Navbar() {
  const user = useUser()
  const logout = useAuth((state) => state.logout)

  return (
    <nav className="bg-white border-b border-secondary-200 h-16 fixed top-0 left-0 right-0 z-50">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-xl font-bold text-primary-600">
            Project Management
          </Link>
        </div>

        {/* Right side - Notifications and User Menu */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <NotificationBell />

          {/* User Menu */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-secondary-900">{user.full_name}</p>
                <p className="text-xs text-secondary-500">{user.role}</p>
              </div>

              {/* User Avatar */}
              <div className="relative">
                <button
                  className="h-10 w-10 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors"
                  aria-label="User menu"
                >
                  {user.full_name.charAt(0).toUpperCase()}
                </button>

                {/* Dropdown Menu (would need state management for show/hide) */}
                <div className="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                  >
                    Settings
                  </Link>
                  <hr className="my-1 border-secondary-200" />
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-error-600 hover:bg-error-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
