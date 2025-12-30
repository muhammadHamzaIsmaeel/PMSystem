/**
 * KanbanColumn Component
 * Column container for Kanban tasks with drop zone styling
 */

'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task, TaskStatus } from '@/types/task'
import { KanbanCard } from './KanbanCard'

interface KanbanColumnProps {
  status: TaskStatus
  title: string
  tasks: Task[]
  taskSubtaskCounts: Record<string, number>
}

const statusColors = {
  [TaskStatus.TODO]: 'bg-slate-200 text-slate-800',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-200 text-blue-800',
  [TaskStatus.REVIEW]: 'bg-amber-200 text-amber-800',
  [TaskStatus.DONE]: 'bg-emerald-200 text-emerald-800',
}

export function KanbanColumn({ status, title, tasks, taskSubtaskCounts }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'column',
      status,
    },
  })

  return (
    <div className="flex flex-col bg-slate-100 border border-slate-200 rounded-lg p-4 min-w-[300px] md:min-w-[320px] h-full shadow-md">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-slate-800">{title}</h2>
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[status]}`}
          >
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 min-h-[200px] rounded-lg transition-colors
          ${isOver ? 'bg-blue-100 ring-2 ring-blue-500 ring-inset' : 'bg-transparent'}
        `}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
              Drop tasks here
            </div>
          ) : (
            <div className="space-y-0">
              {tasks.map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  subtaskCount={taskSubtaskCounts[task.id] || 0}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
}
