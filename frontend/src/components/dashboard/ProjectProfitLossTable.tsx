/**
 * Project Profit/Loss Table Component - Modern Design
 * Responsive table with hover effects and modern styling
 */

'use client'

import { useRouter } from 'next/navigation'

interface ProjectProfitLoss {
  project_id: string
  project_name: string
  net_profit: number
  total_income: number
  total_expenses: number
}

interface ProjectProfitLossTableProps {
  data: ProjectProfitLoss[]
}

export function ProjectProfitLossTable({ data }: ProjectProfitLossTableProps) {
  const router = useRouter()

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-lg font-medium">No financial data available</p>
        <p className="text-sm mt-1">Project financial data will appear here</p>
      </div>
    )
  }

  const totals = {
    income: data.reduce((sum, p) => sum + p.total_income, 0),
    expenses: data.reduce((sum, p) => sum + p.total_expenses, 0),
    profit: data.reduce((sum, p) => sum + p.net_profit, 0),
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-100/50">
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider rounded-tl-xl">
                Project
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Income
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Expenses
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider rounded-tr-xl">
                Net Profit/Loss
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.map((project, index) => (
              <tr
                key={project.project_id}
                onClick={() => router.push(`/projects/${project.project_id}`)}
                className="group hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 group-hover:scale-150 transition-transform"></div>
                    <span className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                      {project.project_name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-semibold text-green-600">
                    ${project.total_income.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-semibold text-red-600">
                    ${project.total_expenses.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {project.net_profit >= 0 ? (
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    )}
                    <span className={`text-sm font-bold ${
                      project.net_profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {project.net_profit >= 0 ? '+' : ''}${Math.abs(project.net_profit).toLocaleString()}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gradient-to-r from-slate-100 to-slate-50 font-bold">
              <td className="px-6 py-4 text-slate-900 rounded-bl-xl">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Total
                </div>
              </td>
              <td className="px-6 py-4 text-right text-green-700">
                ${totals.income.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-right text-red-700">
                ${totals.expenses.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-right rounded-br-xl">
                <span className={totals.profit >= 0 ? 'text-green-700' : 'text-red-700'}>
                  {totals.profit >= 0 ? '+' : ''}${Math.abs(totals.profit).toLocaleString()}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {data.map((project) => (
          <div
            key={project.project_id}
            onClick={() => router.push(`/projects/${project.project_id}`)}
            className="bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-slate-900 text-lg">{project.project_name}</h3>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                project.net_profit >= 0 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {project.net_profit >= 0 ? 'Profit' : 'Loss'}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Income</span>
                <span className="text-sm font-semibold text-green-600">
                  ${project.total_income.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Expenses</span>
                <span className="text-sm font-semibold text-red-600">
                  ${project.total_expenses.toLocaleString()}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Net Profit/Loss</span>
                <div className="flex items-center gap-2">
                  {project.net_profit >= 0 ? (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  )}
                  <span className={`font-bold ${
                    project.net_profit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {project.net_profit >= 0 ? '+' : ''}${Math.abs(project.net_profit).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Mobile Total Card */}
        <div className="bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl p-5 border-2 border-slate-300">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Total Summary
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total Income</span>
              <span className="text-sm font-bold text-green-700">
                ${totals.income.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total Expenses</span>
              <span className="text-sm font-bold text-red-700">
                ${totals.expenses.toLocaleString()}
              </span>
            </div>
            <div className="pt-3 border-t-2 border-slate-300 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">Net Profit/Loss</span>
              <span className={`font-bold ${totals.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {totals.profit >= 0 ? '+' : ''}${Math.abs(totals.profit).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}