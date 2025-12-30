/**
 * KanbanBoard Component
 * Main Kanban board with drag-and-drop and real-time WebSocket updates
 */

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { Task, TaskStatus } from '@/types/task'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { useKanbanRealtime } from '@/hooks/useKanbanRealtime'

interface KanbanBoardProps {
  projectId: string
  initialTasks: Task[]
  token: string
}

export function KanbanBoard({ projectId, initialTasks, token }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [taskSubtaskCounts, setTaskSubtaskCounts] = useState<Record<string, number>>({})

  // Configure sensors for drag-and-drop
  // Supports both mouse (desktop) and touch (mobile)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms hold required for touch devices
        tolerance: 5,
      },
    })
  )

  // Calculate subtask counts
  useEffect(() => {
    const counts: Record<string, number> = {}
    tasks.forEach((task) => {
      if (task.parent_task_id) {
        counts[task.parent_task_id] = (counts[task.parent_task_id] || 0) + 1
      }
    })
    setTaskSubtaskCounts(counts)
  }, [tasks])

  // Handle real-time task updates via WebSocket
  const handleTaskUpdate = useCallback((taskId: string, newStatus: string, updatedBy: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus as TaskStatus } : task
      )
    )
  }, [])

  const { connectionStatus } = useKanbanRealtime({
    projectId,
    token,
    enabled: true,
    onTaskUpdate: handleTaskUpdate,
  })

  // Group tasks by status column
  const tasksByStatus = useMemo(() => {
    return {
      [TaskStatus.TODO]: tasks.filter((t) => t.status === TaskStatus.TODO),
      [TaskStatus.IN_PROGRESS]: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS),
      [TaskStatus.REVIEW]: tasks.filter((t) => t.status === TaskStatus.REVIEW),
      [TaskStatus.DONE]: tasks.filter((t) => t.status === TaskStatus.DONE),
    }
  }, [tasks])

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find((t) => t.id === active.id)
    if (task) {
      setActiveTask(task)
    }
  }

  // Handle drag over (visual feedback)
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const activeTask = tasks.find((t) => t.id === activeId)
    const overTask = tasks.find((t) => t.id === overId)

    if (!activeTask) return

    // Moving within same column (reordering)
    if (overTask && activeTask.status === overTask.status) {
      const oldIndex = tasks.findIndex((t) => t.id === activeId)
      const newIndex = tasks.findIndex((t) => t.id === overId)
      setTasks(arrayMove(tasks, oldIndex, newIndex))
    }
    // Moving to different column
    else if (over.data.current?.type === 'column') {
      const newStatus = over.data.current.status as TaskStatus
      if (activeTask.status !== newStatus) {
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t.id === activeId ? { ...t, status: newStatus } : t))
        )
      }
    }
  }

  // Handle drag end (persist to backend)
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeTask = tasks.find((t) => t.id === active.id)
    if (!activeTask) return

    let newStatus = activeTask.status

    // Determine new status from drop target
    if (over.data.current?.type === 'column') {
      newStatus = over.data.current.status as TaskStatus
    } else if (over.data.current?.type === 'task') {
      const overTask = tasks.find((t) => t.id === over.id)
      if (overTask) {
        newStatus = overTask.status
      }
    }

    // Only update if status changed
    if (newStatus !== activeTask.status) {
      // Optimistic UI update already done in handleDragOver
      // Now persist to backend
      try {
        const response = await fetch(`/api/v1/kanban/tasks/${activeTask.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ new_status: newStatus }),
        })

        if (!response.ok) {
          // Revert on error
          setTasks((prevTasks) =>
            prevTasks.map((t) =>
              t.id === activeTask.id ? { ...t, status: activeTask.status } : t
            )
          )
          throw new Error('Failed to update task status')
        }
      } catch (error) {
        console.error('Error updating task status:', error)
      }
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Connection Status Indicator */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected'
                ? 'bg-emerald-500'
                : connectionStatus === 'connecting'
                ? 'bg-amber-500 animate-pulse'
                : 'bg-red-500'
            }`}
          />
          <span className="text-sm text-slate-600">
            {connectionStatus === 'connected'
              ? 'Real-time updates active'
              : connectionStatus === 'connecting'
              ? 'Connecting...'
              : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          <KanbanColumn
            status={TaskStatus.TODO}
            title="To Do"
            tasks={tasksByStatus[TaskStatus.TODO]}
            taskSubtaskCounts={taskSubtaskCounts}
          />
          <KanbanColumn
            status={TaskStatus.IN_PROGRESS}
            title="In Progress"
            tasks={tasksByStatus[TaskStatus.IN_PROGRESS]}
            taskSubtaskCounts={taskSubtaskCounts}
          />
          <KanbanColumn
            status={TaskStatus.REVIEW}
            title="Review"
            tasks={tasksByStatus[TaskStatus.REVIEW]}
            taskSubtaskCounts={taskSubtaskCounts}
          />
          <KanbanColumn
            status={TaskStatus.DONE}
            title="Done"
            tasks={tasksByStatus[TaskStatus.DONE]}
            taskSubtaskCounts={taskSubtaskCounts}
          />
        </div>

        {/* Drag Overlay - Shows card being dragged */}
        <DragOverlay>
          {activeTask ? (
            <div className="rotate-3">
              <KanbanCard
                task={activeTask}
                subtaskCount={taskSubtaskCounts[activeTask.id] || 0}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
