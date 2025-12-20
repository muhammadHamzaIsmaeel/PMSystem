/**
 * Project Detail Page
 * Shows project information with tasks, expenses, income, and profit/loss
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Project, ProjectStatus } from '@/types/project'
import { Task } from '@/types/task'
import { Expense, Income, ProfitLoss } from '@/types/financial'
import { TaskList } from '@/components/tasks/TaskList'
import { ProfitLossDisplay } from '@/components/financial/ProfitLossDisplay'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'

type TabType = 'tasks' | 'expenses' | 'income' | 'financials'

const statusColors = {
  [ProjectStatus.PLANNING]: 'bg-secondary-100 text-secondary-800',
  [ProjectStatus.IN_PROGRESS]: 'bg-primary-100 text-primary-800',
  [ProjectStatus.ON_HOLD]: 'bg-warning-100 text-warning-800',
  [ProjectStatus.COMPLETED]: 'bg-success-100 text-success-800',
  [ProjectStatus.CANCELLED]: 'bg-error-100 text-error-800',
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const projectId = params.id as string

  const [activeTab, setActiveTab] = useState<TabType>('tasks')
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [income, setIncome] = useState<Income[]>([])
  const [profitLoss, setProfitLoss] = useState<ProfitLoss | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchProjectData()
  }, [projectId, user])

  useEffect(() => {
    if (activeTab === 'tasks') fetchTasks()
    if (activeTab === 'expenses') fetchExpenses()
    if (activeTab === 'income') fetchIncome()
    if (activeTab === 'financials') fetchProfitLoss()
  }, [activeTab])

  const fetchProjectData = async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.get<Project>(`/projects/${projectId}`)
      setProject(data)
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTasks = async () => {
    try {
      const data = await apiClient.get<any>(`/tasks?project_id=${projectId}`)
      setTasks(data.tasks || data.items || data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const fetchExpenses = async () => {
    try {
      const data = await apiClient.get<any>(`/expenses?project_id=${projectId}`)
      setExpenses(data.expenses || data.items || data)
    } catch (error) {
      console.error('Error fetching expenses:', error)
    }
  }

  const fetchIncome = async () => {
    try {
      const data = await apiClient.get<any>(`/income?project_id=${projectId}`)
      setIncome(data.income || data.items || data)
    } catch (error) {
      console.error('Error fetching income:', error)
    }
  }

  const fetchProfitLoss = async () => {
    try {
      const data = await apiClient.get<ProfitLoss>(`/income/projects/${projectId}/profit-loss`)
      setProfitLoss(data)
    } catch (error) {
      console.error('Error fetching profit/loss:', error)
    }
  }

  if (!user || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-secondary-600">Loading project...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-secondary-600">Project not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Project Header */}
      <div className="bg-white border border-secondary-200 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-secondary-900">{project.name}</h1>
            <p className="text-secondary-600 mt-1">Client: {project.client_name}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[project.status]}`}>
            {project.status}
          </span>
        </div>

        {project.description && (
          <p className="text-secondary-700 mb-4">{project.description}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {project.budget && (
            <div>
              <span className="text-secondary-600">Budget:</span>
              <p className="font-semibold text-secondary-900">
                ${project.budget.toLocaleString()}
              </p>
            </div>
          )}
          {project.start_date && (
            <div>
              <span className="text-secondary-600">Start Date:</span>
              <p className="font-semibold text-secondary-900">
                {new Date(project.start_date).toLocaleDateString()}
              </p>
            </div>
          )}
          {project.end_date && (
            <div>
              <span className="text-secondary-600">End Date:</span>
              <p className="font-semibold text-secondary-900">
                {new Date(project.end_date).toLocaleDateString()}
              </p>
            </div>
          )}
          <div>
            <span className="text-secondary-600">Manager:</span>
            <p className="font-semibold text-secondary-900">{project.manager_id}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-secondary-200 rounded-lg overflow-hidden">
        <div className="border-b border-secondary-200">
          <nav className="flex">
            {[
              { key: 'tasks', label: 'Tasks' },
              { key: 'expenses', label: 'Expenses' },
              { key: 'income', label: 'Income' },
              { key: 'financials', label: 'Profit & Loss' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-secondary-600 hover:text-secondary-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <TaskList
              tasks={tasks}
              onCreate={() => router.push(`/tasks/new?project_id=${projectId}`)}
              onEdit={(task) => router.push(`/tasks/${task.id}/edit`)}
              totalCount={tasks.length}
            />
          )}

          {/* Expenses Tab */}
          {activeTab === 'expenses' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-secondary-900">Expenses</h2>
                <button
                  onClick={() => router.push(`/expenses/new?project_id=${projectId}`)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add Expense
                </button>
              </div>
              {expenses.length === 0 ? (
                <p className="text-center py-8 text-secondary-600">No expenses recorded</p>
              ) : (
                <div className="space-y-3">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="border border-secondary-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-secondary-900">{expense.category}</p>
                          {expense.description && (
                            <p className="text-sm text-secondary-600 mt-1">{expense.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-secondary-900">
                            ${expense.amount.toLocaleString()}
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              expense.approval_status === 'Approved'
                                ? 'bg-success-100 text-success-800'
                                : expense.approval_status === 'Rejected'
                                ? 'bg-error-100 text-error-800'
                                : 'bg-warning-100 text-warning-800'
                            }`}
                          >
                            {expense.approval_status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Income Tab */}
          {activeTab === 'income' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-secondary-900">Income</h2>
                <button
                  onClick={() => router.push(`/income/new?project_id=${projectId}`)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add Income
                </button>
              </div>
              {income.length === 0 ? (
                <p className="text-center py-8 text-secondary-600">No income recorded</p>
              ) : (
                <div className="space-y-3">
                  {income.map((item) => (
                    <div key={item.id} className="border border-secondary-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-secondary-900">
                            {item.description || 'Income'}
                          </p>
                          {item.source && (
                            <p className="text-sm text-secondary-600 mt-1">
                              via {item.source}
                            </p>
                          )}
                          <p className="text-xs text-secondary-500 mt-1">
                            {new Date(item.income_date).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="font-semibold text-success-600 text-lg">
                          ${item.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Financials Tab */}
          {activeTab === 'financials' && (
            <div>
              {profitLoss ? (
                <ProfitLossDisplay data={profitLoss} />
              ) : (
                <p className="text-center py-8 text-secondary-600">
                  Loading financial data...
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
