/**
 * SummaryCard Component - Modern Design
 * Glassmorphism card with gradient accents
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
  colorClass = 'from-blue-500 to-cyan-500',
}: SummaryCardProps) {
  return (
    <div className="group relative bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
      {/* Gradient Background on Hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
          
          {change && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
              change.isPositive 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {change.isPositive ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              {Math.abs(change.value)}%
            </div>
          )}
        </div>

        <h3 className="text-slate-600 text-sm font-medium mb-1">{label}</h3>
        <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
        
        {change && (
          <p className="text-xs text-slate-500">{change.label}</p>
        )}
      </div>

      {/* Decorative Element */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br ${colorClass} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
    </div>
  )
}