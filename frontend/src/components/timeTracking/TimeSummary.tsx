/**
 * TimeSummary Component
 * Displays time tracking analytics with charts and stats
 */

'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { TimeSummaryResponse, DailySummary } from '@/types/financial'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4']

interface TimeSummaryProps {
  refreshTrigger?: number
}

export function TimeSummary({ refreshTrigger }: TimeSummaryProps) {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week')
  const [summary, setSummary] = useState<TimeSummaryResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSummary()
  }, [period, refreshTrigger])

  const fetchSummary = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.get<TimeSummaryResponse>(
        `/time-entries/summary?period=${period}`
      )
      setSummary(response)
    } catch (err) {
      console.error('Error fetching summary:', err)
      setError('Failed to load time summary')
    } finally {
      setIsLoading(false)
    }
  }

  // Format time for display
  const formatHours = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  // Prepare chart data
  const getDailyChartData = (dailyData: DailySummary[]) => {
    return dailyData.map((day) => ({
      date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      hours: parseFloat((day.total_seconds / 3600).toFixed(2)),
      activity: day.avg_activity_percent,
    }))
  }

  const getProjectChartData = () => {
    if (!summary?.by_project) return []
    return summary.by_project.map((project, index) => ({
      name: project.project_name || `Project ${index + 1}`,
      value: project.total_hours,
      color: COLORS[index % COLORS.length],
    }))
  }

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
        <div className="text-red-600 text-center">
          <p>{error}</p>
          <button onClick={fetchSummary} className="mt-2 text-blue-600 underline">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
        <div className="flex gap-2">
          {(['today', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
          <p className="text-sm text-slate-600 mb-1">Total Time</p>
          <p className="text-2xl font-bold text-slate-900">{summary?.formatted_time || '0h 0m'}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
          <p className="text-sm text-slate-600 mb-1">Entries</p>
          <p className="text-2xl font-bold text-slate-900">{summary?.entries_count || 0}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
          <p className="text-sm text-slate-600 mb-1">Avg Activity</p>
          <p className="text-2xl font-bold text-slate-900">{summary?.avg_activity_percent || 0}%</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
          <p className="text-sm text-slate-600 mb-1">Billable</p>
          <p className="text-2xl font-bold text-green-600">
            PKR {summary?.billable_amount?.toLocaleString() || 0}
          </p>
        </div>
      </div>

      {/* Daily Breakdown Chart */}
      {summary?.by_day && summary.by_day.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Daily Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getDailyChartData(summary.by_day)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748B" />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#64748B"
                  tickFormatter={(value) => `${value}h`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)} hours`, 'Time']}
                />
                <Bar dataKey="hours" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Project Distribution */}
      {summary?.by_project && summary.by_project.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Time by Project</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getProjectChartData()}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}h`}
                    labelLine={false}
                  >
                    {getProjectChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value.toFixed(1)} hours`, 'Time']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Project List */}
            <div className="space-y-3">
              {summary.by_project.map((project, index) => (
                <div
                  key={project.project_id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="font-medium text-slate-900">
                      {project.project_name || 'No Project'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{project.total_hours.toFixed(1)}h</p>
                    <p className="text-xs text-slate-500">{project.entries_count} entries</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Activity Trend */}
      {summary?.by_day && summary.by_day.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Activity Trend</h3>
          <div className="space-y-3">
            {summary.by_day.map((day) => (
              <div key={day.date} className="flex items-center gap-4">
                <span className="text-sm text-slate-600 w-24">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      day.avg_activity_percent >= 70
                        ? 'bg-green-500'
                        : day.avg_activity_percent >= 40
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${day.avg_activity_percent}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-slate-700 w-12">
                  {day.avg_activity_percent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data State */}
      {(!summary?.by_day || summary.by_day.length === 0) && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-slate-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-lg font-medium text-slate-700">No time tracked yet</p>
          <p className="text-sm text-slate-500 mt-1">
            Start a timer to see your analytics here
          </p>
        </div>
      )}
    </div>
  )
}
