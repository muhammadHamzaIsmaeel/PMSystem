/**
 * Financial Dashboard Page
 * Combined view for both income and expenses
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useHasRole } from '@/hooks/useAuth'
import { UserRole } from '@/types/common'
import { apiClient } from '@/lib/api'
import { Expense, ApprovalStatus } from '@/types/financial'

export default function FinancialPage() {
  const router = useRouter()
  const { user } = useAuth()
  const canCreateIncome = useHasRole([UserRole.ADMIN, UserRole.FINANCE])
  const isFinance = useHasRole([UserRole.FINANCE, UserRole.ADMIN])

  // Income state
  const [incomeList, setIncomeList] = useState<any[]>([])
  const [incomeCurrentPage, setIncomeCurrentPage] = useState(1)
  const [incomeLoading, setIncomeLoading] = useState(true)
  const incomePageSize = 10

  // Expenses state
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [expenseStatusFilter, setExpenseStatusFilter] = useState<ApprovalStatus | 'ALL'>('ALL')
  const [expenseCurrentPage, setExpenseCurrentPage] = useState(1)
  const [expenseLoading, setExpenseLoading] = useState(true)
  const expensePageSize = 10

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchIncome()
    fetchExpenses()
  }, [user])

  useEffect(() => {
    fetchIncome()
  }, [incomeCurrentPage])

  useEffect(() => {
    fetchExpenses()
  }, [expenseCurrentPage, expenseStatusFilter])

  const fetchIncome = async () => {
    try {
      setIncomeLoading(true)
      const skip = (incomeCurrentPage - 1) * incomePageSize

      const data = await apiClient.get<any>(`/income?skip=${skip}&limit=${incomePageSize}`)
      setIncomeList(data.income || data.items || data)
    } catch (error) {
      console.error('Error fetching income:', error)
    } finally {
      setIncomeLoading(false)
    }
  }

  const fetchExpenses = async () => {
    try {
      setExpenseLoading(true)
      const skip = (expenseCurrentPage - 1) * expensePageSize
      let url = `/expenses?skip=${skip}&limit=${expensePageSize}`
      if (expenseStatusFilter !== 'ALL') {
        url += `&approval_status=${expenseStatusFilter}`
      }

      const data = await apiClient.get<any>(url)
      setExpenses(data.expenses || data.items || data)
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setExpenseLoading(false)
    }
  }

  const handleApprove = async (expenseId: string) => {
    try {
      await apiClient.patch(`/expenses/${expenseId}/approve`, {})
      fetchExpenses()
    } catch (error) {
      console.error('Error approving expense:', error)
      alert(error instanceof Error ? error.message : 'Failed to approve expense')
    }
  }

  const handleReject = async (expenseId: string) => {
    if (!confirm('Are you sure you want to reject this expense?')) {
      return
    }

    try {
      await apiClient.patch(`/expenses/${expenseId}/reject`, {})
      fetchExpenses()
    } catch (error) {
      console.error('Error rejecting expense:', error)
      alert(error instanceof Error ? error.message : 'Failed to reject expense')
    }
  }

  const filteredExpenses = expenses.filter((expense) => {
    if (expenseStatusFilter === 'ALL') return true
    return expense.approval_status === expenseStatusFilter
  })

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">Financial Dashboard</h1>
        <p className="text-secondary-600 mt-2">
          Track and manage project income and expenses
        </p>
      </div>

      {/* Income Section */}
      <div className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900">Income</h2>
            <p className="text-secondary-600 mt-1">
              Project revenue and income entries
            </p>
          </div>

          {canCreateIncome && (
            <button
              onClick={() => router.push('/income/new')}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add Income
            </button>
          )}
        </div>

        {incomeLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-secondary-600">Loading income...</p>
            </div>
          </div>
        ) : incomeList.length === 0 ? (
          <div className="text-center py-8 bg-white border border-secondary-200 rounded-lg">
            <p className="text-secondary-600">No income entries found</p>
            {canCreateIncome && (
              <button
                onClick={() => router.push('/income/new')}
                className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Add First Income Entry
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {incomeList.slice(0, 5).map((income) => (
              <div key={income.id} className="bg-white border border-secondary-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                      {income.source}
                    </h3>

                    {income.description && (
                      <p className="text-secondary-700 mb-3">{income.description}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-secondary-600">Amount:</span>
                        <p className="font-semibold text-success-600 text-lg">
                          ${income.amount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-secondary-600">Date:</span>
                        <p className="font-semibold text-secondary-900">
                          {new Date(income.income_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-secondary-600">Project ID:</span>
                        <p className="font-semibold text-secondary-900">{income.project_id}</p>
                      </div>
                      <div>
                        <span className="text-secondary-600">Created:</span>
                        <p className="font-semibold text-secondary-900">
                          {new Date(income.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="text-center mt-4">
              <button
                onClick={() => router.push('/income')}
                className="px-6 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
              >
                View All Income
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Expenses Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-secondary-900">Expenses</h2>
          <p className="text-secondary-600 mt-1">
            {isFinance ? 'Review and approve expense submissions' : 'Your submitted expenses'}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-secondary-200 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label htmlFor="status-filter" className="text-sm font-medium text-secondary-700 mr-2">
                Filter by Status:
              </label>
              <select
                id="status-filter"
                value={expenseStatusFilter}
                onChange={(e) => setExpenseStatusFilter(e.target.value as ApprovalStatus | 'ALL')}
                className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="ALL">All Status</option>
                <option value={ApprovalStatus.PENDING}>Pending</option>
                <option value={ApprovalStatus.APPROVED}>Approved</option>
                <option value={ApprovalStatus.REJECTED}>Rejected</option>
              </select>
            </div>

            <div className="ml-auto">
              <button
                onClick={() => router.push('/expenses/new')}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Submit New Expense
              </button>
            </div>
          </div>
        </div>

        {expenseLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-secondary-600">Loading expenses...</p>
            </div>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="text-center py-8 bg-white border border-secondary-200 rounded-lg">
            <p className="text-secondary-600">No expenses found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExpenses.slice(0, 5).map((expense) => (
              <div key={expense.id} className="bg-white border border-secondary-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-secondary-900">
                        {expense.category}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          expense.approval_status === ApprovalStatus.APPROVED
                            ? 'bg-success-100 text-success-800'
                            : expense.approval_status === ApprovalStatus.REJECTED
                            ? 'bg-error-100 text-error-800'
                            : 'bg-warning-100 text-warning-800'
                        }`}
                      >
                        {expense.approval_status}
                      </span>
                    </div>

                    {expense.description && (
                      <p className="text-secondary-700 mb-3">{expense.description}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-secondary-600">Amount:</span>
                        <p className="font-semibold text-secondary-900">
                          ${expense.amount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-secondary-600">Date:</span>
                        <p className="font-semibold text-secondary-900">
                          {new Date(expense.expense_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-secondary-600">Project ID:</span>
                        <p className="font-semibold text-secondary-900">{expense.project_id}</p>
                      </div>
                      {expense.task_id && (
                        <div>
                          <span className="text-secondary-600">Task ID:</span>
                          <p className="font-semibold text-secondary-900">{expense.task_id}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons - Finance and Admin can approve/reject */}
                  {isFinance && expense.approval_status === ApprovalStatus.PENDING && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleApprove(expense.id)}
                        className="px-4 py-2 bg-gray-600 text-black rounded-lg hover:bg-success-700 transition-colors font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(expense.id)}
                        className="px-4 py-2 bg-gray-600 text-black rounded-lg hover:bg-error-700 transition-colors font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div className="text-center mt-4">
              <button
                onClick={() => router.push('/expenses')}
                className="px-6 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
              >
                View All Expenses
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}