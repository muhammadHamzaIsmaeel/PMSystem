/**
 * Time Tracking Page
 * Comprehensive time tracking with live timer, analytics, and entry management
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { TimeEntry, TimeEntryCreate, TimeEntryResponse, TimerStatus } from '@/types/financial'
import { Task } from '@/types/task'
import { Project } from '@/types/project'
import { LiveTimer } from '@/components/timeTracking/LiveTimer'
import { TimeSummary } from '@/components/timeTracking/TimeSummary'
import { TimeEntryList } from '@/components/timeTracking/TimeEntryList'
import { TimeEntryForm } from '@/components/timeTracking/TimeEntryForm'

type TabType = 'timer' | 'entries' | 'analytics' | 'manual'

export default function TimeTrackingPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState<TabType>('timer')
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormLoading, setIsFormLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchData()
  }, [user])

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [timeEntriesRes, tasksRes, projectsRes] = await Promise.all([
        apiClient.get<TimeEntryResponse>('/time-entries?limit=50'),
        apiClient.get<any>('/tasks?limit=100'),
        apiClient.get<any>('/projects?limit=100'),
      ])
      setTimeEntries(timeEntriesRes.items || [])
      setTasks(tasksRes.items || [])
      setProjects(projectsRes.items || [])
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleTimerStop = useCallback((entry: TimeEntry) => {
    setTimeEntries((prev) => [entry, ...prev.filter((e) => e.id !== entry.id)])
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  const handleTimerStart = useCallback((entry: TimeEntry) => {
    setTimeEntries((prev) => [entry, ...prev])
  }, [])

  const handleManualSubmit = async (data: TimeEntryCreate) => {
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
      setRefreshTrigger((prev) => prev + 1)
      setActiveTab('entries')
    } catch (err) {
      console.error('Error saving time entry:', err)
      setError('Failed to save time entry.')
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleDelete = async (entryId: string) => {
    try {
      await apiClient.delete(`/time-entries/${entryId}`)
      setTimeEntries((prev) => prev.filter((e) => e.id !== entryId))
      setRefreshTrigger((prev) => prev + 1)
    } catch (err) {
      console.error('Error deleting time entry:', err)
      setError('Failed to delete time entry.')
    }
  }

  const handleEdit = (entry: TimeEntry) => {
    setEditingEntry(entry)
    setActiveTab('manual')
  }

  if (!user) return null

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading time tracking...</p>
          </div>
        </div>
      </div>
    )
  }

  // Get today's total
  const todayTotal = timeEntries
    .filter((e) => {
      const entryDate = new Date(e.start_time).toDateString()
      const today = new Date().toDateString()
      return entryDate === today && e.status === TimerStatus.COMPLETED
    })
    .reduce((sum, e) => sum + e.duration_seconds, 0)

  const formatTodayTotal = () => {
    const hrs = Math.floor(todayTotal / 3600)
    const mins = Math.floor((todayTotal % 3600) / 60)
    return `${hrs}h ${mins}m`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Time Tracking</h1>
            <p className="text-slate-600 mt-1">Track your work hours and activity</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 shadow-sm">
            <p className="text-sm text-slate-500">Today&apos;s Total</p>
            <p className="text-2xl font-bold text-blue-600">{formatTodayTotal()}</p>
          </div>
        </div>
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

      {/* Tabs */}
      <div className="mb-6 border-b border-slate-200">
        <nav className="flex gap-4 -mb-px">
          {[
            { id: 'timer', label: 'Live Timer', icon: '⏱️' },
            { id: 'entries', label: 'Time Entries', icon: '📋' },
            { id: 'analytics', label: 'Analytics', icon: '📊' },
            { id: 'manual', label: 'Manual Entry', icon: '✏️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Live Timer Tab */}
        {activeTab === 'timer' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <LiveTimer
                tasks={tasks}
                projects={projects}
                onTimerStop={handleTimerStop}
                onTimerStart={handleTimerStart}
              />

              {/* Quick Stats */}
              <div className="mt-6 bg-white border border-slate-200 rounded-lg shadow-sm p-4">
                <h3 className="font-semibold text-slate-800 mb-3">Today&apos;s Activity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total Time</span>
                    <span className="font-medium text-slate-900">{formatTodayTotal()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Entries</span>
                    <span className="font-medium text-slate-900">
                      {timeEntries.filter((e) => {
                        const entryDate = new Date(e.start_time).toDateString()
                        const today = new Date().toDateString()
                        return entryDate === today
                      }).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h3 className="font-semibold text-slate-800 mb-4">Recent Entries</h3>
              <TimeEntryList
                entries={timeEntries.slice(0, 5)}
                tasks={tasks}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        )}

        {/* Time Entries Tab */}
        {activeTab === 'entries' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">All Time Entries</h3>
              <span className="text-sm text-slate-600">
                {timeEntries.length} entries
              </span>
            </div>
            <TimeEntryList
              entries={timeEntries}
              tasks={tasks}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <TimeSummary refreshTrigger={refreshTrigger} />
        )}

        {/* Manual Entry Tab */}
        {activeTab === 'manual' && (
          <div className="max-w-2xl">
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                {editingEntry ? 'Edit Time Entry' : 'Add Manual Time Entry'}
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Manually log time for work you&apos;ve already completed
              </p>
              <TimeEntryForm
                initialData={
                  editingEntry
                    ? {
                        task_id: editingEntry.task_id || '',
                        start_time: new Date(editingEntry.start_time).toISOString().slice(0, 16),
                        end_time: editingEntry.end_time
                          ? new Date(editingEntry.end_time).toISOString().slice(0, 16)
                          : '',
                        description: editingEntry.description || undefined,
                      }
                    : undefined
                }
                onSubmit={handleManualSubmit}
                onCancel={editingEntry ? () => setEditingEntry(null) : undefined}
                isLoading={isFormLoading}
                tasks={tasks}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
