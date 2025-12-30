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
        return 'bg-red-100 text-red-800'
      case 'ProjectManager':
        return 'bg-blue-100 text-blue-800'
      case 'Finance':
        return 'bg-amber-100 text-amber-800'
      case 'TeamMember':
        return 'bg-emerald-100 text-emerald-800'
      case 'Viewer':
        return 'bg-slate-100 text-slate-800'
      default:
        return 'bg-slate-100 text-slate-800'
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
      <div className="container mx-auto px-4 py-8 bg-slate-50">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading users...</p>
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
    <div className="container mx-auto px-4 py-8 bg-slate-50/50 rounded-lg shadow">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Users</h1>
        <p className="text-slate-600 mt-2">
          Manage team members, managers, and user roles
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-sm text-slate-600">Total Users</p>
          <p className="text-2xl font-bold text-slate-800">{roleCounts.all}</p>
        </div>
        <div className="bg-white border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">Admins</p>
          <p className="text-2xl font-bold text-red-700">{roleCounts.admin}</p>
        </div>
        <div className="bg-white border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600">PMs</p>
          <p className="text-2xl font-bold text-blue-700">{roleCounts.pm}</p>
        </div>
        <div className="bg-white border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-600">Finance</p>
          <p className="text-2xl font-bold text-amber-700">{roleCounts.finance}</p>
        </div>
        <div className="bg-white border border-emerald-200 rounded-lg p-4">
          <p className="text-sm text-emerald-600">Team</p>
          <p className="text-2xl font-bold text-emerald-700">{roleCounts.teamMember}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-sm text-slate-600">Viewers</p>
          <p className="text-2xl font-bold text-slate-800">{roleCounts.viewer}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <label htmlFor="role-filter" className="text-sm font-medium text-slate-700 mr-2">
          Filter by Role:
        </label>
        <select
          id="role-filter"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white text-slate-800"
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
        <div className="text-center py-12 bg-white border border-slate-200 rounded-lg">
          <p className="text-slate-600">No users found</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-700 font-semibold text-sm">
                          {u.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-slate-800">{u.full_name}</p>
                        {u.id === user.id && (
                          <span className="text-xs text-blue-600">(You)</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {u.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(u.role)}`}>
                      {getRoleDisplay(u.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
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
