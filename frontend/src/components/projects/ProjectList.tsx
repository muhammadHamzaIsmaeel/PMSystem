/**
 * ProjectList Component
 * Displays a paginated list of projects with create button
 */

'use client'

import { useState } from 'react'
import { Project } from '@/types/project'
import { ProjectCard } from './ProjectCard'
import { useHasRole } from '@/hooks/useAuth'
import { UserRole } from '@/types/common'

interface ProjectListProps {
  projects: Project[]
  onEdit?: (project: Project) => void
  onDelete?: (projectId: string) => void
  onCreate?: () => void
  totalCount?: number
  currentPage?: number
  pageSize?: number
  onPageChange?: (page: number) => void
}

export function ProjectList({
  projects,
  onEdit,
  onDelete,
  onCreate,
  totalCount = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
}: ProjectListProps) {
  const canCreate = useHasRole([UserRole.ADMIN, UserRole.PROJECT_MANAGER])
  const totalPages = Math.ceil(totalCount / pageSize)

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-600 mb-4">No projects found</p>
        {canCreate && onCreate && (
          <button
            onClick={onCreate}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create First Project
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-secondary-900">
          Projects
          {totalCount > 0 && (
            <span className="ml-2 text-lg font-normal text-secondary-600">
              ({totalCount})
            </span>
          )}
        </h2>
        {canCreate && onCreate && (
          <button
            onClick={onCreate}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-secondary-300 rounded-lg hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current
              const showPage =
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 1

              if (!showPage) {
                // Show ellipsis for skipped pages
                if (page === 2 || page === totalPages - 1) {
                  return (
                    <span key={page} className="px-2 py-2 text-secondary-600">
                      ...
                    </span>
                  )
                }
                return null
              }

              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    page === currentPage
                      ? 'bg-primary-600 text-white'
                      : 'border border-secondary-300 hover:bg-secondary-50'
                  }`}
                >
                  {page}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-secondary-300 rounded-lg hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
