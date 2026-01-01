/**
 * Sidebar Component - Next Level UI
 * Fully responsive with modern glassmorphism design
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { JSX, useState, useEffect } from 'react'
import { useUserRole } from '@/hooks/useAuth'
import { UserRole } from '@/types/common'
import { clsx } from 'clsx'
import { GoSidebarExpand, GoSidebarCollapse } from 'react-icons/go'
import { HiX } from 'react-icons/hi'

/* Modern Icons */
const Icons = {
  dashboard: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  projects: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  kanban: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  ),
  tasks: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  time: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  money: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  reports: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  team: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  settings: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
}

interface NavItem {
  label: string
  href: string
  icon: JSX.Element
  roles?: UserRole[]
  badge?: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Icons.dashboard },
  { label: 'Projects', href: '/projects', icon: Icons.projects },
  { label: 'Kanban Board', href: '/kanban', icon: Icons.kanban },
  { label: 'Tasks', href: '/tasks', icon: Icons.tasks },
  { label: 'Time Tracking', href: '/time-tracking', icon: Icons.time },
  {
    label: 'Financial',
    href: '/financial',
    icon: Icons.money,
    roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FINANCE],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: Icons.reports,
    roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FINANCE],
  },
  {
    label: 'Team Members',
    href: '/users',
    icon: Icons.team,
    roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Icons.settings,
  },
]

const roleColors: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'from-purple-500 to-pink-500',
  [UserRole.PROJECT_MANAGER]: 'from-blue-500 to-cyan-500',
  [UserRole.FINANCE]: 'from-green-500 to-emerald-500',
  [UserRole.TEAM_MEMBER]: 'from-orange-500 to-amber-500',
  [UserRole.VIEWER]: 'from-slate-500 to-gray-500',
}

const roleIcons: Record<UserRole, string> = {
  [UserRole.ADMIN]: '👑',
  [UserRole.PROJECT_MANAGER]: '📊',
  [UserRole.FINANCE]: '💰',
  [UserRole.TEAM_MEMBER]: '👤',
  [UserRole.VIEWER]: '👁️',
}

interface SidebarProps {
  collapsed: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname()
  const userRole = useUserRole()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true
    return userRole && item.roles.includes(userRole)
  })

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className={clsx(
        'flex items-center justify-between px-4 py-5 border-b border-white/10',
        collapsed ? 'flex-col gap-3' : ''
      )}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">PM</span>
            </div>
            <div className="lg:block hidden">
              <h2 className="text-white font-bold text-lg">Project Hub</h2>
              <p className="text-slate-400 text-xs">Management System</p>
            </div>
          </div>
        )}
        
        {/* Desktop Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <GoSidebarCollapse className="w-5 h-5" />
          ) : (
            <GoSidebarExpand className="w-5 h-5" />
          )}
        </button>

        {/* Mobile Close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
          aria-label="Close menu"
        >
          <HiX className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              )}
            >
              {/* Active Indicator */}
              {isActive && !collapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
              )}

              {/* Icon */}
              <span className={clsx(
                'shrink-0 transition-transform duration-200',
                isActive ? 'scale-110' : 'group-hover:scale-110'
              )}>
                {item.icon}
              </span>

              {/* Label */}
              {!collapsed && (
                <span className="text-sm font-medium truncate flex-1">
                  {item.label}
                </span>
              )}

              {/* Badge */}
              {!collapsed && item.badge && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  {item.label}
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Role Badge */}
      {userRole && (
        <div className={clsx(
          'px-4 py-4 border-t border-white/10',
          collapsed ? 'flex justify-center' : ''
        )}>
          {collapsed ? (
            <div className="group relative">
              <div className={clsx(
                'w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br shadow-lg',
                roleColors[userRole]
              )}>
                {roleIcons[userRole]}
              </div>
              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                {userRole}
                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
              </div>
            </div>
          ) : (
            <div className={clsx(
              'flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r shadow-lg',
              roleColors[userRole]
            )}>
              <span className="text-2xl">{roleIcons[userRole]}</span>
              <div>
                <p className="text-xs text-white/80 font-medium">Current Role</p>
                <p className="text-sm text-white font-bold">{userRole}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Open menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Desktop Sidebar */}
      <aside
        className={clsx(
          'hidden lg:flex flex-col fixed top-16 bottom-0 left-0 z-40 border-r border-slate-700/50 transition-all duration-300',
          'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800',
          'backdrop-blur-xl',
          collapsed ? 'w-20' : 'w-72'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={clsx(
          'lg:hidden fixed top-0 bottom-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300',
          'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800',
          'backdrop-blur-xl border-r border-slate-700/50',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </>
  )
}