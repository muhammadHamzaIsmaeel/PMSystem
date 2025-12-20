/**
 * Financial-related TypeScript types
 */

export enum ApprovalStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export interface Expense {
  id: string
  amount: number
  category: string
  expense_date: string // Changed from 'date' to match backend
  description: string | null
  approval_status: ApprovalStatus
  receipt_path: string | null // Changed from 'receipt_file_id' to match backend
  project_id: string
  task_id: string | null
  submitted_by_id: string
  approved_by_id: string | null
  created_at: string
  updated_at: string
}

export interface ExpenseCreate {
  amount: number
  category: string
  expense_date: string // Changed from 'date' to match backend
  description?: string | null
  project_id: string
  task_id?: string | null
  receipt_path?: string | null // Changed from 'receipt_file_id' to match backend
}

export interface ExpenseUpdate {
  amount?: number
  category?: string
  expense_date?: string // Changed from 'date' to match backend
  description?: string | null
  task_id?: string | null
  receipt_path?: string | null // Changed from 'receipt_file_id' to match backend
}

export interface Income {
  id: string
  amount: number
  income_date: string // Changed from 'date' to match backend
  description: string | null
  source: string // Changed from 'payment_method' to match backend
  project_id: string
  created_by_id: string
  created_at: string
  updated_at: string
}

export interface IncomeCreate {
  amount: number
  income_date: string // Changed from 'date' to match backend
  description?: string | null
  source: string // Changed from 'payment_method' to match backend, now required
  project_id: string
}

export interface IncomeUpdate {
  amount?: number
  income_date?: string // Changed from 'date' to match backend
  description?: string | null
  source?: string // Changed from 'payment_method' to match backend
}

export interface ProfitLoss {
  project_id: string
  total_income: number
  total_approved_expenses: number
  total_pending_expenses: number
  labor_costs: number
  net_profit: number
  profit_margin_percent: number
}

export interface TimeEntry {
  id: string
  start_time: string
  end_time: string
  duration_minutes: number
  description: string | null
  hrmsx_sync_status: 'Pending' | 'Synced' | 'Failed'
  task_id: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface TimeEntryCreate {
  start_time: string
  end_time: string
  description?: string | null
  task_id: string
}
