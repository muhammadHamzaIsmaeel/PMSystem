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
    <nav className="bg-white shadow-sm border-b border-slate-200 h-16 fixed top-0 left-0 right-0 z-50">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
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
                <p className="text-sm font-medium text-slate-800">{user.full_name}</p>
                <p className="text-xs text-slate-500">{user.role}</p>
              </div>

              {/* User Avatar */}
              <div className="relative">
                <button
                  className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                  aria-label="User menu"
                >
                  {user.full_name.charAt(0).toUpperCase()}
                </button>

                {/* Dropdown Menu (would need state management for show/hide) */}
                <div className="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Settings
                  </Link>
                  <hr className="my-1 border-slate-200" />
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
