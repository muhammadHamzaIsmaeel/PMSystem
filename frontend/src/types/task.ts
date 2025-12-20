/**
 * Task-related TypeScript types
 */

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
  CRITICAL = 'Critical',
}

export enum TaskStatus {
  TODO = 'ToDo',
  IN_PROGRESS = 'InProgress',
  REVIEW = 'Review',
  DONE = 'Done',
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  progress: number
  deadline: string | null
  project_id: string
  assigned_user_id: string | null
  parent_task_id: string | null
  created_by_id: string
  created_at: string
  updated_at: string
}

export interface TaskCreate {
  title: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  progress?: number
  deadline?: string | null
  project_id: string
  assigned_user_id?: string | null
  parent_task_id?: string | null
}

export interface TaskUpdate {
  title?: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  progress?: number
  deadline?: string | null
  assigned_user_id?: string | null
}

export interface SubtaskCreate {
  title: string
  description?: string | null
  priority?: TaskPriority
  deadline?: string | null
  assigned_user_id?: string | null
}

export interface Subtask extends Task {
  parent_task_id: string
}
