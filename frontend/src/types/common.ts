/**
 * Common TypeScript types matching backend enums and schemas.
 * These types must stay in sync with backend/app/schemas/common.py
 */

// User Roles
export enum UserRole {
  ADMIN = 'Admin',
  PROJECT_MANAGER = 'ProjectManager',
  TEAM_MEMBER = 'TeamMember',
  FINANCE = 'Finance',
  VIEWER = 'Viewer',
}

// Project Statuses
export enum ProjectStatus {
  PLANNING = 'Planning',
  IN_PROGRESS = 'InProgress',
  ON_HOLD = 'OnHold',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

// Task Statuses
export enum TaskStatus {
  TODO = 'ToDo',
  IN_PROGRESS = 'InProgress',
  REVIEW = 'Review',
  DONE = 'Done',
}

// Task Priorities
export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
  CRITICAL = 'Critical',
}

// Approval Statuses
export enum ApprovalStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

// Sync Statuses
export enum SyncStatus {
  PENDING = 'Pending',
  SYNCED = 'Synced',
  FAILED = 'Failed',
}

// Notification Types
export enum NotificationType {
  TASK_ASSIGNED = 'TaskAssigned',
  DEADLINE_APPROACHING = 'DeadlineApproaching',
  EXPENSE_STATUS_CHANGED = 'ExpenseStatusChanged',
}

// Notification Interfaces
export interface Notification {
  id: string
  recipient_id: string
  notification_type: NotificationType
  related_entity_type: string
  related_entity_id: string
  message: string
  is_read: boolean
  created_at: string
}

export interface UnreadCount {
  count: number
}

// Base interfaces
export interface Timestamps {
  created_at: string
  updated_at: string
}

export interface UUIDEntity {
  id: string
}

// Pagination
export interface PaginationParams {
  skip?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  skip: number
  limit: number
  has_more: boolean
}

// API Response types
export interface MessageResponse {
  message: string
}

export interface HealthResponse {
  status: string
  version: string
}

// API Error response
export interface APIError {
  detail: string
}
