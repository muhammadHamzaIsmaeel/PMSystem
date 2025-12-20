/**
 * useKanbanRealtime hook
 * Manages real-time task updates for Kanban board via WebSocket
 */

import { useEffect, useCallback } from 'react'
import { useWebSocket } from './useWebSocket'
import { createKanbanWebSocketUrl, WebSocketMessage } from '@/lib/websocket'
import { Task } from '@/types/task'

interface TaskUpdateMessage {
  type: 'task_update'
  project_id: string
  task_id: string
  new_status: string
  updated_by: string
  timestamp: string | null
}

interface UseKanbanRealtimeOptions {
  projectId: string
  token: string
  enabled?: boolean
  onTaskUpdate?: (taskId: string, newStatus: string, updatedBy: string) => void
}

interface UseKanbanRealtimeReturn {
  connectionStatus: string
  sendTaskUpdate: (taskId: string, newStatus: string) => void
}

export function useKanbanRealtime({
  projectId,
  token,
  enabled = true,
  onTaskUpdate,
}: UseKanbanRealtimeOptions): UseKanbanRealtimeReturn {
  const url = createKanbanWebSocketUrl(projectId, token)

  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      if (message.type === 'task_update' && onTaskUpdate) {
        const taskUpdate = message as TaskUpdateMessage
        onTaskUpdate(taskUpdate.task_id, taskUpdate.new_status, taskUpdate.updated_by)
      } else if (message.type === 'connection_established') {
        console.log('Kanban WebSocket connected:', message.message)
      } else if (message.type === 'pong') {
        // Heartbeat response, no action needed
      }
    },
    [onTaskUpdate]
  )

  const { status, send } = useWebSocket({
    url,
    token,
    enabled,
    onMessage: handleMessage,
  })

  const sendTaskUpdate = useCallback(
    (taskId: string, newStatus: string) => {
      send({
        type: 'task_update',
        task_id: taskId,
        new_status: newStatus,
      })
    },
    [send]
  )

  return {
    connectionStatus: status,
    sendTaskUpdate,
  }
}
