/**
 * Project Profit/Loss Table Component
 * Displays profit/loss breakdown for all projects
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
      <div className="flex items-center justify-center h-64 text-secondary-500">
        No project financial data available
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-secondary-200">
        <thead className="bg-secondary-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
              Project
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
              Income
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
              Expenses
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
              Net Profit/Loss
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-secondary-200">
          {data.map((project) => (
            <tr
              key={project.project_id}
              className="hover:bg-secondary-50 cursor-pointer transition-colors"
              onClick={() => router.push(`/projects/${project.project_id}`)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-secondary-900">
                  {project.project_name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="text-sm text-success-600 font-medium">
                  ${project.total_income.toLocaleString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="text-sm text-error-600 font-medium">
                  ${project.total_expenses.toLocaleString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div
                  className={`text-sm font-bold ${
                    project.net_profit >= 0 ? 'text-success-600' : 'text-error-600'
                  }`}
                >
                  {project.net_profit >= 0 ? '+' : ''}${project.net_profit.toLocaleString()}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-secondary-50">
          <tr>
            <td className="px-6 py-4 text-sm font-bold text-secondary-900">Total</td>
            <td className="px-6 py-4 text-right text-sm font-bold text-success-600">
              ${data.reduce((sum, p) => sum + p.total_income, 0).toLocaleString()}
            </td>
            <td className="px-6 py-4 text-right text-sm font-bold text-error-600">
              ${data.reduce((sum, p) => sum + p.total_expenses, 0).toLocaleString()}
            </td>
            <td className="px-6 py-4 text-right text-sm font-bold">
              <span
                className={
                  data.reduce((sum, p) => sum + p.net_profit, 0) >= 0
                    ? 'text-success-600'
                    : 'text-error-600'
                }
              >
                {data.reduce((sum, p) => sum + p.net_profit, 0) >= 0 ? '+' : ''}$
                {data.reduce((sum, p) => sum + p.net_profit, 0).toLocaleString()}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
