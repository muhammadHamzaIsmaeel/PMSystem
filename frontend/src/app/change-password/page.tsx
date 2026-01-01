/**
 * Change Password Page
 * Allows users to update their account password
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'

export default function ChangePasswordPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_new_password: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  if (!user) {
    router.push('/login')
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Basic validation
    if (formData.new_password !== formData.confirm_new_password) {
      setMessage('New passwords do not match')
      setMessageType('error')
      setLoading(false)
      return
    }

    if (formData.new_password.length < 8) {
      setMessage('New password must be at least 8 characters')
      setMessageType('error')
      setLoading(false)
      return
    }

    try {
      // Call the change password API
      await apiClient.post('/auth/change-password', {
        current_password: formData.current_password,
        new_password: formData.new_password,
      })

      setMessage('Password updated successfully!')
      setMessageType('success')

      // Clear form
      setFormData({
        current_password: '',
        new_password: '',
        confirm_new_password: '',
      })
    } catch (error: any) {
      console.error('Error changing password:', error)
      setMessage(error.response?.data?.detail || error.message || 'Failed to change password')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
          <p className="text-gray-600 mt-2">Update your account password</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${messageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                id="current_password"
                name="current_password"
                value={formData.current_password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              />
            </div>

            <div>
              <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="new_password"
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
                minLength={8}
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirm_new_password" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirm_new_password"
                name="confirm_new_password"
                value={formData.confirm_new_password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}