/**
 * Charts Component
 * Visualization components for dashboard using Recharts
 */

'use client'

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

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
  [key: string]: string | number
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

interface ProjectTimelineChartProps {
  data: ProjectTimelineData[]
}

interface ExpenseBreakdownChartProps {
  data: ExpenseBreakdownData[]
}

interface TaskCompletionChartProps {
  data: TaskCompletionData[]
}

interface IncomeBreakdownChartProps {
  data: IncomeBreakdownData[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

const STATUS_COLORS: Record<string, string> = {
  Todo: '#94a3b8',
  'In Progress': '#3b82f6',
  Review: '#f59e0b',
  Done: '#10b981',
}

export function ProjectTimelineChart({ data }: ProjectTimelineChartProps) {
  const dayInMillis = 1000 * 60 * 60 * 24

  const processedData = data
    .map(p => ({
      ...p,
      startDate: p.start_date ? new Date(p.start_date) : null,
      endDate: p.end_date ? new Date(p.end_date) : new Date(),
    }))
    .filter(p => p.startDate)
    .sort((a, b) => a.startDate!.getTime() - b.startDate!.getTime())

  if (processedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-secondary-500">
        No project timeline data available
      </div>
    )
  }

  const earliestStart = processedData[0].startDate!.getTime()

  const chartData = processedData.map(p => {
    const start = p.startDate!.getTime()
    const end = p.endDate!.getTime()

    const offset = (start - earliestStart) / dayInMillis
    const duration = (end - start) / dayInMillis

    return {
      name: p.project_name,
      offset: Math.max(0, offset),
      duration: Math.max(0, duration),
      status: p.status,
    }
  })

  const statusColors: { [key: string]: string } = {
    'In Progress': '#3b82f6',
    Completed: '#10b981',
    'On Hold': '#f59e0b',
    Cancelled: '#ef4444',
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const originalProject = processedData.find(p => p.project_name === label)

      if (!originalProject) return null

      return (
        <div className="bg-white border border-secondary-200 p-3 rounded-lg shadow-lg">
          <p className="font-bold text-secondary-800">{label}</p>
          <p className="text-sm text-secondary-600">
            Start: {originalProject.startDate!.toLocaleDateString()}
          </p>
          <p className="text-sm text-secondary-600">
            End: {originalProject.endDate!.toLocaleDateString()}
          </p>
          <p className="text-sm text-secondary-600">Duration: {data.duration.toFixed(0)} days</p>
          <p
            className="text-sm font-medium"
            style={{ color: statusColors[data.status] || '#64748b' }}
          >
            Status: {data.status}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" unit=" days" />
        <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '14px' }} />
        <Bar dataKey="offset" stackId="a" fill="transparent" name="Start Delay" />
        <Bar dataKey="duration" stackId="a" name="Project Duration">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={statusColors[entry.status] || '#3b82f6'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function ExpenseBreakdownChart({ data }: ExpenseBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-secondary-500">
        No expense data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(props: any) => {
            const { category, percent } = props
            if (percent === undefined) return category
            return `${category} ${(percent * 100).toFixed(0)}%`
          }}
          outerRadius={100}
          fill="#8884d8"
          dataKey="amount"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function TaskCompletionChart({ data }: TaskCompletionChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-secondary-500">
        No task data available
      </div>
    )
  }

  const chartData = data.map(item => ({
    ...item,
    fill: STATUS_COLORS[item.status] || '#94a3b8',
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="status" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" name="Task Count">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function IncomeBreakdownChart({ data }: IncomeBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-secondary-500">
        No income data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(props: any) => {
            const { project_name, percent } = props
            if (percent === undefined) return project_name
            return `${project_name} ${(percent * 100).toFixed(0)}%`
          }}
          outerRadius={100}
          fill="#8884d8"
          dataKey="amount"
          nameKey="project_name"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
