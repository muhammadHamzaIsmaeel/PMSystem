/**
 * IncomeForm Component
 * Form for creating/editing income records (Admin/PM roles)
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { IncomeCreate } from '@/types/financial'

const incomeSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
  payment_method: z.string().optional().nullable(),
  project_id: z.string().min(1, 'Project is required'),
})

type IncomeFormData = z.infer<typeof incomeSchema>

interface IncomeFormProps {
  initialData?: Partial<IncomeFormData>
  onSubmit: (data: IncomeCreate) => void
  onCancel?: () => void
  isLoading?: boolean
  projectId?: string
}

const paymentMethods = [
  'Bank Transfer',
  'Credit Card',
  'Check',
  'Cash',
  'Wire Transfer',
  'PayPal',
  'Other',
]

export function IncomeForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  projectId,
}: IncomeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
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
          <label
            htmlFor="payment_method"
            className="block text-sm font-medium text-secondary-900 mb-1"
          >
            Payment Method
          </label>
          <select
            {...register('payment_method')}
            id="payment_method"
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            <option value="">Select payment method</option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
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
        <label htmlFor="description" className="block text-sm font-medium text-secondary-900 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={3}
          className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          placeholder="Enter income description (e.g., Client payment, Milestone payment, etc.)"
        />
      </div>

      <div className="bg-success-50 border border-success-200 rounded-lg p-4">
        <p className="text-sm text-success-800">
          <span className="font-medium">Note:</span> This income will be recorded against the
          selected project and will be included in profit/loss calculations.
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
          {isLoading ? 'Recording...' : 'Record Income'}
        </button>
      </div>
    </form>
  )
}
