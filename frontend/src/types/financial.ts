/**
 * Financial and Time Tracking TypeScript types
 */

export enum ApprovalStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

// ============ Timer Status ============
export enum TimerStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
}

// ============ Expense Types ============
export interface Expense {
  id: string
  amount: number
  category: string
  expense_date: string
  description: string | null
  approval_status: ApprovalStatus
  receipt_path: string | null
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
  expense_date: string
  description?: string | null
  project_id: string
  task_id?: string | null
  receipt_path?: string | null
}

export interface ExpenseUpdate {
  amount?: number
  category?: string
  expense_date?: string
  description?: string | null
  task_id?: string | null
  receipt_path?: string | null
}

// ============ Income Types ============
export interface Income {
  id: string
  amount: number
  income_date: string
  description: string | null
  source: string
  project_id: string
  created_by_id: string
  created_at: string
  updated_at: string
}

export interface IncomeCreate {
  amount: number
  income_date: string
  description?: string | null
  source: string
  project_id: string
}

export interface IncomeUpdate {
  amount?: number
  income_date?: string
  description?: string | null
  source?: string
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

// ============ Screenshot Types ============
export interface Screenshot {
  id: string
  captured_at: string
  file_path: string
  thumbnail_path: string | null
  activity_percent: number
  blur_level: number
}

// ============ Activity Log Types ============
export interface ActivityLog {
  timestamp: string
  keyboard_clicks: number
  mouse_clicks: number
  mouse_movements: number
  active_app: string | null
  active_window: string | null
  activity_percent: number
  idle_seconds: number
}

// ============ Time Entry Types ============
export interface TimeEntry {
  id: string
  start_time: string
  end_time: string | null
  duration_minutes: number
  duration_seconds: number
  description: string | null
  notes: string | null

  // Timer state
  status: TimerStatus
  paused_at: string | null
  total_paused_seconds: number

  // Activity data
  activity_percent: number
  keyboard_clicks: number
  mouse_clicks: number
  idle_seconds: number
  active_seconds: number

  // Current tracking
  current_app: string | null
  current_window: string | null

  // Relationships
  task_id: string | null
  project_id: string | null
  user_id: string

  // Billable
  is_billable: boolean
  hourly_rate: number | null
  billable_amount: number

  // Meta
  is_manual: boolean
  screenshot_count: number

  created_at: string
  updated_at: string
}

export interface TimeEntryDetail extends TimeEntry {
  screenshots: Screenshot[]
  activity_logs: ActivityLog[]
  app_usage: Record<string, number>
}

export interface TimeEntryResponse {
  items: TimeEntry[]
  total: number
  skip: number
  limit: number
  has_more: boolean
}

export interface TimeEntryCreate {
  start_time: string
  end_time: string
  description?: string | null
  task_id?: string | null
  notes?: string | null
  is_billable?: boolean
  hourly_rate?: number | null
}

export interface TimeEntryUpdate {
  start_time?: string
  end_time?: string
  description?: string | null
  notes?: string | null
  task_id?: string | null
  project_id?: string | null
  is_billable?: boolean
  hourly_rate?: number | null
}

// ============ Timer Control Types ============
export interface TimerStartRequest {
  task_id?: string | null
  project_id?: string | null
  description?: string | null
  is_billable?: boolean
  hourly_rate?: number | null
  screenshot_interval?: number
  blur_screenshots?: boolean
  track_apps?: boolean
}

export interface TimerStopRequest {
  description?: string | null
  notes?: string | null
  task_id?: string | null
}

export interface TimerUpdateRequest {
  description?: string | null
  task_id?: string | null
  project_id?: string | null
}

export interface ActivityUpdateRequest {
  keyboard_clicks?: number
  mouse_clicks?: number
  mouse_movements?: number
  active_app?: string | null
  active_window?: string | null
  idle_seconds?: number
}

// ============ Active Timer Response ============
export interface ActiveTimerResponse {
  has_active_timer: boolean
  timer: TimeEntry | null
  elapsed_seconds: number
  elapsed_formatted: string
}

// ============ Summary Types ============
export interface DailySummary {
  date: string
  total_seconds: number
  total_minutes: number
  formatted_time: string
  entries_count: number
  avg_activity_percent: number
  projects: Record<string, number>
  tasks: Record<string, number>
}

export interface WeeklySummary {
  week_start: string
  week_end: string
  total_seconds: number
  total_hours: number
  formatted_time: string
  daily_breakdown: DailySummary[]
  avg_activity_percent: number
  billable_amount: number
}

export interface ProjectTimeSummary {
  project_id: string
  project_name: string | null
  total_seconds: number
  total_hours: number
  entries_count: number
  avg_activity_percent: number
  billable_amount: number
}

export interface TimeSummaryResponse {
  period: string
  start_date: string
  end_date: string
  total_seconds: number
  total_hours: number
  formatted_time: string
  entries_count: number
  avg_activity_percent: number
  billable_amount: number
  by_project: ProjectTimeSummary[]
  by_day: DailySummary[]
}

export interface TeamMemberSummary {
  user_id: string
  user_name: string
  total_seconds: number
  total_hours: number
  entries_count: number
  avg_activity_percent: number
  screenshots_count: number
}
