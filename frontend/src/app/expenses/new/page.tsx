/**
 * Create Expense Page
 * Page for submitting new expense with project selection
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'

export default function CreateExpensePage() {
  const router = useRouter()
  const { user } = useAuth()

  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0],
    project_id: '',
    receipt_path: '',
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

    if (!formData.category || !formData.amount || !formData.project_id) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setIsLoading(true)

      const expenseData = {
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description || undefined,
        expense_date: formData.expense_date,
        project_id: formData.project_id,
        receipt_path: formData.receipt_path || undefined,
      }

      await apiClient.post('/expenses', expenseData)

      alert('Expense submitted successfully! Awaiting approval.')
      router.push('/expenses')
    } catch (error: any) {
      console.error('Error creating expense:', error)
      alert(error.message || 'Failed to submit expense')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary-900">Submit New Expense</h1>
        <p className="text-secondary-600 mt-2">
          Submit an expense for approval
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
              <label htmlFor="category" className="block text-sm font-medium text-secondary-900 mb-1">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                required
              >
                <option value="">Select category</option>
                <option value="Travel">Travel</option>
                <option value="Equipment">Equipment</option>
                <option value="Software">Software</option>
                <option value="Marketing">Marketing</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Professional Services">Professional Services</option>
                <option value="Other">Other</option>
              </select>
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
            <label htmlFor="expense_date" className="block text-sm font-medium text-secondary-900 mb-1">
              Expense Date *
            </label>
            <input
              id="expense_date"
              name="expense_date"
              type="date"
              value={formData.expense_date}
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
              placeholder="Enter expense description"
            />
          </div>

          <div>
            <label htmlFor="receipt_path" className="block text-sm font-medium text-secondary-900 mb-1">
              Receipt Path/URL (Optional)
            </label>
            <input
              id="receipt_path"
              name="receipt_path"
              type="text"
              value={formData.receipt_path}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="Enter receipt file path or URL"
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
              {isLoading ? 'Submitting...' : 'Submit Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
