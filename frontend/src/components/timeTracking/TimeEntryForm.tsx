/**
 * TimeEntryForm Component
 * Form for creating/editing time entries with auto-duration calculation
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TimeEntryCreate } from '@/types/financial'
import { Task } from '@/types/task'

const timeEntrySchema = z
  .object({
    start_time: z.string().min(1, 'Start time is required'),
    end_time: z.string().min(1, 'End time is required'),
    description: z.string().optional(),
    task_id: z.string().min(1, 'Task is required'),
  })
  .refine((data) => new Date(data.end_time) > new Date(data.start_time), {
    message: 'End time must be after start time',
    path: ['end_time'],
  })

type TimeEntryFormData = z.infer<typeof timeEntrySchema>

interface TimeEntryFormProps {
  initialData?: Partial<TimeEntryFormData>
  onSubmit: (data: TimeEntryCreate) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  tasks: Task[]
}

export function TimeEntryForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  tasks = [],
}: TimeEntryFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<TimeEntryFormData>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: initialData || {
      task_id: '',
      start_time: '',
      end_time: '',
      description: '',
    },
  })

  const startTime = watch('start_time')
  const endTime = watch('end_time')

  const calculateDuration = () => {
    if (!startTime || !endTime) return null
    const start = new Date(startTime)
    const end = new Date(endTime)
    if (end <= start) return null
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMins / 60)
    const minutes = diffMins % 60
    return { hours, minutes, total: diffMins }
  }

  const duration = calculateDuration()

  const handleFormSubmit = async (data: TimeEntryFormData) => {
    await onSubmit(data)
    // Reset form after successful submission if not editing
    if (!initialData) {
      reset()
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label htmlFor="task_id" className="block text-sm font-medium text-slate-900 mb-1">
          Task <span className="text-red-500">*</span>
        </label>
        {tasks && tasks.length > 0 ? (
          <select
            {...register('task_id')}
            id="task_id"
            disabled={isLoading}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
          >
            <option value="">Select a task</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        ) : (
          <input
            {...register('task_id')}
            id="task_id"
            type="text"
            disabled={isLoading}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-100"
            placeholder="Enter task ID"
          />
        )}
        {errors.task_id && <p className="mt-1 text-sm text-red-600">{errors.task_id.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="start_time" className="block text-sm font-medium text-slate-900 mb-1">
            Start Time <span className="text-red-500">*</span>
          </label>
          <input
            {...register('start_time')}
            id="start_time"
            type="datetime-local"
            disabled={isLoading}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-100"
          />
          {errors.start_time && (
            <p className="mt-1 text-sm text-red-600">{errors.start_time.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="end_time" className="block text-sm font-medium text-slate-900 mb-1">
            End Time <span className="text-red-500">*</span>
          </label>
          <input
            {...register('end_time')}
            id="end_time"
            type="datetime-local"
            disabled={isLoading}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-100"
          />
          {errors.end_time && (
            <p className="mt-1 text-sm text-red-600">{errors.end_time.message}</p>
          )}
        </div>
      </div>

      {duration && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Calculated Duration:</span>{' '}
            {duration.hours > 0 && `${duration.hours}h `}
            {duration.minutes}m ({duration.total} minutes)
          </p>
        </div>
      )}

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-900 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={3}
          disabled={isLoading}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-100"
          placeholder="What did you work on?"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={isLoading || !duration}
          className="flex-1 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Entry' : 'Save Time Entry'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-6 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}