/**
 * Settings Page
 * Allows users to manage their account settings and profile information
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { User, UserUpdateRequest } from '@/types/user'

export default function SettingsPage() {
  const router = useRouter()
  const { user, updateUser } = useAuth()
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    // Load user profile data
    setFormData({
      full_name: user.full_name || '',
      email: user.email || '',
    })
    setLoading(false)
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    // Basic validation before sending request
    if (!formData.full_name.trim()) {
      setMessage('Full name is required')
      setMessageType('error')
      setSaving(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setMessage('Please enter a valid email address')
      setMessageType('error')
      setSaving(false)
      return
    }

    try {
      // Prepare the update payload - only include fields that have values
      const updatePayload: UserUpdateRequest = {}

      if (formData.full_name.trim()) {
        updatePayload.full_name = formData.full_name
      }

      // Only include email in the payload if it's a valid email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (formData.email.trim() && emailRegex.test(formData.email)) {
        updatePayload.email = formData.email
      }

      // Update user profile via API using the correct endpoint
      const response = await apiClient.patch(`/users/${user?.id}`, updatePayload)

      // Update the user context with new data
      updateUser({
        ...user,
        full_name: formData.full_name,
        email: formData.email,
      } as User)

      setMessage('Profile updated successfully!')
      setMessageType('success')
    } catch (error: any) {
      console.error('Error updating profile:', error)

      // Handle the error response properly
      let errorMessage = 'Failed to update profile'
      if (error.response?.data?.detail) {
        // If it's a validation error from FastAPI
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map((err: any) => {
            return `${err.loc ? err.loc.join('.') : 'field'}: ${err.msg}`
          }).join('; ')
        } else {
          errorMessage = error.response.data.detail
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      setMessage(errorMessage)
      setMessageType('error')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-2">Manage your profile and account preferences</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Profile Information Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${messageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>

            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Security Settings Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <h3 className="font-medium text-gray-900">Change Password</h3>
                <p className="text-sm text-gray-600">Update your account password</p>
              </div>
              <button
                onClick={() => router.push('/change-password')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Change
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
              <button
                onClick={() => router.push('/two-factor-auth')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Configure
              </button>
            </div>
          </div>
        </div>

        {/* Account Information Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <p className="text-gray-900">{user.role}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <p className={`text-gray-900 ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                {user.is_active ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
              <p className="text-gray-900">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
              <p className="text-gray-900">{new Date(user.updated_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}