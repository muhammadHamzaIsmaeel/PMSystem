/**
 * My Tasks Page
 * Team Member view showing assigned tasks
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TaskList } from '@/components/tasks/TaskList'
import { Task } from '@/types/task'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'

export default function MyTasksPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const pageSize = 20

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchTasks()
  }, [currentPage, user])

  const fetchTasks = async () => {
    try {
      setIsLoading(true)
      const skip = (currentPage - 1) * pageSize

      // Backend filters tasks by user role automatically, no need for assigned_to_id
      const data = await apiClient.get<any>(`/tasks?skip=${skip}&limit=${pageSize}`)

      setTasks(data.tasks || data.items || data)
      setTotalCount(data.total || data.count || (data.tasks || data.items || data).length)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (task: Task) => {
    router.push(`/tasks/${task.id}/edit`)
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return
    }

    try {
      await apiClient.delete(`/tasks/${taskId}`)
      fetchTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Failed to delete task')
    }
  }

  const handleCreate = () => {
    router.push('/tasks/new')
  }

  const handleCreateSubtask = (parentTaskId: string) => {
    router.push(`/tasks/new?parent_task_id=${parentTaskId}`)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-slate-50">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading tasks...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-slate-50/50 rounded-lg shadow">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">My Tasks</h1>
        <p className="text-slate-600 mt-2">
          View and manage tasks assigned to you
        </p>
      </div>

      <TaskList
        tasks={tasks}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        onCreateSubtask={handleCreateSubtask}
        showProjectLink={true}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
