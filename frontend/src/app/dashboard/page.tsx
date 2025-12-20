/**
 * Dashboard Page
 * Main dashboard with summary cards, charts, and role-based filtering
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SummaryCard } from '@/components/dashboard/SummaryCard'
import { ProfitLossCard } from '@/components/dashboard/ProfitLossCard'
import {
  ProjectTimelineChart,
  ExpenseBreakdownChart,
  TaskCompletionChart,
  IncomeBreakdownChart,
} from '@/components/dashboard/Charts'
import { ProjectProfitLossTable } from '@/components/dashboard/ProjectProfitLossTable'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/types/common'
import { apiClient } from '@/lib/api'
import { ProjectIcon } from '@/components/icons/ProjectIcon'
import { TasksIcon } from '@/components/icons/TasksIcon'
import { BudgetIcon } from '@/components/icons/BudgetIcon'
import { PlusIcon } from '@/components/icons/PlusIcon'

interface SummaryData {
  total_projects: number
  active_tasks: number
  budget_utilization: number
  overall_profit_loss: number
}

interface ProjectTimelineData {
  project_id: string
  project_name: string
  start_date: string | null
  end_date: string | null
  status: string
}

interface ExpenseBreakdownData {
  category: string
  amount: number
  count: number
}

interface TaskCompletionData {
  status: string
  count: number
}

interface IncomeBreakdownData {
  project_id: string
  project_name: string
  amount: number
  count: number
}

interface ProjectProfitLoss {
  project_id: string
  project_name: string
  net_profit: number
  total_income: number
  total_expenses: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [timeline, setTimeline] = useState<ProjectTimelineData[]>([])
  const [expenses, setExpenses] = useState<ExpenseBreakdownData[]>([])
  const [tasks, setTasks] = useState<TaskCompletionData[]>([])
  const [income, setIncome] = useState<IncomeBreakdownData[]>([])
  const [projectsProfitLoss, setProjectsProfitLoss] = useState<ProjectProfitLoss[]>([])
  const [pendingApprovals, setPendingApprovals] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const summaryPromise = apiClient.get<SummaryData>('/dashboard/summary')
      const expenseBreakdownPromise = apiClient.get<ExpenseBreakdownData[]>('/dashboard/charts/expense-breakdown')

      let projectTimelinePromise: Promise<ProjectTimelineData[] | null> = Promise.resolve(null)
      let taskCompletionPromise: Promise<TaskCompletionData[] | null> = Promise.resolve(null)
      let incomeBreakdownPromise: Promise<IncomeBreakdownData[] | null> = Promise.resolve(null)
      let projectsProfitLossPromise: Promise<ProjectProfitLoss[] | null> = Promise.resolve(null)
      let pendingApprovalsPromise: Promise<{ pending_count: number } | null> = Promise.resolve(null)

      if (user?.role !== UserRole.FINANCE) {
        projectTimelinePromise = apiClient.get<ProjectTimelineData[]>('/dashboard/charts/project-timeline')
        taskCompletionPromise = apiClient.get<TaskCompletionData[]>('/dashboard/charts/task-completion')
      }

      // Finance-specific data
      if (user?.role === UserRole.FINANCE || user?.role === UserRole.ADMIN) {
        incomeBreakdownPromise = apiClient.get<IncomeBreakdownData[]>('/dashboard/charts/income-breakdown')
        projectsProfitLossPromise = apiClient.get<ProjectProfitLoss[]>('/dashboard/projects-profit-loss')
        pendingApprovalsPromise = apiClient.get<{ pending_count: number }>('/dashboard/pending-approvals')
      }

      const [summaryRes, expensesRes, timelineRes, tasksRes, incomeRes, profitLossRes, pendingRes] = await Promise.all([
        summaryPromise,
        expenseBreakdownPromise,
        projectTimelinePromise,
        taskCompletionPromise,
        incomeBreakdownPromise,
        projectsProfitLossPromise,
        pendingApprovalsPromise,
      ])

      setSummary(summaryRes)
      setExpenses(expensesRes)
      if (timelineRes) setTimeline(timelineRes)
      if (tasksRes) setTasks(tasksRes)
      if (incomeRes) setIncome(incomeRes)
      if (profitLossRes) setProjectsProfitLoss(profitLossRes)
      if (pendingRes) setPendingApprovals(pendingRes.pending_count)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data. Please try refreshing the page.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-secondary-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center bg-error-50 text-error-700 border border-error-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p>{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-6 bg-error-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-error-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }


  if (!summary && !isLoading && !error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <svg
              className="w-16 h-16 mx-auto text-secondary-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2a4 4 0 00-4-4H3V9h2a4 4 0 004-4V3l7 4-7 4v2h2a4 4 0 004 4h-2z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-secondary-700 mb-2">No Data to Display</h2>
            <p className="text-secondary-500">
              There is currently no summary data available for the dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isFinanceRole = user.role === UserRole.FINANCE
  const isTeamMember = user.role === UserRole.TEAM_MEMBER
  const isViewer = user.role === UserRole.VIEWER

  // Determine subtitle based on role
  let subtitle = 'Project Management Overview'
  if (isFinanceRole) {
    subtitle = 'Financial Overview'
  } else if (isTeamMember) {
    subtitle = 'My Tasks and Projects'
  } else if (isViewer) {
    subtitle = 'Project Viewer Dashboard'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">Dashboard</h1>
        <p className="text-secondary-600 mt-1">
          {subtitle}
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Team Member: Show only task-related cards */}
          {isTeamMember ? (
            <>
              <SummaryCard
                icon={<TasksIcon className="w-6 h-6" />}
                label="My Active Tasks"
                value={summary.active_tasks ?? 0}
                colorClass="bg-success-500"
              />
              <SummaryCard
                icon={<ProjectIcon className="w-6 h-6" />}
                label="My Projects"
                value={summary.total_projects ?? 0}
                colorClass="bg-primary-500"
              />
            </>
          ) : (
            <>
              {!isFinanceRole && (
                <SummaryCard
                  icon={<ProjectIcon className="w-6 h-6" />}
                  label="Total Projects"
                  value={summary.total_projects ?? 0}
                  colorClass="bg-primary-500"
                />
              )}
              {!isFinanceRole && (
                <SummaryCard
                  icon={<TasksIcon className="w-6 h-6" />}
                  label="Active Tasks"
                  value={summary.active_tasks ?? 0}
                  colorClass="bg-success-500"
                />
              )}
              {isFinanceRole && (
                <SummaryCard
                  icon={<BudgetIcon className="w-6 h-6" />}
                  label="Pending Approvals"
                  value={pendingApprovals}
                  colorClass="bg-warning-500"
                />
              )}
              <SummaryCard
                icon={<BudgetIcon className="w-6 h-6" />}
                label="Budget Utilization"
                value={`${(summary.budget_utilization ?? 0).toFixed(1)}%`}
                colorClass="bg-warning-500"
              />
              <div className="lg:col-span-1">
                <ProfitLossCard value={summary.overall_profit_loss ?? 0} />
              </div>
            </>
          )}
        </div>
      )}

      {/* Charts - Hide for Team Members */}
      {!isTeamMember && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {!isFinanceRole && (
            <div className="bg-white border border-secondary-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Project Timeline
              </h2>
              <ProjectTimelineChart data={timeline} />
            </div>
          )}
          <div className="bg-white border border-secondary-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">
              Expense Breakdown
            </h2>
            <ExpenseBreakdownChart data={expenses} />
          </div>
          {!isFinanceRole && (
            <div className="bg-white border border-secondary-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Task Completion
              </h2>
              <TaskCompletionChart data={tasks} />
            </div>
          )}
          {isFinanceRole && (
            <div className="bg-white border border-secondary-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Income Breakdown
              </h2>
              <IncomeBreakdownChart data={income} />
            </div>
          )}
        </div>
      )}

      {isFinanceRole && projectsProfitLoss.length > 0 && (
        <div className="bg-white border border-secondary-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Project-wise Profit & Loss
          </h2>
          <ProjectProfitLossTable data={projectsProfitLoss} />
        </div>
      )}

      {/* Quick Actions for Finance */}
      {isFinanceRole && (
        <div className="bg-white border border-secondary-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/expenses')}
              className="flex items-center gap-3 p-4 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors text-left"
            >
              <BudgetIcon className="w-6 h-6 text-warning-600" />
              <div>
                <p className="font-medium text-secondary-900">Review Expenses</p>
                <p className="text-sm text-secondary-600">Approve or reject expenses</p>
              </div>
            </button>
            <button
              onClick={() => router.push('/income')}
              className="flex items-center gap-3 p-4 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors text-left"
            >
              <BudgetIcon className="w-6 h-6 text-success-600" />
              <div>
                <p className="font-medium text-secondary-900">View Income</p>
                <p className="text-sm text-secondary-600">Track project revenue</p>
              </div>
            </button>
            <button
              onClick={() => router.push('/projects')}
              className="flex items-center gap-3 p-4 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors text-left"
            >
              <ProjectIcon className="w-6 h-6 text-primary-600" />
              <div>
                <p className="font-medium text-secondary-900">View Projects</p>
                <p className="text-sm text-secondary-600">Browse financial data</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions for Team Members */}
      {isTeamMember && (
        <div className="bg-white border border-secondary-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/tasks')}
              className="flex items-center gap-3 p-4 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors text-left"
            >
              <TasksIcon className="w-6 h-6 text-success-600" />
              <div>
                <p className="font-medium text-secondary-900">My Tasks</p>
                <p className="text-sm text-secondary-600">View your assigned tasks</p>
              </div>
            </button>
            <button
              onClick={() => router.push('/projects')}
              className="flex items-center gap-3 p-4 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors text-left"
            >
              <ProjectIcon className="w-6 h-6 text-primary-600" />
              <div>
                <p className="font-medium text-secondary-900">My Projects</p>
                <p className="text-sm text-secondary-600">View your projects</p>
              </div>
            </button>
            <button
              onClick={() => router.push('/expenses')}
              className="flex items-center gap-3 p-4 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors text-left"
            >
              <BudgetIcon className="w-6 h-6 text-warning-600" />
              <div>
                <p className="font-medium text-secondary-900">Submit Expenses</p>
                <p className="text-sm text-secondary-600">Add project expenses</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions for Other Roles */}
      {!isFinanceRole && !isTeamMember && (
        <div className="bg-white border border-secondary-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* New Project - Only for Admin and PM */}
            {(user.role === UserRole.ADMIN || user.role === UserRole.PROJECT_MANAGER) && (
              <button
                onClick={() => router.push('/projects/new')}
                className="flex items-center gap-3 p-4 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors text-left"
              >
                <PlusIcon className="w-6 h-6 text-primary-600" />
                <div>
                  <p className="font-medium text-secondary-900">New Project</p>
                  <p className="text-sm text-secondary-600">Create a new project</p>
                </div>
              </button>
            )}
            <button
              onClick={() => router.push('/projects')}
              className="flex items-center gap-3 p-4 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors text-left"
            >
              <ProjectIcon className="w-6 h-6 text-primary-600" />
              <div>
                <p className="font-medium text-secondary-900">View Projects</p>
                <p className="text-sm text-secondary-600">Browse all projects</p>
              </div>
            </button>
            <button
              onClick={() => router.push('/tasks')}
              className="flex items-center gap-3 p-4 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors text-left"
            >
              <TasksIcon className="w-6 h-6 text-success-600" />
              <div>
                <p className="font-medium text-secondary-900">View Tasks</p>
                <p className="text-sm text-secondary-600">See all tasks</p>
              </div>
            </button>
            <button
              onClick={() => router.push('/expenses')}
              className="flex items-center gap-3 p-4 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors text-left"
            >
              <BudgetIcon className="w-6 h-6 text-warning-600" />
              <div>
                <p className="font-medium text-secondary-900">Manage Expenses</p>
                <p className="text-sm text-secondary-600">Track project expenses</p>
              </div>
            </button>
            {/* Income - Admin and Finance only */}
            {(user.role === UserRole.ADMIN || user.role === UserRole.FINANCE) && (
              <button
                onClick={() => router.push('/income')}
                className="flex items-center gap-3 p-4 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors text-left"
              >
                <BudgetIcon className="w-6 h-6 text-success-600" />
                <div>
                  <p className="font-medium text-secondary-900">View Income</p>
                  <p className="text-sm text-secondary-600">Track project revenue</p>
                </div>
              </button>
            )}
            {/* Users - Admin only */}
            {user.role === UserRole.ADMIN && (
              <button
                onClick={() => router.push('/users')}
                className="flex items-center gap-3 p-4 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors text-left"
              >
                <TasksIcon className="w-6 h-6 text-secondary-600" />
                <div>
                  <p className="font-medium text-secondary-900">Manage Users</p>
                  <p className="text-sm text-secondary-600">View team members</p>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
