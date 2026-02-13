/**
 * LiveTimer Component
 * Real-time stopwatch with start/pause/resume/stop functionality
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient } from '@/lib/api'
import {
  TimeEntry,
  TimerStatus,
  ActiveTimerResponse,
  TimerStartRequest,
  TimerStopRequest,
} from '@/types/financial'
import { Task } from '@/types/task'
import { Project } from '@/types/project'

interface LiveTimerProps {
  tasks: Task[]
  projects: Project[]
  onTimerStop?: (entry: TimeEntry) => void
  onTimerStart?: (entry: TimeEntry) => void
}

export function LiveTimer({ tasks, projects, onTimerStop, onTimerStart }: LiveTimerProps) {
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state for starting timer
  const [selectedTask, setSelectedTask] = useState<string>('')
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [description, setDescription] = useState('')
  const [isBillable, setIsBillable] = useState(true)

  // Stop timer modal state
  const [showStopModal, setShowStopModal] = useState(false)
  const [stopNotes, setStopNotes] = useState('')

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Format seconds to HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Fetch active timer on mount
  const fetchActiveTimer = useCallback(async () => {
    try {
      const response = await apiClient.get<ActiveTimerResponse>('/time-entries/active')
      if (response.has_active_timer && response.timer) {
        setActiveTimer(response.timer)
        setElapsedSeconds(response.elapsed_seconds)
      } else {
        setActiveTimer(null)
        setElapsedSeconds(0)
      }
    } catch (err) {
      console.error('Error fetching active timer:', err)
    }
  }, [])

  useEffect(() => {
    fetchActiveTimer()
  }, [fetchActiveTimer])

  // Timer tick effect
  useEffect(() => {
    if (activeTimer && activeTimer.status === TimerStatus.RUNNING) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [activeTimer])

  // Start timer
  const handleStart = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const request: TimerStartRequest = {
        task_id: selectedTask || undefined,
        project_id: selectedProject || undefined,
        description: description || undefined,
        is_billable: isBillable,
      }

      const entry = await apiClient.post<TimeEntry>('/time-entries/start', request)
      setActiveTimer(entry)
      setElapsedSeconds(0)
      onTimerStart?.(entry)

      // Reset form
      setDescription('')
    } catch (err: any) {
      setError(err.message || 'Failed to start timer')
    } finally {
      setIsLoading(false)
    }
  }

  // Pause timer
  const handlePause = async () => {
    if (!activeTimer) return

    try {
      setIsLoading(true)
      setError(null)

      const entry = await apiClient.post<TimeEntry>(`/time-entries/${activeTimer.id}/pause`)
      setActiveTimer(entry)
    } catch (err: any) {
      setError(err.message || 'Failed to pause timer')
    } finally {
      setIsLoading(false)
    }
  }

  // Resume timer
  const handleResume = async () => {
    if (!activeTimer) return

    try {
      setIsLoading(true)
      setError(null)

      const entry = await apiClient.post<TimeEntry>(`/time-entries/${activeTimer.id}/resume`)
      setActiveTimer(entry)
    } catch (err: any) {
      setError(err.message || 'Failed to resume timer')
    } finally {
      setIsLoading(false)
    }
  }

  // Stop timer
  const handleStop = async () => {
    if (!activeTimer) return

    try {
      setIsLoading(true)
      setError(null)

      const request: TimerStopRequest = {
        notes: stopNotes || undefined,
        task_id: selectedTask || activeTimer.task_id || undefined,
      }

      const entry = await apiClient.post<TimeEntry>(`/time-entries/${activeTimer.id}/stop`, request)
      setActiveTimer(null)
      setElapsedSeconds(0)
      setShowStopModal(false)
      setStopNotes('')
      onTimerStop?.(entry)
    } catch (err: any) {
      setError(err.message || 'Failed to stop timer')
    } finally {
      setIsLoading(false)
    }
  }

  // Discard timer
  const handleDiscard = async () => {
    if (!activeTimer) return
    if (!confirm('Are you sure you want to discard this timer? All tracked time will be lost.')) return

    try {
      setIsLoading(true)
      setError(null)

      await apiClient.delete(`/time-entries/${activeTimer.id}/discard`)
      setActiveTimer(null)
      setElapsedSeconds(0)
    } catch (err: any) {
      setError(err.message || 'Failed to discard timer')
    } finally {
      setIsLoading(false)
    }
  }

  // Get task name by ID
  const getTaskName = (taskId: string | null) => {
    if (!taskId) return 'No task'
    const task = tasks.find((t) => t.id === taskId)
    return task?.title || taskId
  }

  // Get project name by ID
  const getProjectName = (projectId: string | null) => {
    if (!projectId) return 'No project'
    const project = projects.find((p) => p.id === projectId)
    return project?.name || projectId
  }

  // Active timer display
  if (activeTimer) {
    const isRunning = activeTimer.status === TimerStatus.RUNNING
    const isPaused = activeTimer.status === TimerStatus.PAUSED

    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
        {/* Timer Display */}
        <div className="text-center mb-6">
          <div
            className={`text-5xl font-mono font-bold mb-2 ${isRunning ? 'text-green-600' : 'text-amber-600'}`}
          >
            {formatTime(elapsedSeconds)}
          </div>
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isRunning
                ? 'bg-green-100 text-green-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full mr-2 ${
                isRunning ? 'bg-green-500 animate-pulse' : 'bg-amber-500'
              }`}
            ></span>
            {isRunning ? 'Running' : 'Paused'}
          </div>
        </div>

        {/* Timer Info */}
        <div className="space-y-2 mb-6">
          {activeTimer.task_id && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Task:</span>
              <span className="font-medium text-slate-900">{getTaskName(activeTimer.task_id)}</span>
            </div>
          )}
          {activeTimer.project_id && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Project:</span>
              <span className="font-medium text-slate-900">
                {getProjectName(activeTimer.project_id)}
              </span>
            </div>
          )}
          {activeTimer.description && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Description:</span>
              <span className="font-medium text-slate-900 truncate max-w-[200px]">
                {activeTimer.description}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Started:</span>
            <span className="font-medium text-slate-900">
              {new Date(activeTimer.start_time).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3">
          {isRunning ? (
            <button
              onClick={handlePause}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
              Pause
            </button>
          ) : (
            <button
              onClick={handleResume}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Resume
            </button>
          )}

          <button
            onClick={() => setShowStopModal(true)}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h12v12H6z" />
            </svg>
            Stop
          </button>
        </div>

        <button
          onClick={handleDiscard}
          disabled={isLoading}
          className="w-full mt-3 px-4 py-2 text-slate-600 text-sm hover:text-red-600 transition-colors"
        >
          Discard Timer
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Stop Modal */}
        {showStopModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Stop Timer</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Add notes (optional)
                </label>
                <textarea
                  value={stopNotes}
                  onChange={(e) => setStopNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What did you work on?"
                />
              </div>

              {!activeTimer.task_id && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Assign to task (optional)
                  </label>
                  <select
                    value={selectedTask}
                    onChange={(e) => setSelectedTask(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">No task</option>
                    {tasks.map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowStopModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStop}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Stopping...' : 'Stop & Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // No active timer - show start form
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Start Timer</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Task Selection */}
        <div>
          <label htmlFor="task" className="block text-sm font-medium text-slate-700 mb-1">
            Task (optional)
          </label>
          <select
            id="task"
            value={selectedTask}
            onChange={(e) => {
              setSelectedTask(e.target.value)
              // Auto-select project from task
              const task = tasks.find((t) => t.id === e.target.value)
              if (task) {
                setSelectedProject(task.project_id)
              }
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">No task selected</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </div>

        {/* Project Selection */}
        <div>
          <label htmlFor="project" className="block text-sm font-medium text-slate-700 mb-1">
            Project (optional)
          </label>
          <select
            id="project"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">No project selected</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
            Description (optional)
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What are you working on?"
          />
        </div>

        {/* Billable Toggle */}
        <div className="flex items-center">
          <input
            id="billable"
            type="checkbox"
            checked={isBillable}
            onChange={(e) => setIsBillable(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="billable" className="ml-2 text-sm text-slate-700">
            Billable time
          </label>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          {isLoading ? 'Starting...' : 'Start Timer'}
        </button>
      </div>
    </div>
  )
}
