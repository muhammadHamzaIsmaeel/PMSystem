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
  [ProjectStatus.PLANNING]: 'bg-blue-950 text-blue-300',
  [ProjectStatus.IN_PROGRESS]: 'bg-amber-950 text-amber-300',
  [ProjectStatus.ON_HOLD]: 'bg-gray-950 text-gray-300',
  [ProjectStatus.COMPLETED]: 'bg-emerald-950 text-emerald-300',
  [ProjectStatus.CANCELLED]: 'bg-red-950 text-red-300',
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const canEdit = useHasRole([UserRole.ADMIN, UserRole.PROJECT_MANAGER])
  const canDelete = useHasRole([UserRole.ADMIN])

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xl hover:shadow-2xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link
            href={`/projects/${project.id}`}
            className="text-xl font-semibold text-slate-800 hover:text-blue-500"
          >
            {project.name}
          </Link>
          <p className="text-sm text-gray-800 mt-1">Client: {project.client_name}</p>
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
        <p className="text-sm text-gray-800 mb-4 line-clamp-2">{project.description}</p>
      )}

      <div className="flex items-center justify-between text-sm text-gray-800">
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
                className="px-3 py-1 text-blue-600 hover:bg-blue-900 rounded transition-colors"
              >
                Edit
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(project.id)}
                className="px-3 py-1 text-red-400 hover:bg-red-900 rounded transition-colors"
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
