/**
 * WebSocket client utilities with automatic reconnection
 * Handles connection lifecycle and message passing
 */
export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface WebSocketMessage {
  type: string
  [key: string]: any
}

export interface WebSocketClientOptions {
  url: string
  token: string
  onMessage?: (message: WebSocketMessage) => void
  onStatusChange?: (status: WebSocketStatus) => void
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export class WebSocketClient {
  private ws: WebSocket | null = null
  private options: Required<WebSocketClientOptions>
  private reconnectAttempts = 0
  private reconnectTimeout: NodeJS.Timeout | null = null
  private status: WebSocketStatus = 'disconnected'
  private shouldReconnect = true

  constructor(options: WebSocketClientOptions) {
    this.options = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      onMessage: () => {},
      onStatusChange: () => {},
      ...options,
    }
  }

  // New method to control reconnection behavior
  public setShouldReconnect(value: boolean): void {
    this.shouldReconnect = value
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    this.updateStatus('connecting')

    try {
      this.ws = new WebSocket(this.options.url)

      this.ws.onopen = () => {
        this.reconnectAttempts = 0
        this.updateStatus('connected')
        this.startHeartbeat()
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.options.onMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onerror = (event) => {
        console.error('WebSocket error event:', event)
        this.updateStatus('error')
      }

      this.ws.onclose = () => {
        this.updateStatus('disconnected')
        this.stopHeartbeat()

        if (this.shouldReconnect) {
          this.attemptReconnect()
        }
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      this.updateStatus('error')
      this.attemptReconnect()
    }
  }

  disconnect(): void {
    this.shouldReconnect = false
    this.stopHeartbeat()

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.updateStatus('disconnected')
  }

  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message)
    }
  }

  getStatus(): WebSocketStatus {
    return this.status
  }

  private updateStatus(status: WebSocketStatus): void {
    this.status = status
    this.options.onStatusChange(status)
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      this.updateStatus('error')
      return
    }

    this.reconnectAttempts++
    console.log(
      `Reconnecting... (attempt ${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`
    )

    this.reconnectTimeout = setTimeout(() => {
      this.connect()
    }, this.options.reconnectInterval)
  }

  private heartbeatInterval: NodeJS.Timeout | null = null

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' })
      }
    }, 30000) // Ping every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

/**
 * Create WebSocket URL for Kanban board
 */
export function createKanbanWebSocketUrl(projectId: string, token: string): string {
  const protocol = API_BASE_URL.startsWith('https') ? 'wss:' : 'ws:'
  const url = new URL(API_BASE_URL) // Use URL object for easier manipulation
  url.protocol = protocol
  url.pathname = url.pathname.replace(/\/$/, '') + '/kanban/ws' // Ensure no double slashes, add ws path
  url.searchParams.set('project_id', projectId)
  url.searchParams.set('token', token)

  return url.toString()
}
