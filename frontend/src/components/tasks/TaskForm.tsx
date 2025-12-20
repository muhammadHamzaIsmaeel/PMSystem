/**
 * TaskForm Component
 * Form for creating/editing tasks with subtask support and Zod validation
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TaskCreate, TaskPriority, TaskStatus } from '@/types/task'

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  priority: z.nativeEnum(TaskPriority),
  status: z.nativeEnum(TaskStatus),
  due_date: z.string().optional().nullable(),
  estimated_hours: z.number().positive('Estimated hours must be positive').optional().nullable(),
  project_id: z.string().min(1, 'Project is required'),
  assigned_to_id: z.string().min(1, 'Assignee is required'),
  parent_task_id: z.string().optional().nullable(),
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormProps {
  initialData?: Partial<TaskFormData>
  onSubmit: (data: TaskCreate) => void
  onCancel?: () => void
  isLoading?: boolean
  isSubtask?: boolean
  parentTaskId?: string
}

export function TaskForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isSubtask = false,
  parentTaskId,
}: TaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: initialData || {
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      parent_task_id: parentTaskId || null,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {isSubtask && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <p className="text-sm text-primary-800">
            <span className="font-medium">Creating subtask</span> for parent task: {parentTaskId}
          </p>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-secondary-900 mb-1">
          Task Title *
        </label>
        <input
          {...register('title')}
          id="title"
          type="text"
          className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          placeholder="Enter task title"
        />
        {errors.title && <p className="mt-1 text-sm text-error-600">{errors.title.message}</p>}
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
          placeholder="Enter task description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-secondary-900 mb-1">
            Priority *
          </label>
          <select
            {...register('priority')}
            id="priority"
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            <option value={TaskPriority.LOW}>Low</option>
            <option value={TaskPriority.MEDIUM}>Medium</option>
            <option value={TaskPriority.HIGH}>High</option>
            <option value={TaskPriority.URGENT}>Urgent</option>
            <option value={TaskPriority.CRITICAL}>Critical</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-secondary-900 mb-1">
            Status *
          </label>
          <select
            {...register('status')}
            id="status"
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            <option value={TaskStatus.TODO}>To Do</option>
            <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
            <option value={TaskStatus.REVIEW}>Review</option>
            <option value={TaskStatus.DONE}>Done</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-secondary-900 mb-1">
            Due Date
          </label>
          <input
            {...register('due_date')}
            id="due_date"
            type="date"
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="estimated_hours"
            className="block text-sm font-medium text-secondary-900 mb-1"
          >
            Estimated Hours
          </label>
          <input
            {...register('estimated_hours', { valueAsNumber: true })}
            id="estimated_hours"
            type="number"
            step="0.5"
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            placeholder="0.0"
          />
          {errors.estimated_hours && (
            <p className="mt-1 text-sm text-error-600">{errors.estimated_hours.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="project_id" className="block text-sm font-medium text-secondary-900 mb-1">
            Project ID *
          </label>
          <input
            {...register('project_id')}
            id="project_id"
            type="text"
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            placeholder="Enter project ID"
            disabled={isSubtask && !!initialData?.project_id}
          />
          {errors.project_id && (
            <p className="mt-1 text-sm text-error-600">{errors.project_id.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="assigned_to_id"
            className="block text-sm font-medium text-secondary-900 mb-1"
          >
            Assigned To ID *
          </label>
          <input
            {...register('assigned_to_id')}
            id="assigned_to_id"
            type="text"
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            placeholder="Enter user ID"
          />
          {errors.assigned_to_id && (
            <p className="mt-1 text-sm text-error-600">{errors.assigned_to_id.message}</p>
          )}
        </div>
      </div>

      {!isSubtask && (
        <input type="hidden" {...register('parent_task_id')} value={parentTaskId || ''} />
      )}

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
          {isLoading ? 'Saving...' : isSubtask ? 'Create Subtask' : 'Save Task'}
        </button>
      </div>
    </form>
  )
}
