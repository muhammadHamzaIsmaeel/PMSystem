/**
 * Edit Project Page
 * Page for editing existing projects
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { Project, ProjectUpdate } from '@/types/project'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchProject()
  }, [user, projectId])

  const fetchProject = async () => {
    try {
      setIsFetching(true)
      const data = await apiClient.get<Project>(`/projects/${projectId}`)
      setProject(data)
    } catch (error) {
      console.error('Error fetching project:', error)
      alert('Failed to load project')
      router.push('/projects')
    } finally {
      setIsFetching(false)
    }
  }

  const handleSubmit = async (formData: any) => {
    try {
      setIsLoading(true)

      // Convert date strings to ISO 8601 datetime strings
      const dataToSend = {
        ...formData,
        start_date: formData.start_date
          ? new Date(formData.start_date).toISOString()
          : undefined,
        end_date: formData.end_date
          ? new Date(formData.end_date).toISOString()
          : undefined,
      }

      await apiClient.put(`/projects/${projectId}`, dataToSend)

      alert('Project updated successfully!')
      router.push(`/projects/${projectId}`)
    } catch (error: any) {
      console.error('Error updating project:', error)
      const errorMsg = error?.message || 'Failed to update project. Please check all fields.'
      alert(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push(`/projects/${projectId}`)
  }

  if (!user || isFetching) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-secondary-600">Loading project...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-secondary-600">Project not found</p>
        </div>
      </div>
    )
  }

  // Prepare initial data for form
  const initialData = {
    name: project.name,
    client_name: project.client_name,
    description: project.description || '',
    budget: project.budget || null,
    start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
    end_date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '',
    status: project.status,
    manager_id: project.manager_id,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-secondary-900">Edit Project</h1>
          <p className="text-secondary-600 mt-2">
            Update project details for: {project.name}
          </p>
        </div>

        <div className="bg-white border border-secondary-200 rounded-lg p-6">
          <ProjectForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
            currentUser={user}
          />
        </div>
      </div>
    </div>
  )
}
