/**
 * MainLayout Component
 * Main layout wrapper with Navbar and Sidebar
 * Used for authenticated pages
 */

'use client'

import { Navbar } from '@/components/shared/Navbar'
import { Sidebar } from '@/components/shared/Sidebar'
import { useAuthLoading } from '@/hooks/useAuth'
import { useState } from 'react'
import { clsx } from 'clsx'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const isLoading = useAuthLoading()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-sm text-secondary-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Top Navbar */}
      <Navbar />

      {/* Sidebar */}
      <Sidebar collapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} />

      {/* Main Content Area */}
      <main className={clsx("pt-16 transition-all duration-300", {
        "ml-64": !isSidebarCollapsed,
        "ml-20": isSidebarCollapsed,
      })}>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
