/**
 * Projects List Page
 * Displays all projects accessible to the current user with pagination
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectList } from '@/components/projects/ProjectList'
import { Project } from '@/types/project'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'

export default function ProjectsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const pageSize = 12

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchProjects()
  }, [currentPage, user])

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const skip = (currentPage - 1) * pageSize

      const data = await apiClient.get<any>(`/projects?skip=${skip}&limit=${pageSize}`)

      setProjects(data.items || data.projects || data)
      setTotalCount(data.total || (data.items || data.projects || data).length)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    router.push('/projects/new')
  }

  const handleEdit = (project: Project) => {
    router.push(`/projects/${project.id}/edit`)
  }

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return
    }

    try {
      await apiClient.delete(`/projects/${projectId}`)
      fetchProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-secondary-600">Loading projects...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary-900">Projects</h1>
        <p className="text-secondary-600 mt-2">
          Manage and track all your projects in one place
        </p>
      </div>

      <ProjectList
        projects={projects}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
