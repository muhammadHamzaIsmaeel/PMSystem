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
  [TaskPriority.LOW]: 'bg-slate-100 text-slate-800',
  [TaskPriority.MEDIUM]: 'bg-blue-100 text-blue-800',
  [TaskPriority.HIGH]: 'bg-amber-100 text-amber-800',
  [TaskPriority.URGENT]: 'bg-red-100 text-red-800',
  [TaskPriority.CRITICAL]: 'bg-red-600 text-white',
}

const statusColors = {
  [TaskStatus.TODO]: 'bg-slate-100 text-slate-800',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [TaskStatus.REVIEW]: 'bg-amber-100 text-amber-800',
  [TaskStatus.DONE]: 'bg-emerald-100 text-emerald-800',
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
    <div className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-800 mb-1">{task.title}</h3>
          {showProjectLink && task.project_id && (
            <Link
              href={`/projects/${task.project_id}`}
              className="text-sm text-blue-600 hover:text-blue-700"
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
        <p className="text-sm text-slate-700 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="space-y-2 text-sm text-slate-600 mb-4">
        {task.due_date && (
          <p className={isOverdue ? 'text-red-600 font-medium' : ''}>
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
              className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors text-sm"
            >
              Edit
            </button>
          )}
          {canCreateSubtask && onCreateSubtask && !task.parent_task_id && (
            <button
              onClick={() => onCreateSubtask(task.id)}
              className="px-3 py-1 text-slate-600 hover:bg-slate-50 rounded transition-colors text-sm"
            >
              Add Subtask
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors text-sm"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
