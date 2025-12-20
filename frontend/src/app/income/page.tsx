/**
 * Income Page
 * View and manage project income entries
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useHasRole } from '@/hooks/useAuth'
import { UserRole } from '@/types/common'
import { apiClient } from '@/lib/api'

export default function IncomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const canCreate = useHasRole([UserRole.ADMIN, UserRole.FINANCE])

  const [incomeList, setIncomeList] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const pageSize = 20

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchIncome()
  }, [currentPage, user])

  const fetchIncome = async () => {
    try {
      setIsLoading(true)
      const skip = (currentPage - 1) * pageSize

      const data = await apiClient.get<any>(`/income?skip=${skip}&limit=${pageSize}`)
      setIncomeList(data.income || data.items || data)
    } catch (error) {
      console.error('Error fetching income:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-secondary-600">Loading income...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Income</h1>
          <p className="text-secondary-600 mt-2">
            Track project revenue and income
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => router.push('/income/new')}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Add Income
          </button>
        )}
      </div>

      {incomeList.length === 0 ? (
        <div className="text-center py-12 bg-white border border-secondary-200 rounded-lg">
          <p className="text-secondary-600">No income entries found</p>
          {canCreate && (
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
          {incomeList.map((income) => (
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
        </div>
      )}
    </div>
  )
}
