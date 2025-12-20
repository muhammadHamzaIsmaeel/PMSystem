/**
 * ProfitLossCard Component
 * Displays overall profit or loss with color coding
 */

'use client'

import { TrendingDownIcon } from "../icons/TrendingDownIcon"
import { TrendingUpIcon } from "../icons/TrendingUpIcon"


interface ProfitLossCardProps {
  value: number
  label?: string
}

export function ProfitLossCard({ value, label = 'Overall Profit/Loss' }: ProfitLossCardProps) {
  const isProfit = value >= 0
  const bgColor = isProfit ? 'bg-success-50' : 'bg-error-50'
  const borderColor = isProfit ? 'border-success-200' : 'border-error-200'
  const textColor = isProfit ? 'text-success-700' : 'text-error-700'
  const valueColor = isProfit ? 'text-success-900' : 'text-error-900'

  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm font-medium ${textColor}`}>{label}</h3>
        <div
          className={`${
            isProfit ? 'bg-success-100' : 'bg-error-100'
          } p-2 rounded-lg`}
        >
          {isProfit ? (
            <TrendingUpIcon className="w-6 h-6 text-success-600" />
          ) : (
            <TrendingDownIcon className="w-6 h-6 text-error-600" />
          )}
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <p className={`text-4xl font-bold ${valueColor}`}>
          ${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <span className={`text-lg font-medium ${textColor}`}>
          {isProfit ? 'Profit' : 'Loss'}
        </span>
      </div>

      {!isProfit && (
        <div className="mt-4 pt-4 border-t border-error-200">
          <p className="text-sm text-error-700">
            <span className="font-medium">Warning:</span> Operating at a loss. Review expenses and
            project budgets.
          </p>
        </div>
      )}

      {isProfit && value > 0 && (
        <div className="mt-4 pt-4 border-t border-success-200">
          <p className="text-sm text-success-700">
            <span className="font-medium">Excellent:</span> Positive profit margin across all
            projects.
          </p>
        </div>
      )}
    </div>
  )
}
