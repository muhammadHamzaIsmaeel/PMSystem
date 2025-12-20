/**
 * TaskCard Component
 * Displays task information with priority/status badges and role-based actions
 */

'use client'

import Link from 'next/link'
import { Task, TaskPriority, TaskStatus } from '@/types/task'
import { useHasRole } from '@/hooks/useAuth'
import { UserRole } from '@/types/common'

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  onCreateSubtask?: (parentTaskId: string) => void
  showProjectLink?: boolean
}

const priorityColors = {
  [TaskPriority.LOW]: 'bg-secondary-100 text-secondary-800',
  [TaskPriority.MEDIUM]: 'bg-primary-100 text-primary-800',
  [TaskPriority.HIGH]: 'bg-warning-100 text-warning-800',
  [TaskPriority.URGENT]: 'bg-error-100 text-error-800',
  [TaskPriority.CRITICAL]: 'bg-error-600 text-white',
}

const statusColors = {
  [TaskStatus.TODO]: 'bg-secondary-100 text-secondary-800',
  [TaskStatus.IN_PROGRESS]: 'bg-primary-100 text-primary-800',
  [TaskStatus.REVIEW]: 'bg-warning-100 text-warning-800',
  [TaskStatus.DONE]: 'bg-success-100 text-success-800',
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onCreateSubtask,
  showProjectLink = false,
}: TaskCardProps) {
  const canEdit = useHasRole([UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TEAM_MEMBER])
  const canDelete = useHasRole([UserRole.ADMIN, UserRole.PROJECT_MANAGER])
  const canCreateSubtask = useHasRole([UserRole.ADMIN, UserRole.PROJECT_MANAGER])

  const isOverdue =
    task.due_date && task.status !== TaskStatus.DONE
      ? new Date(task.due_date) < new Date()
      : false

  return (
    <div className="bg-white border border-secondary-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-secondary-900 mb-1">{task.title}</h3>
          {showProjectLink && task.project_id && (
            <Link
              href={`/projects/${task.project_id}`}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View Project
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
            {task.status}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-secondary-700 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="space-y-2 text-sm text-secondary-600 mb-4">
        {task.due_date && (
          <p className={isOverdue ? 'text-error-600 font-medium' : ''}>
            <span className="font-medium">Due:</span>{' '}
            {new Date(task.due_date).toLocaleDateString()}
            {isOverdue && ' (Overdue)'}
          </p>
        )}
        {task.estimated_hours && (
          <p>
            <span className="font-medium">Estimated:</span> {task.estimated_hours}h
          </p>
        )}
        {task.actual_hours && (
          <p>
            <span className="font-medium">Actual:</span> {task.actual_hours}h
          </p>
        )}
        {task.parent_task_id && (
          <p className="text-xs">
            <span className="font-medium">Subtask of:</span> {task.parent_task_id}
          </p>
        )}
      </div>

      {(canEdit || canDelete || canCreateSubtask) && (
        <div className="flex gap-2 flex-wrap">
          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="px-3 py-1 text-primary-600 hover:bg-primary-50 rounded transition-colors text-sm"
            >
              Edit
            </button>
          )}
          {canCreateSubtask && onCreateSubtask && !task.parent_task_id && (
            <button
              onClick={() => onCreateSubtask(task.id)}
              className="px-3 py-1 text-secondary-600 hover:bg-secondary-50 rounded transition-colors text-sm"
            >
              Add Subtask
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="px-3 py-1 text-error-600 hover:bg-error-50 rounded transition-colors text-sm"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
