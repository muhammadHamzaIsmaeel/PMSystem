/**
 * Users Page
 * Admin view to see all team members, managers, and users
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useHasRole } from '@/hooks/useAuth'
import { UserRole } from '@/types/common'
import { apiClient } from '@/lib/api'

export default function UsersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const isAdmin = useHasRole([UserRole.ADMIN])

  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState<string>('ALL')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!isAdmin) {
      alert('Access denied. Only admins can view this page.')
      router.push('/dashboard')
      return
    }

    fetchUsers()
  }, [user, isAdmin])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.get<any>('/users')
      setUsers(data.users || data.items || data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter((u) => {
    if (roleFilter === 'ALL') return true
    return u.role === roleFilter
  })

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-error-100 text-error-800'
      case 'ProjectManager':
        return 'bg-primary-100 text-primary-800'
      case 'Finance':
        return 'bg-warning-100 text-warning-800'
      case 'TeamMember':
        return 'bg-success-100 text-success-800'
      case 'Viewer':
        return 'bg-secondary-100 text-secondary-800'
      default:
        return 'bg-secondary-100 text-secondary-800'
    }
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'Admin'
      case 'ProjectManager':
        return 'Project Manager'
      case 'Finance':
        return 'Finance'
      case 'TeamMember':
        return 'Team Member'
      case 'Viewer':
        return 'Viewer'
      default:
        return role
    }
  }

  if (!user || !isAdmin) return null

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-secondary-600">Loading users...</p>
          </div>
        </div>
      </div>
    )
  }

  const roleCounts = {
    all: users.length,
    admin: users.filter((u) => u.role === 'Admin').length,
    pm: users.filter((u) => u.role === 'ProjectManager').length,
    finance: users.filter((u) => u.role === 'Finance').length,
    teamMember: users.filter((u) => u.role === 'TeamMember').length,
    viewer: users.filter((u) => u.role === 'Viewer').length,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary-900">Users</h1>
        <p className="text-secondary-600 mt-2">
          Manage team members, managers, and user roles
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white border border-secondary-200 rounded-lg p-4">
          <p className="text-sm text-secondary-600">Total Users</p>
          <p className="text-2xl font-bold text-secondary-900">{roleCounts.all}</p>
        </div>
        <div className="bg-white border border-error-200 rounded-lg p-4">
          <p className="text-sm text-error-600">Admins</p>
          <p className="text-2xl font-bold text-error-700">{roleCounts.admin}</p>
        </div>
        <div className="bg-white border border-primary-200 rounded-lg p-4">
          <p className="text-sm text-primary-600">PMs</p>
          <p className="text-2xl font-bold text-primary-700">{roleCounts.pm}</p>
        </div>
        <div className="bg-white border border-warning-200 rounded-lg p-4">
          <p className="text-sm text-warning-600">Finance</p>
          <p className="text-2xl font-bold text-warning-700">{roleCounts.finance}</p>
        </div>
        <div className="bg-white border border-success-200 rounded-lg p-4">
          <p className="text-sm text-success-600">Team</p>
          <p className="text-2xl font-bold text-success-700">{roleCounts.teamMember}</p>
        </div>
        <div className="bg-white border border-secondary-200 rounded-lg p-4">
          <p className="text-sm text-secondary-600">Viewers</p>
          <p className="text-2xl font-bold text-secondary-700">{roleCounts.viewer}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white border border-secondary-200 rounded-lg p-4 mb-6">
        <label htmlFor="role-filter" className="text-sm font-medium text-secondary-700 mr-2">
          Filter by Role:
        </label>
        <select
          id="role-filter"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
        >
          <option value="ALL">All Roles ({roleCounts.all})</option>
          <option value="Admin">Admin ({roleCounts.admin})</option>
          <option value="ProjectManager">Project Manager ({roleCounts.pm})</option>
          <option value="Finance">Finance ({roleCounts.finance})</option>
          <option value="TeamMember">Team Member ({roleCounts.teamMember})</option>
          <option value="Viewer">Viewer ({roleCounts.viewer})</option>
        </select>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-white border border-secondary-200 rounded-lg">
          <p className="text-secondary-600">No users found</p>
        </div>
      ) : (
        <div className="bg-white border border-secondary-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-secondary-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-700 font-semibold text-sm">
                          {u.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-secondary-900">{u.full_name}</p>
                        {u.id === user.id && (
                          <span className="text-xs text-primary-600">(You)</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-700">
                    {u.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(u.role)}`}>
                      {getRoleDisplay(u.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      u.is_active ? 'bg-success-100 text-success-800' : 'bg-error-100 text-error-800'
                    }`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-700">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
