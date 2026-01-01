/**
 * Task Detail Page
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { Task } from '@/types/task'
import { TaskStatus, TaskPriority } from '@/types/task'

export default function TaskDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, token } = useAuth()
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !id) return
    fetchTask()
  }, [user, id])

  const fetchTask = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.get(`/tasks/${id}`)
      setTask(response)
    } catch (err) {
      console.error('Error fetching task:', err)
      setError('Failed to load task details.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    router.push('/login')
    return null
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading task...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center bg-red-100 text-red-800 border border-red-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p>{error}</p>
            <button
              onClick={() => fetchTask()}
              className="mt-6 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Task Not Found</h2>
            <p className="text-slate-600">The requested task could not be found.</p>
            <button
              onClick={() => router.push('/tasks')}
              className="mt-6 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Tasks
            </button>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO: return 'bg-gray-100 text-gray-800'
      case TaskStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800'
      case TaskStatus.REVIEW: return 'bg-yellow-100 text-yellow-800'
      case TaskStatus.DONE: return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW: return 'bg-green-100 text-green-800'
      case TaskPriority.MEDIUM: return 'bg-blue-100 text-blue-800'
      case TaskPriority.HIGH: return 'bg-yellow-100 text-yellow-800'
      case TaskPriority.URGENT: return 'bg-orange-100 text-orange-800'
      case TaskPriority.CRITICAL: return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Task Details</h1>
        <button
          onClick={() => router.push(`/tasks/${id}/edit`)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Edit Task
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-4">{task.title}</h2>
            {task.description && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-700 mb-1">Description</h3>
                <p className="text-slate-600">{task.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-1">Status</h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-1">Priority</h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-1">Created</h3>
                <p className="text-slate-600">{new Date(task.created_at).toLocaleString()}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-1">Updated</h3>
                <p className="text-slate-600">{new Date(task.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-2">Task Information</h3>
            <div className="space-y-3">
              {task.due_date && (
                <div>
                  <h4 className="text-xs text-slate-500">Due Date</h4>
                  <p className="text-slate-800">{new Date(task.due_date).toLocaleDateString()}</p>
                </div>
              )}

              {task.estimated_hours && (
                <div>
                  <h4 className="text-xs text-slate-500">Estimated Hours</h4>
                  <p className="text-slate-800">{task.estimated_hours} hours</p>
                </div>
              )}

              {task.actual_hours && (
                <div>
                  <h4 className="text-xs text-slate-500">Actual Hours</h4>
                  <p className="text-slate-800">{task.actual_hours} hours</p>
                </div>
              )}

              {task.assigned_user && (
                <div>
                  <h4 className="text-xs text-slate-500">Assigned To</h4>
                  <p className="text-slate-800">{task.assigned_user.full_name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}