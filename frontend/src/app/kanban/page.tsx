/**
 * Kanban Project Selector Page
 * Allows users to select a project to view its Kanban board
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { Project } from '@/types/project'
import { PlusIcon } from '@/components/icons/PlusIcon'

export default function KanbanProjectSelectPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchProjects()
  }, [user])

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.get<any>('/projects?limit=100') // Fetch all active projects
      setProjects(data.items || data.projects || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
      setError('Failed to load projects. Please try refreshing the page.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-slate-50">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading projects...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 bg-slate-50 rounded-lg shadow">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center bg-red-100 text-red-800 border border-red-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p>{error}</p>
            <button
              onClick={fetchProjects}
              className="mt-6 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-slate-50/50 rounded-lg shadow">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-slate-800">Kanban Boards</h1>
        <p className="text-slate-600 mt-2">
          Select a project to view its Kanban board or create a new project.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.length === 0 ? (
          <div className="lg:col-span-3 text-center py-8 bg-white border border-slate-200 rounded-lg">
            <p className="text-slate-600 mb-4">No projects found. Create one to get started!</p>
            <Link
              href="/projects/new"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Project
            </Link>
          </div>
        ) : (
          projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}/kanban`}
              className="flex flex-col justify-between bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div>
                <h2 className="text-lg font-semibold text-slate-800">{project.name}</h2>
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">{project.description}</p>
              </div>
              <div className="mt-4 text-xs text-slate-500">
                Client: {project.client_name}
              </div>
            </Link>
          ))
        )}
      </div>

      {projects.length > 0 && (
        <div className="mt-8 text-center">
          <Link
            href="/projects/new"
            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create New Project
          </Link>
        </div>
      )}
    </div>
  )
}
