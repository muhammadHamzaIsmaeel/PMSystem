/**
 * SummaryCard Component
 * Displays a summary statistic with icon, label, value, and optional change indicator
 */

'use client'

import { ReactNode } from 'react'

interface SummaryCardProps {
  icon: ReactNode
  label: string
  value: string | number
  change?: {
    value: number
    isPositive: boolean
    label: string
  }
  colorClass?: string
}

export function SummaryCard({
  icon,
  label,
  value,
  change,
  colorClass = 'bg-primary-500',
}: SummaryCardProps) {
  return (
    <div className="bg-white border border-secondary-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={`${colorClass} p-3 rounded-lg text-white`}>{icon}</div>
            <h3 className="text-sm font-medium text-secondary-600">{label}</h3>
          </div>

          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-secondary-900">{value}</p>

            {change && (
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  change.isPositive ? 'text-success-600' : 'text-error-600'
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {change.isPositive ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                    />
                  )}
                </svg>
                <span>{Math.abs(change.value)}%</span>
              </div>
            )}
          </div>

          {change && (
            <p className="text-xs text-secondary-500 mt-2">{change.label}</p>
          )}
        </div>
      </div>
    </div>
  )
}
