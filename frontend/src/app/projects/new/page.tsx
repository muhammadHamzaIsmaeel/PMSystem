/**
 * New Project Page
 * Form for creating a new project
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { ProjectCreate } from '@/types/project'
import { useAuth } from '@/hooks/useAuth'

export default function NewProjectPage() {
  const router = useRouter()
  const { token, user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

              const handleSubmit = async (formData: ProjectCreate) => {

                try {

                  setIsLoading(true)

        

                  // Convert date strings to ISO 8601 datetime strings with a time component

                  // If start_date/end_date are empty strings, convert them to undefined

                  const dataToSend = {

                    ...formData,

                    start_date: formData.start_date

                      ? new Date(formData.start_date).toISOString()

                      : undefined,

                    end_date: formData.end_date

                      ? new Date(formData.end_date).toISOString()

                      : undefined,

                  }



                  const response = await fetch('/api/v1/projects', {

                    method: 'POST',

                    headers: {

                      'Content-Type': 'application/json',

                      Authorization: `Bearer ${token}`,

                    },

                    body: JSON.stringify(dataToSend),

                  })
        if (!response.ok) {
        const errorData = await response.json()
        let errorMessage = 'Failed to create project.'
        if (errorData && errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Pydantic validation errors
            errorMessage = errorData.detail
              .map((err: any) => `${err.loc.join('.')}: ${err.msg}`)
              .join('\n')
          } else if (typeof errorData.detail === 'string') {
            // General error message from backend
            errorMessage = errorData.detail
          }
        }
        throw new Error(errorMessage)
      }

      const project = await response.json()

      // Backend now returns a simple 'id' field as a string
      if (!project.id) {
          console.error('Project ID not found in response:', project);
          alert('Failed to get project ID after creation. Please check console for details.');
          setIsLoading(false);
          return;
      }

      router.push(`/projects/${project.id}`)
    } catch (error) {
      console.error('Error creating project:', error)
      alert(error instanceof Error ? error.message : 'Failed to create project')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-secondary-900">Create New Project</h1>
          <p className="text-secondary-600 mt-2">
            Fill in the details below to create a new project
          </p>
        </div>

        <div className="bg-white border border-secondary-200 rounded-lg p-6">
          <ProjectForm
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
