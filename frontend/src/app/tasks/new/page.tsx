/**
 * Create Task Page
 * Page for creating new tasks with project and user selection
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TaskCreate } from '@/types/task'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'

export default function CreateTaskPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const [projects, setProjects] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'ToDo',
    deadline: '',
    project_id: searchParams?.get('project_id') || '',
    assigned_user_id: '',
    parent_task_id: searchParams?.get('parent_task_id') || null,
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchProjects()
    fetchUsers()
  }, [user])

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
        progress: 0,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
        project_id: formData.project_id,
        assigned_user_id: formData.assigned_user_id || undefined,
      }

      if (formData.parent_task_id) {
        taskData.parent_task_id = formData.parent_task_id
      }

      await apiClient.post('/tasks', taskData)

      alert('Task created successfully!')
      router.push('/tasks')
    } catch (error: any) {
      console.error('Error creating task:', error)
      const errorMsg = error?.message || 'Failed to create task. Please check all fields.'
      alert(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary-900">
          {formData.parent_task_id ? 'Create Subtask' : 'Create New Task'}
        </h1>
        <p className="text-secondary-600 mt-2">
          Fill in the details to create a new task
        </p>
      </div>

      <div className="bg-white border border-secondary-200 rounded-lg p-6 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {formData.parent_task_id && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="text-sm text-primary-800">
                <span className="font-medium">Creating subtask</span> for parent task: {formData.parent_task_id}
              </p>
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-secondary-900 mb-1">
              Task Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-secondary-900 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="Enter task description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="project_id" className="block text-sm font-medium text-secondary-900 mb-1">
                Project *
              </label>
              <select
                id="project_id"
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                required
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
                Assign To *
              </label>
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
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-secondary-900 mb-1">
                Priority *
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
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

          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-secondary-900 mb-1">
              Deadline (Optional)
            </label>
            <input
              id="deadline"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
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
              {isLoading ? 'Creating...' : formData.parent_task_id ? 'Create Subtask' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
