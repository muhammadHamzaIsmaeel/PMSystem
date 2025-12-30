/**
 * Time Tracking Page
 * Displays a list of time entries and allows adding/editing new ones.
 * Fully responsive design with mobile-friendly table
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { TimeEntry, TimeEntryCreate, TimeEntryResponse } from '@/types/financial'
import { TimeEntryForm } from '@/components/timeTracking/TimeEntryForm'
import { Task } from '@/types/task'

export default function TimeTrackingPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormLoading, setIsFormLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [timeEntriesRes, tasksRes] = await Promise.all([
        apiClient.get<TimeEntryResponse>('/time-entries'),
        apiClient.get<any>('/tasks?limit=100'),
      ])
      setTimeEntries(timeEntriesRes.items || [])
      setTasks(tasksRes.items || [])
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load time entries or tasks.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormSubmit = async (data: TimeEntryCreate) => {
    try {
      setIsFormLoading(true)
      setError(null)
      if (editingEntry) {
        await apiClient.put(`/time-entries/${editingEntry.id}`, data)
      } else {
        await apiClient.post('/time-entries', data)
      }
      setEditingEntry(null)
      await fetchData()
    } catch (err) {
      console.error('Error saving time entry:', err)
      setError('Failed to save time entry.')
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleDelete = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this time entry?')) return
    try {
      await apiClient.delete(`/time-entries/${entryId}`)
      await fetchData()
    } catch (err) {
      console.error('Error deleting time entry:', err)
      setError('Failed to delete time entry.')
    }
  }

  if (!user) return null

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading time entries...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Time Tracking</h1>
        <p className="text-slate-600 mt-2">Log and manage your work hours.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p className="font-medium">{error}</p>
          <button
            onClick={fetchData}
            className="mt-2 text-sm text-red-700 underline hover:text-red-900"
          >
            Try again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Time Entry Form */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 sticky top-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              {editingEntry ? 'Edit Time Entry' : 'New Time Entry'}
            </h2>
            <TimeEntryForm
              initialData={
                editingEntry
                  ? {
                      task_id: editingEntry.task_id,
                      start_time: new Date(editingEntry.start_time)
                        .toISOString()
                        .slice(0, 16),
                      end_time: new Date(editingEntry.end_time)
                        .toISOString()
                        .slice(0, 16),
                      description: editingEntry.description || undefined,
                    }
                  : undefined
              }
              onSubmit={handleFormSubmit}
              onCancel={editingEntry ? () => setEditingEntry(null) : undefined}
              isLoading={isFormLoading}
              tasks={tasks}
            />
          </div>
        </div>

        {/* Time Entries List */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800">All Time Entries</h2>
              <p className="text-sm text-slate-600 mt-1">
                Total: {timeEntries.length} {timeEntries.length === 1 ? 'entry' : 'entries'}
              </p>
            </div>

            {timeEntries.length === 0 ? (
              <div className="text-center py-12 text-slate-600">
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
                <p className="text-lg font-medium">No time entries logged yet</p>
                <p className="text-sm mt-1">Start by adding your first time entry</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                          Task
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                          Start Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                          End Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {timeEntries.map((entry) => {
                        const durationMins =
                          (new Date(entry.end_time).getTime() -
                            new Date(entry.start_time).getTime()) /
                          60000
                        const hours = Math.floor(durationMins / 60)
                        const minutes = Math.floor(durationMins % 60)
                        const durationDisplay = `${hours}h ${minutes}m`
                        const taskTitle =
                          tasks.find((t) => t.id === entry.task_id)?.title ||
                          entry.task_id

                        return (
                          <tr key={entry.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                              {taskTitle}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">
                              {new Date(entry.start_time).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">
                              {new Date(entry.end_time).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap font-medium">
                              {durationDisplay}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700 max-w-xs truncate">
                              {entry.description || '-'}
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                              <button
                                onClick={() => setEditingEntry(entry)}
                                className="text-blue-600 hover:text-blue-800 mr-4"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(entry.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden divide-y divide-slate-200">
                  {timeEntries.map((entry) => {
                    const durationMins =
                      (new Date(entry.end_time).getTime() -
                        new Date(entry.start_time).getTime()) /
                      60000
                    const hours = Math.floor(durationMins / 60)
                    const minutes = Math.floor(durationMins % 60)
                    const durationDisplay = `${hours}h ${minutes}m`
                    const taskTitle =
                      tasks.find((t) => t.id === entry.task_id)?.title ||
                      entry.task_id

                    return (
                      <div key={entry.id} className="p-6 hover:bg-slate-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-slate-900 mb-1">
                              {taskTitle}
                            </h3>
                            <p className="text-sm text-slate-600 font-medium">
                              Duration: {durationDisplay}
                            </p>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {durationDisplay}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm">
                            <span className="text-slate-600 w-20">Start:</span>
                            <span className="text-slate-900 font-medium">
                              {new Date(entry.start_time).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="text-slate-600 w-20">End:</span>
                            <span className="text-slate-900 font-medium">
                              {new Date(entry.end_time).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {entry.description && (
                            <div className="flex items-start text-sm mt-2">
                              <span className="text-slate-600 w-20 flex-shrink-0">Note:</span>
                              <span className="text-slate-700">{entry.description}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => setEditingEntry(entry)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}