/**
 * ProfitLossDisplay Component
 * Displays project profit/loss calculation with detailed breakdown
 */

'use client'

import { ProfitLoss } from '@/types/financial'

interface ProfitLossDisplayProps {
  data: ProfitLoss
  className?: string
}

export function ProfitLossDisplay({ data, className = '' }: ProfitLossDisplayProps) {
  const isProfitable = data.net_profit >= 0
  const profitColor = isProfitable ? 'text-success-600' : 'text-error-600'
  const profitBgColor = isProfitable ? 'bg-success-50' : 'bg-error-50'
  const profitBorderColor = isProfitable ? 'border-success-200' : 'border-error-200'

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent.toFixed(2)}%`
  }

  return (
    <div className={`bg-white border border-secondary-200 rounded-lg p-6 ${className}`}>
      <h3 className="text-xl font-semibold text-secondary-900 mb-6">Profit & Loss Statement</h3>

      <div className="space-y-4">
        {/* Income Section */}
        <div className="border-b border-secondary-200 pb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-secondary-700">Total Income</span>
            <span className="text-lg font-semibold text-success-600">
              {formatCurrency(data.total_income)}
            </span>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-secondary-900">Expenses</h4>

          <div className="flex justify-between items-center pl-4">
            <span className="text-sm text-secondary-700">Approved Expenses</span>
            <span className="text-base font-medium text-error-600">
              -{formatCurrency(data.total_approved_expenses)}
            </span>
          </div>

          <div className="flex justify-between items-center pl-4">
            <span className="text-sm text-secondary-700">Labor Costs</span>
            <span className="text-base font-medium text-error-600">
              -{formatCurrency(data.labor_costs)}
            </span>
          </div>

          {data.total_pending_expenses > 0 && (
            <div className="flex justify-between items-center pl-4">
              <span className="text-sm text-warning-700">Pending Expenses (Not Included)</span>
              <span className="text-base font-medium text-warning-600">
                {formatCurrency(data.total_pending_expenses)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pl-4 pt-2 border-t border-secondary-200">
            <span className="text-sm font-medium text-secondary-700">Total Expenses</span>
            <span className="text-base font-semibold text-error-600">
              -{formatCurrency(data.total_approved_expenses + data.labor_costs)}
            </span>
          </div>
        </div>

        {/* Net Profit Section */}
        <div className={`border ${profitBorderColor} ${profitBgColor} rounded-lg p-4 mt-4`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-base font-semibold text-secondary-900">Net Profit</span>
            <span className={`text-2xl font-bold ${profitColor}`}>
              {formatCurrency(data.net_profit)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary-700">Profit Margin</span>
            <span className={`text-lg font-semibold ${profitColor}`}>
              {formatPercent(data.profit_margin_percent)}
            </span>
          </div>
        </div>

        {/* Calculation Formula */}
        <div className="mt-6 pt-4 border-t border-secondary-200">
          <p className="text-xs text-secondary-600">
            <span className="font-medium">Calculation:</span> Net Profit = Total Income - (Approved
            Expenses + Labor Costs)
          </p>
          <p className="text-xs text-secondary-600 mt-1">
            <span className="font-medium">Profit Margin:</span> (Net Profit / Total Income) × 100
          </p>
        </div>

        {/* Status Indicator */}
        {!isProfitable && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-warning-800">
              <span className="font-medium">Warning:</span> This project is currently operating at a
              loss. Review expenses and labor costs to improve profitability.
            </p>
          </div>
        )}

        {isProfitable && data.profit_margin_percent < 10 && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-warning-800">
              <span className="font-medium">Note:</span> Profit margin is below 10%. Consider
              optimizing costs or adjusting pricing for better margins.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
