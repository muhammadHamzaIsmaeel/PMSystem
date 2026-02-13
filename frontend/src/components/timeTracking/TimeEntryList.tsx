/**
 * TimeEntryList Component
 * Displays list of time entries with activity indicators and actions
 */

'use client'

import { useState } from 'react'
import { TimeEntry, TimerStatus, TimeEntryDetail } from '@/types/financial'
import { Task } from '@/types/task'
import { apiClient } from '@/lib/api'

interface TimeEntryListProps {
  entries: TimeEntry[]
  tasks: Task[]
  onEdit?: (entry: TimeEntry) => void
  onDelete?: (entryId: string) => void
  isLoading?: boolean
}

// Activity Level Badge Component
function ActivityBadge({ percent }: { percent: number }) {
  let colorClass = 'bg-red-100 text-red-800'
  let label = 'Low'

  if (percent >= 70) {
    colorClass = 'bg-green-100 text-green-800'
    label = 'High'
  } else if (percent >= 40) {
    colorClass = 'bg-amber-100 text-amber-800'
    label = 'Medium'
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
      {percent}% {label}
    </span>
  )
}

// Status Badge Component
function StatusBadge({ status }: { status: TimerStatus }) {
  const configs = {
    [TimerStatus.RUNNING]: { color: 'bg-green-100 text-green-800', label: 'Running' },
    [TimerStatus.PAUSED]: { color: 'bg-amber-100 text-amber-800', label: 'Paused' },
    [TimerStatus.COMPLETED]: { color: 'bg-blue-100 text-blue-800', label: 'Completed' },
    [TimerStatus.IDLE]: { color: 'bg-slate-100 text-slate-800', label: 'Idle' },
  }

  const config = configs[status] || configs[TimerStatus.IDLE]

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}

export function TimeEntryList({
  entries,
  tasks,
  onEdit,
  onDelete,
  isLoading = false,
}: TimeEntryListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [entryDetails, setEntryDetails] = useState<TimeEntryDetail | null>(null)

  // Format duration
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hrs > 0) {
      return `${hrs}h ${mins}m`
    }
    return `${mins}m`
  }

  // Get task name
  const getTaskName = (taskId: string | null) => {
    if (!taskId) return 'No task'
    const task = tasks.find((t) => t.id === taskId)
    return task?.title || 'Unknown Task'
  }

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  // Format time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Toggle entry details
  const toggleDetails = async (entryId: string) => {
    if (expandedId === entryId) {
      setExpandedId(null)
      setEntryDetails(null)
      return
    }

    setExpandedId(entryId)
    setDetailsLoading(true)

    try {
      const details = await apiClient.get<TimeEntryDetail>(`/time-entries/${entryId}`)
      setEntryDetails(details)
    } catch (err) {
      console.error('Error fetching entry details:', err)
    } finally {
      setDetailsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-12 w-12 bg-slate-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
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
        <p className="text-lg font-medium text-slate-700">No time entries</p>
        <p className="text-sm text-slate-500 mt-1">Start tracking your time to see entries here</p>
      </div>
    )
  }

  // Group entries by date
  const groupedEntries = entries.reduce((groups, entry) => {
    const date = formatDate(entry.start_time)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(entry)
    return groups
  }, {} as Record<string, TimeEntry[]>)

  return (
    <div className="space-y-6">
      {Object.entries(groupedEntries).map(([date, dateEntries]) => (
        <div key={date} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          {/* Date Header */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">{date}</h3>
              <span className="text-sm text-slate-600">
                {formatDuration(dateEntries.reduce((sum, e) => sum + e.duration_seconds, 0))}
              </span>
            </div>
          </div>

          {/* Entries */}
          <div className="divide-y divide-slate-100">
            {dateEntries.map((entry) => (
              <div key={entry.id}>
                {/* Entry Row */}
                <div
                  className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => toggleDetails(entry.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Task & Description */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-slate-900 truncate">
                          {getTaskName(entry.task_id)}
                        </p>
                        <StatusBadge status={entry.status} />
                        {entry.is_billable && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Billable
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 truncate">
                        {entry.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>{formatTime(entry.start_time)}</span>
                        <span>-</span>
                        <span>{entry.end_time ? formatTime(entry.end_time) : 'Running'}</span>
                        {entry.screenshot_count > 0 && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {entry.screenshot_count}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Duration & Activity */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-slate-900">
                        {formatDuration(entry.duration_seconds)}
                      </p>
                      <ActivityBadge percent={entry.activity_percent} />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === entry.id && (
                  <div className="px-4 pb-4 bg-slate-50 border-t border-slate-200">
                    {detailsLoading ? (
                      <div className="py-4 text-center text-slate-500">Loading details...</div>
                    ) : entryDetails ? (
                      <div className="space-y-4 pt-4">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="bg-white rounded-lg p-3 text-center">
                            <p className="text-xs text-slate-500 mb-1">Keyboard</p>
                            <p className="text-lg font-semibold text-slate-900">
                              {entryDetails.keyboard_clicks}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 text-center">
                            <p className="text-xs text-slate-500 mb-1">Mouse</p>
                            <p className="text-lg font-semibold text-slate-900">
                              {entryDetails.mouse_clicks}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 text-center">
                            <p className="text-xs text-slate-500 mb-1">Active</p>
                            <p className="text-lg font-semibold text-green-600">
                              {formatDuration(entryDetails.active_seconds)}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 text-center">
                            <p className="text-xs text-slate-500 mb-1">Idle</p>
                            <p className="text-lg font-semibold text-amber-600">
                              {formatDuration(entryDetails.idle_seconds)}
                            </p>
                          </div>
                        </div>

                        {/* App Usage */}
                        {Object.keys(entryDetails.app_usage).length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-slate-700 mb-2">App Usage</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(entryDetails.app_usage)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 5)
                                .map(([app, seconds]) => (
                                  <span
                                    key={app}
                                    className="inline-flex items-center px-2 py-1 rounded bg-white text-xs"
                                  >
                                    <span className="font-medium">{app}</span>
                                    <span className="ml-1 text-slate-500">
                                      {formatDuration(seconds)}
                                    </span>
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {entryDetails.notes && (
                          <div>
                            <p className="text-sm font-medium text-slate-700 mb-1">Notes</p>
                            <p className="text-sm text-slate-600 bg-white rounded-lg p-3">
                              {entryDetails.notes}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          {onEdit && entry.status === TimerStatus.COMPLETED && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onEdit(entry)
                              }}
                              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              Edit
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm('Delete this time entry?')) {
                                  onDelete(entry.id)
                                }
                              }}
                              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
