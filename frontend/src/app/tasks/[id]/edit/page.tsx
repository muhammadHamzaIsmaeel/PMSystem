/**
 * Edit Task Page
 * Page for editing existing tasks
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Task, TaskUpdate } from '@/types/task'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'

export default function EditTaskPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const taskId = params.id as string

  const [task, setTask] = useState<Task | null>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'ToDo',
    progress: 0,
    deadline: '',
    project_id: '',
    assigned_user_id: '',
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchTask()

    // Only Admin and PM can change project/assignment
    if (user.role === 'Admin' || user.role === 'ProjectManager') {
      fetchProjects()
      fetchUsers()
    }
  }, [user, taskId])

  const fetchTask = async () => {
    try {
      setIsFetching(true)
      const data = await apiClient.get<Task>(`/tasks/${taskId}`)
      setTask(data)

      // Pre-fill form with existing task data
      setFormData({
        title: data.title || '',
        description: data.description || '',
        priority: data.priority || 'Medium',
        status: data.status || 'ToDo',
        progress: data.progress || 0,
        deadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : '',
        project_id: data.project_id || '',
        assigned_user_id: data.assigned_user_id || '',
      })
    } catch (error) {
      console.error('Error fetching task:', error)
      alert('Failed to load task')
      router.push('/tasks')
    } finally {
      setIsFetching(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const data = await apiClient.get<any>('/projects?skip=0&limit=100')
      setProjects(data.items || data.projects || data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const data = await apiClient.get<any>('/users')
      setUsers(data.users || data.items || data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // Handle numeric inputs
    if (name === 'progress') {
      const numValue = parseInt(value)
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
        setFormData((prev: any) => ({ ...prev, [name]: numValue }))
      }
      return
    }

    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.project_id || !formData.assigned_user_id) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setIsLoading(true)

      const taskData: any = {
        title: formData.title,
        description: formData.description || undefined,
        priority: formData.priority,
        status: formData.status,
        progress: formData.progress,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
        assigned_user_id: formData.assigned_user_id,
      }

      await apiClient.put(`/tasks/${taskId}`, taskData)

      alert('Task updated successfully!')
      router.push('/tasks')
    } catch (error: any) {
      console.error('Error updating task:', error)
      const errorMsg = error?.message || 'Failed to update task. Please check all fields.'
      alert(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || isFetching) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-secondary-600">Loading task...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-secondary-600">Task not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary-900">Edit Task</h1>
        <p className="text-secondary-600 mt-2">
          Update task details
        </p>
      </div>

      <div className="bg-white border border-secondary-200 rounded-lg p-6 max-w-3xl">
        {user?.role === 'TeamMember' && (
          <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <p className="text-sm text-primary-800">
              <strong>Note:</strong> You can only update the <strong>Status</strong> and <strong>Progress</strong> of this task.
              Other fields are managed by your Project Manager.
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-secondary-900 mb-1">
              Task Title {user?.role === 'TeamMember' && '(Read-only)'}
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-2 border border-secondary-300 rounded-lg outline-none ${
                user?.role === 'TeamMember'
                  ? 'bg-secondary-50 cursor-not-allowed opacity-75'
                  : 'focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              }`}
              placeholder="Enter task title"
              required
              disabled={user?.role === 'TeamMember'}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-secondary-900 mb-1">
              Description {user?.role === 'TeamMember' && '(Read-only)'}
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-2 border border-secondary-300 rounded-lg outline-none ${
                user?.role === 'TeamMember'
                  ? 'bg-secondary-50 cursor-not-allowed opacity-75'
                  : 'focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              }`}
              placeholder="Enter task description"
              disabled={user?.role === 'TeamMember'}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="project_id" className="block text-sm font-medium text-secondary-900 mb-1">
                Project (Cannot be changed)
              </label>
              <select
                id="project_id"
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-secondary-300 bg-secondary-50 rounded-lg outline-none cursor-not-allowed opacity-75"
                disabled
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="assigned_user_id" className="block text-sm font-medium text-secondary-900 mb-1">
                Assign To {user?.role === 'TeamMember' && '(Read-only)'}
              </label>
              {user?.role === 'TeamMember' ? (
                <input
                  type="text"
                  value={formData.assigned_user_id}
                  className="w-full px-4 py-2 border border-secondary-300 bg-secondary-50 rounded-lg outline-none cursor-not-allowed opacity-75"
                  disabled
                />
              ) : (
                <select
                  id="assigned_user_id"
                  name="assigned_user_id"
                  value={formData.assigned_user_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select a user</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.role})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-secondary-900 mb-1">
                Priority {user?.role === 'TeamMember' && '(Read-only)'}
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={`w-full px-4 py-2 border border-secondary-300 rounded-lg outline-none ${
                  user?.role === 'TeamMember'
                    ? 'bg-secondary-50 cursor-not-allowed opacity-75'
                    : 'focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                }`}
                disabled={user?.role === 'TeamMember'}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-secondary-900 mb-1">
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="ToDo">To Do</option>
                <option value="InProgress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="progress" className="block text-sm font-medium text-secondary-900 mb-1">
                Progress (0-100%)
              </label>
              <input
                id="progress"
                name="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-secondary-900 mb-1">
                Deadline {user?.role === 'TeamMember' && '(Read-only)'}
              </label>
              <input
                id="deadline"
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
                className={`w-full px-4 py-2 border border-secondary-300 rounded-lg outline-none ${
                  user?.role === 'TeamMember'
                    ? 'bg-secondary-50 cursor-not-allowed opacity-75'
                    : 'focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                }`}
                disabled={user?.role === 'TeamMember'}
              />
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Updating...' : 'Update Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
