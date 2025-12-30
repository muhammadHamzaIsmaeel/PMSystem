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
}

export function useWebSocket({
  url,
  token,
  enabled = true,
  onMessage,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [status, setStatus] = useState<WebSocketStatus>('disconnected')
  const clientRef = useRef<WebSocketClient | null>(null)

  // Memoize onStatusChange callback for WebSocketClient
  const handleClientStatusChange = useCallback((newStatus: WebSocketStatus) => {
    setStatus(newStatus)
  }, [])

  // Memoize onMessage callback for WebSocketClient
  const handleClientMessage = useCallback((message: WebSocketMessage) => {
    if (onMessage) {
      onMessage(message)
    }
  }, [onMessage]) // Dependency here to reflect changes in onMessage prop

  useEffect(() => {
    if (!enabled) {
      // Disconnect if disabled
      if (clientRef.current) {
        clientRef.current.disconnect()
        clientRef.current = null
      }
      return
    }

    // Connect or reconnect if client doesn't exist or URL/token changed
    if (!clientRef.current || clientRef.current.options.url !== url || clientRef.current.options.token !== token) {
      if (clientRef.current) {
        clientRef.current.disconnect() // Disconnect old client if URL/token changed
      }
      clientRef.current = new WebSocketClient({
        url,
        token,
        onMessage: handleClientMessage, // Use stable callback
        onStatusChange: handleClientStatusChange, // Use stable callback
      })
      clientRef.current.connect()
    } else if (clientRef.current.getStatus() === 'disconnected' || clientRef.current.getStatus() === 'error') {
      // Reconnect if status is disconnected/error
      clientRef.current.connect()
    }

    // Cleanup: disconnect on unmount
    return () => {
      if (clientRef.current) {
        clientRef.current.setShouldReconnect(false) // Prevent reconnection attempts after unmount
        clientRef.current.disconnect()
        clientRef.current = null
      }
    }
  }, [enabled, url, token, handleClientMessage, handleClientStatusChange]) // All external dependencies

  const send = useCallback((message: WebSocketMessage) => {
    clientRef.current?.send(message)
  }, [])

  return { status, send }
}
