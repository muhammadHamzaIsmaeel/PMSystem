/**
 * Home/Landing Page
 * Redirects to dashboard if authenticated, shows landing if not
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useIsAuthenticated, useAuthLoading } from '@/hooks/useAuth'

export default function Home() {
  const router = useRouter()
  const isAuthenticated = useIsAuthenticated()
  const isLoading = useAuthLoading()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-secondary-900 mb-4">
            Project Management System
          </h1>
          <p className="text-xl text-secondary-600 mb-8">
            Streamline your projects with powerful task management, time tracking, and financial oversight
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              Project Management
            </h3>
            <p className="text-secondary-600">
              Create and manage projects with full lifecycle tracking, from planning to completion.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">⏱️</div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              Time Tracking
            </h3>
            <p className="text-secondary-600">
              Log time entries on tasks with automatic duration calculation and HRMSX integration.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              Financial Management
            </h3>
            <p className="text-secondary-600">
              Track expenses and income with automatic profit/loss calculation for each project.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              Kanban Board
            </h3>
            <p className="text-secondary-600">
              Real-time drag-and-drop task management with WebSocket updates for team collaboration.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              Role-Based Access
            </h3>
            <p className="text-secondary-600">
              Secure RBAC with 5 roles: Admin, Project Manager, Team Member, Finance, and Viewer.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">📈</div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              Reports & Analytics
            </h3>
            <p className="text-secondary-600">
              Comprehensive reporting with project health, team productivity, and financial insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
