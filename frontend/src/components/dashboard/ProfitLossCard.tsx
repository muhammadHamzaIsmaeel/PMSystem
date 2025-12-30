/**
 * ProfitLossCard Component - Modern Design
 * Displays profit or loss with animated gradient background
 */

'use client'

interface ProfitLossCardProps {
  value: number
  label?: string
}

export function ProfitLossCard({ value, label = 'Overall Profit/Loss' }: ProfitLossCardProps) {
  const isProfit = value >= 0

  return (
    <div className={`group relative bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden h-full`}>
      {/* Animated Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${
        isProfit 
          ? 'from-green-500/10 via-emerald-500/5 to-teal-500/10' 
          : 'from-red-500/10 via-orange-500/5 to-pink-500/10'
      } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
            isProfit 
              ? 'from-green-500 to-emerald-500' 
              : 'from-red-500 to-orange-500'
          } flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            {isProfit ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            )}
          </div>

          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isProfit 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {isProfit ? 'Profit' : 'Loss'}
          </div>
        </div>

        <h3 className="text-slate-600 text-sm font-medium mb-1">{label}</h3>
        <p className={`text-3xl font-bold mb-2 ${
          isProfit ? 'text-green-600' : 'text-red-600'
        }`}>
          ${Math.abs(value).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>

        {!isProfit && value < 0 && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-red-700">Action Required</p>
                <p className="text-xs text-red-600 mt-0.5">Review expenses and project budgets</p>
              </div>
            </div>
          </div>
        )}

        {isProfit && value > 0 && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-green-700">Excellent Performance</p>
                <p className="text-xs text-green-600 mt-0.5">Positive profit margin across projects</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Decorative Element */}
      <div className={`absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br ${
        isProfit 
          ? 'from-green-500 to-emerald-500' 
          : 'from-red-500 to-orange-500'
      } opacity-10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500`}></div>
    </div>
  )
}