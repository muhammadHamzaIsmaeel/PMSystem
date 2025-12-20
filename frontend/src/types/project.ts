/**
 * Project-related TypeScript types
 */

export enum ProjectStatus {
  PLANNING = 'Planning',
  IN_PROGRESS = 'InProgress',
  ON_HOLD = 'OnHold',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export interface Project {
  id: string
  name: string
  client_name: string
  description: string | null
  budget: number | null
  start_date: string | null
  end_date: string | null
  status: ProjectStatus
  manager_id: string
  created_by_id: string
  created_at: string
  updated_at: string
}

export interface ProjectCreate {
  name: string
  client_name: string
  description?: string | null
  budget?: number | null
  start_date?: string | null
  end_date?: string | null
  status?: ProjectStatus
  manager_id: string
}

export interface ProjectUpdate {
  name?: string
  client_name?: string
  description?: string | null
  budget?: number | null
  start_date?: string | null
  end_date?: string | null
  status?: ProjectStatus
  manager_id?: string
}

export interface ProjectList {
  id: string
  name: string
  client_name: string
  status: ProjectStatus
  budget: number | null
  manager_id: string
  created_at: string
}
