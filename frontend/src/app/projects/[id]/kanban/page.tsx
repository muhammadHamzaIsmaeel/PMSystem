/**
 * Project-specific Kanban Board Page
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { Task } from '@/types/task'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'

export default function ProjectKanbanPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, token } = useAuth()

  const [projectId, setProjectId] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const pathSegments = pathname.split('/')
    const id = pathSegments[2] // Assuming URL is /projects/[id]/kanban
    if (id) {
      setProjectId(id)
    } else {
      setError('Project ID not found in URL.')
      setIsLoading(false)
    }
  }, [user, pathname])

  useEffect(() => {
    if (projectId && token) {
      fetchTasks(projectId, token)
    }
  }, [projectId, token])

  const fetchTasks = async (projId: string, authToken: string) => {
    try {
      setIsLoading(true)
      setError(null)
      // Fetch tasks associated with this project
      const response = await apiClient.get<any>(`/tasks?project_id=${projId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      setTasks(response.items || [])
    } catch (err) {
      console.error('Error fetching tasks for Kanban:', err)
      setError('Failed to load tasks for the Kanban board.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-slate-50">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading Kanban board...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 bg-slate-50 rounded-lg shadow">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center bg-red-100 text-red-800 border border-red-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p>{error}</p>
            <button
              onClick={() => fetchTasks(projectId!, token!)}
              className="mt-6 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/kanban')}
              className="mt-6 ml-4 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Select Another Project
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!projectId || !token) {
    return (
      <div className="container mx-auto px-4 py-8 bg-slate-50 rounded-lg shadow">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Project Not Found</h2>
            <p className="text-slate-600">Please select a project to view its Kanban board.</p>
            <button
              onClick={() => router.push('/kanban')}
              className="mt-6 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Select Project
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (tasks.length === 0 && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-slate-50 rounded-lg shadow">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">No Tasks Found</h2>
            <p className="text-slate-600">There are no tasks for this project yet.</p>
            {/* Optionally add a button to create a task */}
            <button
              onClick={() => router.push(`/tasks/new?project_id=${projectId}`)}
              className="mt-6 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Task
            </button>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="flex flex-col h-full bg-slate-50 p-4 rounded-lg shadow min-h-[calc(100vh-10rem)]">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Kanban Board</h1>
        <button
          onClick={() => router.push(`/tasks/new?project_id=${projectId}`)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Task
        </button>
      </div>
      {tasks && tasks.length > 0 && token && (
        <KanbanBoard projectId={projectId} initialTasks={tasks} token={token} />
      )}
    </div>
  )
}