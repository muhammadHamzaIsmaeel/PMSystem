/**
 * Dashboard Page - Next Level UI
 * Modern, premium dashboard with enhanced visuals while keeping all functionality intact
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary-200 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-primary-600 rounded-full animate-spin animation-delay-75"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-red-200 p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Oops! Something went wrong</h2>
          <p className="text-slate-600 mb-8">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!summary && !isLoading && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-slate-200 rounded-3xl flex items-center justify-center">
            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2a4 4 0 00-4-4v-2m-4 6h.01" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-3">No Data Available</h2>
          <p className="text-lg text-slate-600">There is currently no data to display on your dashboard.</p>
        </div>
      </div>
    )
  }

  const isFinanceRole = user.role === UserRole.FINANCE
  const isTeamMember = user.role === UserRole.TEAM_MEMBER
  const isViewer = user.role === UserRole.VIEWER

  let subtitle = 'Project Management Overview'
  if (isFinanceRole) subtitle = 'Financial Overview'
  else if (isTeamMember) subtitle = 'My Tasks and Projects'
  else if (isViewer) subtitle = 'Project Viewer Dashboard'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-4xl font-extrabold text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
            Dashboard
          </h1>
          <p className="text-xl text-slate-600 mt-2 font-medium">{subtitle}</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {isTeamMember ? (
              <>
                <SummaryCard
                  icon={<TasksIcon className="w-8 h-8" />}
                  label="My Active Tasks"
                  value={summary.active_tasks ?? 0}
                  colorClass="from-emerald-500 to-emerald-600"
                />
                <SummaryCard
                  icon={<ProjectIcon className="w-8 h-8" />}
                  label="My Projects"
                  value={summary.total_projects ?? 0}
                  colorClass="from-blue-500 to-blue-600"
                />
              </>
            ) : (
              <>
                {!isFinanceRole && (
                  <SummaryCard
                    icon={<ProjectIcon className="w-8 h-8" />}
                    label="Total Projects"
                    value={summary.total_projects ?? 0}
                    colorClass="from-indigo-500 to-indigo-600"
                  />
                )}
                {!isFinanceRole && (
                  <SummaryCard
                    icon={<TasksIcon className="w-8 h-8" />}
                    label="Active Tasks"
                    value={summary.active_tasks ?? 0}
                    colorClass="from-emerald-500 to-emerald-600"
                  />
                )}
                {isFinanceRole && (
                  <SummaryCard
                    icon={<BudgetIcon className="w-8 h-8" />}
                    label="Pending Approvals"
                    value={pendingApprovals}
                    colorClass="from-amber-500 to-amber-600"
                  />
                )}
                <SummaryCard
                  icon={<BudgetIcon className="w-8 h-8" />}
                  label="Budget Utilization"
                  value={`${(summary.budget_utilization ?? 0).toFixed(1)}%`}
                  colorClass="from-orange-500 to-orange-600"
                />
                <div className="lg:col-span-1">
                  <ProfitLossCard value={summary.overall_profit_loss ?? 0} />
                </div>
              </>
            )}
          </div>
        )}

        {/* Charts Section */}
        {!isTeamMember && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {!isFinanceRole && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-500">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Project Timeline</h2>
                <ProjectTimelineChart data={timeline} />
              </div>
            )}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-500">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Expense Breakdown</h2>
              <ExpenseBreakdownChart data={expenses} />
            </div>
            {!isFinanceRole && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-500">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Task Completion</h2>
                <TaskCompletionChart data={tasks} />
              </div>
            )}
            {isFinanceRole && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-500">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Income Breakdown</h2>
                <IncomeBreakdownChart data={income} />
              </div>
            )}
          </div>
        )}

        {/* Project Profit & Loss Table - Finance Only */}
        {isFinanceRole && projectsProfitLoss.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 mb-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Project-wise Profit & Loss</h2>
            <ProjectProfitLossTable data={projectsProfitLoss} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-8">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Finance Role */}
            {isFinanceRole && (
              <>
                <button
                  onClick={() => router.push('/expenses')}
                  className="group flex items-center gap-4 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl hover:from-amber-100 hover:to-orange-100 border border-amber-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="p-3 bg-amber-500 rounded-lg group-hover:scale-110 transition-transform">
                    <BudgetIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-800">Review Expenses</p>
                    <p className="text-sm text-slate-600">Approve or reject pending expenses</p>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/income')}
                  className="group flex items-center gap-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 border border-green-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="p-3 bg-emerald-500 rounded-lg group-hover:scale-110 transition-transform">
                    <BudgetIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-800">View Income</p>
                    <p className="text-sm text-slate-600">Track project revenue streams</p>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/projects')}
                  className="group flex items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 border border-blue-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="p-3 bg-indigo-500 rounded-lg group-hover:scale-110 transition-transform">
                    <ProjectIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-800">View Projects</p>
                    <p className="text-sm text-slate-600">Browse financial performance</p>
                  </div>
                </button>
              </>
            )}

            {/* Team Member Role */}
            {isTeamMember && (
              <>
                <button
                  onClick={() => router.push('/tasks')}
                  className="group flex items-center gap-4 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl hover:from-emerald-100 hover:to-teal-100 border border-emerald-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="p-3 bg-emerald-500 rounded-lg group-hover:scale-110 transition-transform">
                    <TasksIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-800">My Tasks</p>
                    <p className="text-sm text-slate-600">View your assigned tasks</p>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/projects')}
                  className="group flex items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 border border-blue-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="p-3 bg-indigo-500 rounded-lg group-hover:scale-110 transition-transform">
                    <ProjectIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-800">My Projects</p>
                    <p className="text-sm text-slate-600">See your active projects</p>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/expenses')}
                  className="group flex items-center gap-4 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl hover:from-amber-100 hover:to-orange-100 border border-amber-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="p-3 bg-amber-500 rounded-lg group-hover:scale-110 transition-transform">
                    <BudgetIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-800">Submit Expenses</p>
                    <p className="text-sm text-slate-600">Log project-related expenses</p>
                  </div>
                </button>
              </>
            )}

            {/* Other Roles (Admin, PM, Viewer) */}
            {!isFinanceRole && !isTeamMember && (
              <>
                {(user.role === UserRole.ADMIN || user.role === UserRole.PROJECT_MANAGER) && (
                  <button
                    onClick={() => router.push('/projects/new')}
                    className="group flex items-center gap-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 border border-purple-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="p-3 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                      <PlusIcon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-800">New Project</p>
                      <p className="text-sm text-slate-600">Start a new project</p>
                    </div>
                  </button>
                )}
                <button
                  onClick={() => router.push('/projects')}
                  className="group flex items-center gap-4 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl hover:from-indigo-100 hover:to-blue-100 border border-indigo-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="p-3 bg-indigo-500 rounded-lg group-hover:scale-110 transition-transform">
                    <ProjectIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-800">View Projects</p>
                    <p className="text-sm text-slate-600">Browse all active projects</p>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/tasks')}
                  className="group flex items-center gap-4 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl hover:from-emerald-100 hover:to-teal-100 border border-emerald-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="p-3 bg-emerald-500 rounded-lg group-hover:scale-110 transition-transform">
                    <TasksIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-800">View Tasks</p>
                    <p className="text-sm text-slate-600">Monitor task progress</p>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/expenses')}
                  className="group flex items-center gap-4 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl hover:from-amber-100 hover:to-orange-100 border border-amber-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="p-3 bg-amber-500 rounded-lg group-hover:scale-110 transition-transform">
                    <BudgetIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-800">Manage Expenses</p>
                    <p className="text-sm text-slate-600">Track spending across projects</p>
                  </div>
                </button>
                {(user.role === UserRole.ADMIN || user.role === UserRole.FINANCE) && (
                  <button
                    onClick={() => router.push('/income')}
                    className="group flex items-center gap-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 border border-green-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="p-3 bg-emerald-500 rounded-lg group-hover:scale-110 transition-transform">
                      <BudgetIcon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-800">View Income</p>
                      <p className="text-sm text-slate-600">Monitor revenue streams</p>
                    </div>
                  </button>
                )}
                {user.role === UserRole.ADMIN && (
                  <button
                    onClick={() => router.push('/users')}
                    className="group flex items-center gap-4 p-6 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl hover:from-slate-200 hover:to-slate-300 border border-slate-300 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="p-3 bg-slate-600 rounded-lg group-hover:scale-110 transition-transform">
                      <TasksIcon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-800">Manage Users</p>
                      <p className="text-sm text-slate-600">Team member management</p>
                    </div>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}