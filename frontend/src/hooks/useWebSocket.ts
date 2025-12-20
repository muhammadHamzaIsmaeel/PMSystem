/**
 * useWebSocket hook
 * React hook for managing WebSocket connections with automatic cleanup
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { WebSocketClient, WebSocketStatus, WebSocketMessage } from '@/lib/websocket'

interface UseWebSocketOptions {
  url: string
  token: string
  enabled?: boolean
  onMessage?: (message: WebSocketMessage) => void
}

interface UseWebSocketReturn {
  status: WebSocketStatus
  send: (message: WebSocketMessage) => void
  connect: () => void
  disconnect: () => void
}

export function useWebSocket({
  url,
  token,
  enabled = true,
  onMessage,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [status, setStatus] = useState<WebSocketStatus>('disconnected')
  const clientRef = useRef<WebSocketClient | null>(null)

  const connect = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = new WebSocketClient({
        url,
        token,
        onMessage: (message) => {
          if (onMessage) {
            onMessage(message)
          }
        },
        onStatusChange: (newStatus) => {
          setStatus(newStatus)
        },
      })
    }
    clientRef.current.connect()
  }, [url, token, onMessage])

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect()
    }
  }, [])

  const send = useCallback((message: WebSocketMessage) => {
    if (clientRef.current) {
      clientRef.current.send(message)
    }
  }, [])

  useEffect(() => {
    if (enabled) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [enabled, connect, disconnect])

  return {
    status,
    send,
    connect,
    disconnect,
  }
}
