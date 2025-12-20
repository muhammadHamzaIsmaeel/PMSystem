/**
 * ProjectForm Component
 * Form for creating/editing projects with Zod validation
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ProjectCreate, ProjectStatus } from '@/types/project'
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  client_name: z.string().min(1, 'Client name is required'),
  description: z.string().optional(),
  budget: z.number().positive('Budget must be positive').optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  status: z.nativeEnum(ProjectStatus),
  manager_id: z.string().min(1, 'Manager is required'),
})

type ProjectFormData = z.infer<typeof projectSchema>

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>
  onSubmit: (data: ProjectCreate) => void
  onCancel?: () => void
  isLoading?: boolean
  currentUser?: any  // Add current user to check role
}

export function ProjectForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  currentUser,
}: ProjectFormProps) {
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const isAdmin = currentUser?.role === 'Admin'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData || {
      status: ProjectStatus.PLANNING,
      manager_id: !isAdmin && currentUser?.id ? currentUser.id : '',  // Auto-set for non-Admin
    },
  })

  useEffect(() => {
    // Only fetch users if Admin (who can select different managers)
    if (isAdmin) {
      fetchUsers()
    } else {
      setLoadingUsers(false)
    }
  }, [isAdmin])

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const data = await apiClient.get<any>('/users')
      // Filter for Admin and ProjectManager roles
      const managers = (data.users || data.items || data).filter(
        (u: any) => u.role === 'Admin' || u.role === 'ProjectManager'
      )
      setUsers(managers)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-secondary-900 mb-1">
            Project Name *
          </label>
          <input
            {...register('name')}
            id="name"
            type="text"
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            placeholder="Enter project name"
          />
          {errors.name && <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>}
        </div>

        <div>
          <label
            htmlFor="client_name"
            className="block text-sm font-medium text-secondary-900 mb-1"
          >
            Client Name *
          </label>
          <input
            {...register('client_name')}
            id="client_name"
            type="text"
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            placeholder="Enter client name"
          />
          {errors.client_name && (
            <p className="mt-1 text-sm text-error-600">{errors.client_name.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-secondary-900 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={4}
          className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          placeholder="Enter project description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-secondary-900 mb-1">
            Budget ($)
          </label>
          <input
            {...register('budget', { valueAsNumber: true })}
            id="budget"
            type="number"
            step="0.01"
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            placeholder="0.00"
          />
          {errors.budget && <p className="mt-1 text-sm text-error-600">{errors.budget.message}</p>}
        </div>

        <div>
          <label
            htmlFor="start_date"
            className="block text-sm font-medium text-secondary-900 mb-1"
          >
            Start Date
          </label>
          <input
            {...register('start_date')}
            id="start_date"
            type="date"
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-secondary-900 mb-1">
            End Date
          </label>
          <input
            {...register('end_date')}
            id="end_date"
            type="date"
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-secondary-900 mb-1">
            Status *
          </label>
          <select
            {...register('status')}
            id="status"
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            <option value={ProjectStatus.PLANNING}>Planning</option>
            <option value={ProjectStatus.IN_PROGRESS}>In Progress</option>
            <option value={ProjectStatus.ON_HOLD}>On Hold</option>
            <option value={ProjectStatus.COMPLETED}>Completed</option>
            <option value={ProjectStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="manager_id"
            className="block text-sm font-medium text-secondary-900 mb-1"
          >
            Project Manager *
          </label>
          {isAdmin ? (
            // Admin: Show dropdown to select any manager
            <select
              {...register('manager_id')}
              id="manager_id"
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              disabled={loadingUsers}
            >
              <option value="">
                {loadingUsers ? 'Loading users...' : 'Select a project manager'}
              </option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name} ({user.role})
                </option>
              ))}
            </select>
          ) : (
            // Project Manager: Auto-assigned to self (read-only display)
            <>
              <input
                {...register('manager_id')}
                type="hidden"
                value={currentUser?.id || ''}
              />
              <div className="w-full px-4 py-2 border border-secondary-200 bg-secondary-50 rounded-lg text-secondary-700">
                {currentUser?.full_name || 'You'} (Auto-assigned)
              </div>
              <p className="mt-1 text-xs text-secondary-500">
                You will be automatically assigned as the project manager
              </p>
            </>
          )}
          {errors.manager_id && (
            <p className="mt-1 text-sm text-error-600">{errors.manager_id.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-4 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Saving...' : 'Save Project'}
        </button>
      </div>
    </form>
  )
}
