/**
 * useNotifications hook
 * Manages fetching and updating notifications with polling
 */

import { useState, useEffect, useCallback } from 'react'
import { Notification, UnreadCount } from '@/types/common'
import { apiClient } from '@/lib/api'

interface UseNotificationsOptions {
  pollingInterval?: number // in milliseconds
  enabled?: boolean
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refresh: () => Promise<void>
}

export function useNotifications({
  pollingInterval = 30000, // 30 seconds default
  enabled = true,
}: UseNotificationsOptions = {}): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    console.log('fetchNotifications function called')
    try {
      setIsLoading(true)
      console.log('Fetching notifications from API...')
      const data = await apiClient.get('/notifications?limit=20')
      console.log('Notifications API response:', data)
      setNotifications(data.notifications || [])
      setUnreadCount(data.unread_count || 0)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
      console.error('Failed to fetch notifications:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data: UnreadCount = await apiClient.get('/notifications/unread-count')
      setUnreadCount(data.count)
    } catch (err) {
      console.error('Error fetching unread count:', err)
    }
  }, [])

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await apiClient.patch(`/notifications/${notificationId}/read`)

        // Update local state
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch (err) {
        console.error('Error marking notification as read:', err)
      }
    },
    []
  )

  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.patch('/notifications/read-all')

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchNotifications()
  }, [fetchNotifications])

  // Initial fetch
  useEffect(() => {
    console.log('useNotifications hook enabled state:', enabled)
    if (enabled) {
      console.log('Calling fetchNotifications from initial useEffect')
      fetchNotifications()
    } else {
      console.log('useNotifications hook is disabled')
    }
  }, [enabled, fetchNotifications])

  // Polling
  useEffect(() => {
    if (!enabled || pollingInterval <= 0) return

    const interval = setInterval(() => {
      fetchUnreadCount()
    }, pollingInterval)

    return () => clearInterval(interval)
  }, [enabled, pollingInterval, fetchUnreadCount])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refresh,
  }
}
