/**
 * ExpenseForm Component
 * Form for creating/editing expenses with category and receipt upload
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ExpenseCreate } from '@/types/financial'

const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
  project_id: z.string().min(1, 'Project is required'),
  task_id: z.string().optional().nullable(),
  receipt_file_id: z.string().optional().nullable(),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>
  onSubmit: (data: ExpenseCreate) => void
  onCancel?: () => void
  isLoading?: boolean
  projectId?: string
}

const expenseCategories = [
  'Materials',
  'Equipment',
  'Software',
  'Licenses',
  'Travel',
  'Meals',
  'Office Supplies',
  'Utilities',
  'Consulting',
  'Marketing',
  'Training',
  'Other',
]

export function ExpenseForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  projectId,
}: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: initialData || {
      project_id: projectId || '',
      date: new Date().toISOString().split('T')[0],
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-secondary-900 mb-1">
            Amount ($) *
          </label>
          <input
            {...register('amount', { valueAsNumber: true })}
            id="amount"
            type="number"
            step="0.01"
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            placeholder="0.00"
          />
          {errors.amount && <p className="mt-1 text-sm text-error-600">{errors.amount.message}</p>}
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-secondary-900 mb-1">
            Date *
          </label>
          <input
            {...register('date')}
            id="date"
            type="date"
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
          {errors.date && <p className="mt-1 text-sm text-error-600">{errors.date.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-secondary-900 mb-1">
            Category *
          </label>
          <select
            {...register('category')}
            id="category"
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            <option value="">Select category</option>
            {expenseCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-error-600">{errors.category.message}</p>
          )}
        </div>

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
            disabled={!!projectId}
          />
          {errors.project_id && (
            <p className="mt-1 text-sm text-error-600">{errors.project_id.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="task_id" className="block text-sm font-medium text-secondary-900 mb-1">
          Task ID (Optional)
        </label>
        <input
          {...register('task_id')}
          id="task_id"
          type="text"
          className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          placeholder="Enter task ID (optional)"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-secondary-900 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={3}
          className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          placeholder="Enter expense description"
        />
      </div>

      <div>
        <label
          htmlFor="receipt_file_id"
          className="block text-sm font-medium text-secondary-900 mb-1"
        >
          Receipt File ID (Optional)
        </label>
        <input
          {...register('receipt_file_id')}
          id="receipt_file_id"
          type="text"
          className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          placeholder="Enter receipt file ID (optional)"
        />
        <p className="mt-1 text-xs text-secondary-500">
          Upload receipt to file storage and enter the file ID here
        </p>
      </div>

      <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
        <p className="text-sm text-warning-800">
          <span className="font-medium">Note:</span> This expense will be submitted for approval by
          the Finance team. You will be notified once it's approved or rejected.
        </p>
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
          {isLoading ? 'Submitting...' : 'Submit Expense'}
        </button>
      </div>
    </form>
  )
}
