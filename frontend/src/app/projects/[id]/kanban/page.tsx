/**
 * Kanban Page
 * Real-time Kanban board for project task management
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { Task } from '@/types/task'
import { useAuth } from '@/hooks/useAuth'

export default function KanbanPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const projectId = params.id as string

  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchKanbanData()
  }, [projectId, user])

  const fetchKanbanData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`/api/v1/kanban/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch Kanban board data')
      }

      const data = await response.json()

      // Convert columns object to flat array of tasks
      const allTasks: Task[] = []
      Object.values(data.columns).forEach((columnTasks: any) => {
        allTasks.push(...columnTasks)
      })

      setTasks(allTasks)
    } catch (error) {
      console.error('Error fetching Kanban data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load Kanban board')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-secondary-600">Loading Kanban board...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-error-50 border border-error-200 rounded-lg p-6">
          <h2 className="text-error-900 font-semibold mb-2">Error loading Kanban board</h2>
          <p className="text-error-700">{error}</p>
          <button
            onClick={() => fetchKanbanData()}
            className="mt-4 px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const token = localStorage.getItem('token') || ''

  return (
    <div className="container mx-auto px-4 py-8 h-screen flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Kanban Board</h1>
          <p className="text-secondary-600 mt-1">
            Drag and drop tasks to update their status
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/projects/${projectId}`)}
            className="px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors"
          >
            Back to Project
          </button>
          <button
            onClick={() => router.push(`/tasks/new?project_id=${projectId}`)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      {tasks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-secondary-600 mb-4">No tasks found for this project</p>
            <button
              onClick={() => router.push(`/tasks/new?project_id=${projectId}`)}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create First Task
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <KanbanBoard projectId={projectId} initialTasks={tasks} token={token} />
        </div>
      )}
    </div>
  )
}
