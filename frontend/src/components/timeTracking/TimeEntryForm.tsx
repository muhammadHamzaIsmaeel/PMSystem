/**
 * TimeEntryForm Component
 * Form for creating/editing time entries with auto-duration calculation
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TimeEntryCreate } from '@/types/financial'
import { useEffect } from 'react'

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
  onSubmit: (data: TimeEntryCreate) => void
  onCancel?: () => void
  isLoading?: boolean
  taskId?: string
}

export function TimeEntryForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  taskId,
}: TimeEntryFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TimeEntryFormData>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: initialData || {
      task_id: taskId || '',
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="task_id" className="block text-sm font-medium text-secondary-900 mb-1">
          Task ID *
        </label>
        <input
          {...register('task_id')}
          id="task_id"
          type="text"
          className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          placeholder="Enter task ID"
          disabled={!!taskId}
        />
        {errors.task_id && <p className="mt-1 text-sm text-error-600">{errors.task_id.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="start_time" className="block text-sm font-medium text-secondary-900 mb-1">
            Start Time *
          </label>
          <input
            {...register('start_time')}
            id="start_time"
            type="datetime-local"
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
          {errors.start_time && (
            <p className="mt-1 text-sm text-error-600">{errors.start_time.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="end_time" className="block text-sm font-medium text-secondary-900 mb-1">
            End Time *
          </label>
          <input
            {...register('end_time')}
            id="end_time"
            type="datetime-local"
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
          {errors.end_time && (
            <p className="mt-1 text-sm text-error-600">{errors.end_time.message}</p>
          )}
        </div>
      </div>

      {duration && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <p className="text-sm text-primary-800">
            <span className="font-medium">Calculated Duration:</span>{' '}
            {duration.hours > 0 && `${duration.hours}h `}
            {duration.minutes}m ({duration.total} minutes)
          </p>
        </div>
      )}

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-secondary-900 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={3}
          className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          placeholder="What did you work on?"
        />
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
          disabled={isLoading || !duration}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Saving...' : 'Save Time Entry'}
        </button>
      </div>
    </form>
  )
}
