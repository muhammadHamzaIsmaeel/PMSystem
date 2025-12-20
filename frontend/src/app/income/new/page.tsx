/**
 * Create Income Page
 * Page for adding new income entry with project selection
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'

export default function CreateIncomePage() {
  const router = useRouter()
  const { user } = useAuth()

  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    description: '',
    income_date: new Date().toISOString().split('T')[0],
    project_id: '',
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchProjects()
  }, [user])

  const fetchProjects = async () => {
    try {
      const data = await apiClient.get<any>('/projects?skip=0&limit=100')
      setProjects(data.items || data.projects || data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.source || !formData.amount || !formData.project_id) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setIsLoading(true)

      const incomeData = {
        source: formData.source,
        amount: parseFloat(formData.amount),
        description: formData.description || undefined,
        income_date: formData.income_date,
        project_id: formData.project_id,
      }

      await apiClient.post('/income', incomeData)

      alert('Income added successfully!')
      router.push('/income')
    } catch (error: any) {
      console.error('Error creating income:', error)
      alert(error.message || 'Failed to add income')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary-900">Add Income</h1>
        <p className="text-secondary-600 mt-2">
          Record project revenue or income
        </p>
      </div>

      <div className="bg-white border border-secondary-200 rounded-lg p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="project_id" className="block text-sm font-medium text-secondary-900 mb-1">
              Project *
            </label>
            <select
              id="project_id"
              name="project_id"
              value={formData.project_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              required
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-secondary-900 mb-1">
                Income Source *
              </label>
              <input
                id="source"
                name="source"
                type="text"
                value={formData.source}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="e.g., Client Payment, Grant, etc."
                required
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-secondary-900 mb-1">
                Amount ($) *
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="income_date" className="block text-sm font-medium text-secondary-900 mb-1">
              Income Date *
            </label>
            <input
              id="income_date"
              name="income_date"
              type="date"
              value={formData.income_date}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-secondary-900 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="Enter income description or notes"
            />
          </div>

          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Adding...' : 'Add Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
