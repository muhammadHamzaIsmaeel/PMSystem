/**
 * TaskList Component
 * Displays a filterable list of tasks with pagination
 */

'use client'

import { useState } from 'react'
import { Task, TaskPriority, TaskStatus } from '@/types/task'
import { TaskCard } from './TaskCard'
import { useHasRole } from '@/hooks/useAuth'
import { UserRole } from '@/types/common'

interface TaskListProps {
  tasks: Task[]
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  onCreateSubtask?: (parentTaskId: string) => void
  onCreate?: () => void
  showProjectLink?: boolean
  totalCount?: number
  currentPage?: number
  pageSize?: number
  onPageChange?: (page: number) => void
}

export function TaskList({
  tasks,
  onEdit,
  onDelete,
  onCreateSubtask,
  onCreate,
  showProjectLink = false,
  totalCount = 0,
  currentPage = 1,
  pageSize = 20,
  onPageChange,
}: TaskListProps) {
  const canCreate = useHasRole([UserRole.ADMIN, UserRole.PROJECT_MANAGER])
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL')

  const filteredTasks = tasks.filter((task) => {
    if (statusFilter !== 'ALL' && task.status !== statusFilter) return false
    if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) return false
    return true
  })

  const totalPages = Math.ceil(totalCount / pageSize)

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 mb-4">No tasks found</p>
        {canCreate && onCreate && (
          <button
            onClick={onCreate}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Task
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">
          Tasks
          {totalCount > 0 && (
            <span className="ml-2 text-lg font-normal text-slate-600">
              ({filteredTasks.length}/{totalCount})
            </span>
          )}
        </h2>

        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label htmlFor="status-filter" className="sr-only">
              Filter by status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'ALL')}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white text-slate-800"
            >
              <option value="ALL">All Status</option>
              <option value={TaskStatus.TODO}>To Do</option>
              <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
              <option value={TaskStatus.REVIEW}>Review</option>
              <option value={TaskStatus.DONE}>Done</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority-filter" className="sr-only">
              Filter by priority
            </label>
            <select
              id="priority-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'ALL')}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white text-slate-800"
            >
              <option value="ALL">All Priority</option>
              <option value={TaskPriority.LOW}>Low</option>
              <option value={TaskPriority.MEDIUM}>Medium</option>
              <option value={TaskPriority.HIGH}>High</option>
              <option value={TaskPriority.URGENT}>Urgent</option>
              <option value={TaskPriority.CRITICAL}>Critical</option>
            </select>
          </div>

          {canCreate && onCreate && (
            <button
              onClick={onCreate}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              New Task
            </button>
          )}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-600">No tasks match the selected filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onCreateSubtask={onCreateSubtask}
              showProjectLink={showProjectLink}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-800"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const showPage =
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 1

              if (!showPage) {
                if (page === 2 || page === totalPages - 1) {
                  return (
                    <span key={page} className="px-2 py-2 text-slate-600">
                      ...
                    </span>
                  )
                }
                return null
              }

              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-300 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  {page}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-800"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
