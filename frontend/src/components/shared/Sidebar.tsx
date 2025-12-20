/**
 * Sidebar Component
 * Left navigation menu with role-based links
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUserRole, useHasRole } from '@/hooks/useAuth'
import { UserRole } from '@/types/common'
import { clsx } from 'clsx'

interface NavItem {
  label: string
  href: string
  icon: string
  roles?: UserRole[]
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: '📁',
  },
  {
    label: 'Kanban Board',
    href: '/kanban',
    icon: '📋',
  },
  {
    label: 'Tasks',
    href: '/tasks',
    icon: '✓',
  },
  {
    label: 'Time Tracking',
    href: '/time-tracking',
    icon: '⏱️',
  },
  {
    label: 'Financial',
    href: '/financial',
    icon: '💰',
    roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FINANCE],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: '📈',
    roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FINANCE],
  },
  {
    label: 'Team',
    href: '/team',
    icon: '👥',
    roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: '⚙️',
    roles: [UserRole.ADMIN],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const userRole = useUserRole()

  // Filter nav items based on user role
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true
    return userRole && item.roles.includes(userRole)
  })

  return (
    <aside className="bg-white border-r border-secondary-200 w-64 fixed top-16 bottom-0 left-0 overflow-y-auto">
      <nav className="p-4 space-y-1">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Role Badge */}
      {userRole && (
        <div className="p-4 mt-4 border-t border-secondary-200">
          <div className="text-xs text-secondary-500 mb-1">Current Role</div>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            {userRole}
          </div>
        </div>
      )}
    </aside>
  )
}
