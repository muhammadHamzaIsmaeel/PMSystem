/**
 * TimeEntryForm Component
 * Form for creating/editing time entries with auto-duration calculation
 * Now supports optional task selection
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
    task_id: z.string().optional(),
    notes: z.string().optional(),
    is_billable: z.boolean().optional(),
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
      notes: '',
      is_billable: true,
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
    const submitData: TimeEntryCreate = {
      start_time: data.start_time,
      end_time: data.end_time,
      description: data.description || null,
      task_id: data.task_id || null,
      notes: data.notes || null,
      is_billable: data.is_billable ?? true,
    }
    await onSubmit(submitData)
    // Reset form after successful submission if not editing
    if (!initialData) {
      reset()
    }
  }

  // Set current time as default start time for new entries
  const setCurrentTime = () => {
    const now = new Date()
    const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)
    return localISOTime
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Task Selection (Optional) */}
      <div>
        <label htmlFor="task_id" className="block text-sm font-medium text-slate-900 mb-1">
          Task <span className="text-slate-400">(optional)</span>
        </label>
        {tasks && tasks.length > 0 ? (
          <select
            {...register('task_id')}
            id="task_id"
            disabled={isLoading}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
          >
            <option value="">No task (track general time)</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        ) : (
          <div className="text-sm text-slate-500 p-3 bg-slate-50 rounded-lg">
            No tasks available. Time will be tracked without a task assignment.
          </div>
        )}
        {errors.task_id && <p className="mt-1 text-sm text-red-600">{errors.task_id.message}</p>}
      </div>

      {/* Time Fields */}
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

      {/* Duration Display */}
      {duration && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-blue-800">
              <span className="font-medium">Duration:</span>{' '}
              {duration.hours > 0 && `${duration.hours}h `}
              {duration.minutes}m ({duration.total} minutes)
            </span>
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-900 mb-1">
          Description <span className="text-slate-400">(optional)</span>
        </label>
        <input
          {...register('description')}
          id="description"
          type="text"
          disabled={isLoading}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-100"
          placeholder="Brief description of work done"
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-900 mb-1">
          Notes <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          {...register('notes')}
          id="notes"
          rows={3}
          disabled={isLoading}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-100"
          placeholder="Additional notes about this time entry"
        />
      </div>

      {/* Billable Checkbox */}
      <div className="flex items-center gap-2">
        <input
          {...register('is_billable')}
          id="is_billable"
          type="checkbox"
          disabled={isLoading}
          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="is_billable" className="text-sm text-slate-700">
          Mark as billable time
        </label>
      </div>

      {/* Submit Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={isLoading || !duration}
          className="flex-1 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {initialData ? 'Update Entry' : 'Save Time Entry'}
            </>
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
