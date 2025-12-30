/**
 * Reports Page
 * Dashboard for viewing various reports and analytics
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useHasRole } from '@/hooks/useAuth'
import { UserRole } from '@/types/common'
import { apiClient } from '@/lib/api'

export default function ReportsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const isAdmin = useHasRole([UserRole.ADMIN])
  const isFinance = useHasRole([UserRole.FINANCE])
  const isProjectManager = useHasRole([UserRole.PROJECT_MANAGER])

  // Check if user has permission to view reports
  const hasReportAccess = isAdmin || isFinance || isProjectManager

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!hasReportAccess) {
      // Redirect to dashboard if no access
      router.push('/dashboard')
      return
    }
  }, [user, hasReportAccess])

  if (!user) return null

  if (!hasReportAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-secondary-900 mb-4">Access Denied</h1>
          <p className="text-secondary-600">
            You don't have permission to view reports.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">Reports & Analytics</h1>
        <p className="text-secondary-600 mt-2">
          View project reports, financial analytics, and performance metrics
        </p>
      </div>

      {/* Reports Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Financial Summary Card */}
        <div className="bg-white border border-secondary-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Financial Summary</h3>
          <p className="text-secondary-600 mb-4">View income vs expenses reports</p>
          <button
            onClick={() => router.push('/financial')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            View Report
          </button>
        </div>

        {/* Project Status Card */}
        <div className="bg-white border border-secondary-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Project Status</h3>
          <p className="text-secondary-600 mb-4">Track project progress and milestones</p>
          <button
            onClick={() => router.push('/projects')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            View Report
          </button>
        </div>

        {/* Time Tracking Card */}
        <div className="bg-white border border-secondary-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Time Tracking</h3>
          <p className="text-secondary-600 mb-4">Analyze time spent on projects and tasks</p>
          <button
            onClick={() => router.push('/time-tracking')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            View Report
          </button>
        </div>
      </div>

      {/* Available Reports Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-secondary-900 mb-4">Available Reports</h2>
        <div className="bg-white border border-secondary-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Report
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Access
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-secondary-900">Financial Report</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-secondary-600">Income vs expenses analysis</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success-100 text-success-800">
                    Admin, Finance
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => router.push('/financial')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    View
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-secondary-900">Project Progress</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-secondary-600">Project status and milestone tracking</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success-100 text-success-800">
                    All
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => router.push('/projects')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    View
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-secondary-900">Time Tracking</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-secondary-600">Time spent analysis by project and task</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success-100 text-success-800">
                    All
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => router.push('/time-tracking')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    View
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-secondary-900">User Performance</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-secondary-600">Team productivity and task completion</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success-100 text-success-800">
                    Admin, PM
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => router.push('/users')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Generation Section */}
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-4">Generate Custom Report</h2>
        <div className="bg-white border border-secondary-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Report Type
              </label>
              <select className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
                <option>Select Report Type</option>
                <option>Financial Summary</option>
                <option>Project Status</option>
                <option>Time Tracking</option>
                <option>User Performance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  )
}