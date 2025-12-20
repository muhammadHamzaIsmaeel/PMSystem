/**
 * ProjectCard Component
 * Displays project information with role-based action visibility
 */

'use client'

import Link from 'next/link'
import { Project, ProjectStatus } from '@/types/project'
import { useHasRole } from '@/hooks/useAuth'
import { UserRole } from '@/types/common'

interface ProjectCardProps {
  project: Project
  onEdit?: (project: Project) => void
  onDelete?: (projectId: string) => void
}

const statusColors = {
  [ProjectStatus.PLANNING]: 'bg-secondary-100 text-secondary-800',
  [ProjectStatus.IN_PROGRESS]: 'bg-primary-100 text-primary-800',
  [ProjectStatus.ON_HOLD]: 'bg-warning-100 text-warning-800',
  [ProjectStatus.COMPLETED]: 'bg-success-100 text-success-800',
  [ProjectStatus.CANCELLED]: 'bg-error-100 text-error-800',
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const canEdit = useHasRole([UserRole.ADMIN, UserRole.PROJECT_MANAGER])
  const canDelete = useHasRole([UserRole.ADMIN])

  return (
    <div className="bg-white border border-secondary-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link
            href={`/projects/${project.id}`}
            className="text-xl font-semibold text-secondary-900 hover:text-primary-600"
          >
            {project.name}
          </Link>
          <p className="text-sm text-secondary-600 mt-1">Client: {project.client_name}</p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            statusColors[project.status]
          }`}
        >
          {project.status}
        </span>
      </div>

      {project.description && (
        <p className="text-sm text-secondary-700 mb-4 line-clamp-2">{project.description}</p>
      )}

      <div className="flex items-center justify-between text-sm text-secondary-600">
        <div className="space-y-1">
          {project.budget && (
            <p>
              <span className="font-medium">Budget:</span> ${project.budget.toLocaleString()}
            </p>
          )}
          {project.start_date && (
            <p>
              <span className="font-medium">Start:</span>{' '}
              {new Date(project.start_date).toLocaleDateString()}
            </p>
          )}
        </div>

        {(canEdit || canDelete) && (
          <div className="flex gap-2">
            {canEdit && onEdit && (
              <button
                onClick={() => onEdit(project)}
                className="px-3 py-1 text-primary-600 hover:bg-primary-50 rounded transition-colors"
              >
                Edit
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(project.id)}
                className="px-3 py-1 text-error-600 hover:bg-error-50 rounded transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
