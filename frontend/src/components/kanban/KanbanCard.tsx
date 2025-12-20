/**
 * KanbanCard Component
 * Displays task card on Kanban board with drag-and-drop support
 */

'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task, TaskPriority } from '@/types/task'

interface KanbanCardProps {
  task: Task
  subtaskCount?: number
}

const priorityColors = {
  [TaskPriority.LOW]: 'border-l-secondary-400',
  [TaskPriority.MEDIUM]: 'border-l-primary-400',
  [TaskPriority.HIGH]: 'border-l-warning-400',
  [TaskPriority.URGENT]: 'border-l-error-400',
  [TaskPriority.CRITICAL]: 'border-l-error-600',
}

const priorityBadgeColors = {
  [TaskPriority.LOW]: 'bg-secondary-100 text-secondary-700',
  [TaskPriority.MEDIUM]: 'bg-primary-100 text-primary-700',
  [TaskPriority.HIGH]: 'bg-warning-100 text-warning-700',
  [TaskPriority.URGENT]: 'bg-error-100 text-error-700',
  [TaskPriority.CRITICAL]: 'bg-error-600 text-white',
}

export function KanbanCard({ task, subtaskCount = 0 }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const isOverdue =
    task.due_date && new Date(task.due_date) < new Date() ? true : false

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white border-l-4 ${priorityColors[task.priority as TaskPriority]}
        rounded-lg shadow-sm hover:shadow-md transition-shadow
        p-4 mb-3 cursor-grab active:cursor-grabbing
        ${isDragging ? 'ring-2 ring-primary-500' : ''}
      `}
    >
      {/* Task Title */}
      <h3 className="font-medium text-secondary-900 mb-2 line-clamp-2">{task.title}</h3>

      {/* Task Description */}
      {task.description && (
        <p className="text-sm text-secondary-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Priority Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${priorityBadgeColors[task.priority as TaskPriority]}`}
        >
          {task.priority}
        </span>

        {isOverdue && (
          <span className="text-xs px-2 py-1 rounded-full font-medium bg-error-100 text-error-700">
            Overdue
          </span>
        )}
      </div>

      {/* Task Metadata */}
      <div className="flex items-center justify-between text-xs text-secondary-600">
        <div className="space-y-1">
          {task.estimated_hours && (
            <div className="flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{task.estimated_hours}h</span>
            </div>
          )}

          {subtaskCount > 0 && (
            <div className="flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span>{subtaskCount} subtasks</span>
            </div>
          )}
        </div>

        {task.due_date && (
          <div className={`${isOverdue ? 'text-error-600 font-medium' : ''}`}>
            {new Date(task.due_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </div>
        )}
      </div>
    </div>
  )
}
