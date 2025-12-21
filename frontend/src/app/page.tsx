/**
 * Home/Landing Page
 * Shows a modern, stylish landing page for all users.
 */

'use client'

import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen w-full text-white font-sans">
      <Header />

      {/* Main Content - Hero Section */}
      <main className="min-h-screen flex items-center justify-center pt-24 pb-16">
        <div className="container mx-auto px-6 text-center">
          {/* Main Container */}
          <div className="bg-black bg-opacity-30 border border-gray-700 rounded-3xl shadow-2xl p-10 md:p-16 backdrop-blur-sm">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-4 text-white">
              Effortless Project Mastery
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10">
              The ultimate platform to streamline your projects, from initial planning to final delivery.
              Clarity, collaboration, and control, all in one place.
            </p>
            <Link
              href="/register"
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-20 bg-black bg-opacity-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-2">Why ProjectFlow?</h2>
            <p className="text-gray-400">
              Everything you need to ship projects on time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature Card 1 */}
            <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-2xl p-6 shadow-xl hover:border-primary-400 transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-primary-400 mb-4 text-4xl">📊</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Project Management
              </h3>
              <p className="text-gray-400">
                Create and manage projects with full lifecycle tracking, from planning to completion.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-2xl p-6 shadow-xl hover:border-primary-400 transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-primary-400 mb-4 text-4xl">⏱️</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Time Tracking
              </h3>
              <p className="text-gray-400">
                Log time entries on tasks with automatic duration calculation and seamless integration.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-2xl p-6 shadow-xl hover:border-primary-400 transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-primary-400 mb-4 text-4xl">💰</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Financial Management
              </h3>
              <p className="text-gray-400">
                Track expenses and income with automatic profit/loss calculation for each project.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-2xl p-6 shadow-xl hover:border-primary-400 transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-primary-400 mb-4 text-4xl">📋</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Kanban Board
              </h3>
              <p className="text-gray-400">
                Real-time drag-and-drop task management with WebSocket updates for team collaboration.
              </p>
            </div>

            {/* Feature Card 5 */}
            <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-2xl p-6 shadow-xl hover:border-primary-400 transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-primary-400 mb-4 text-4xl">🔒</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Role-Based Access
              </h3>
              <p className="text-gray-400">
                Secure RBAC with 5 roles: Admin, Project Manager, Team Member, Finance, and Viewer.
              </p>
            </div>

            {/* Feature Card 6 */}
            <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-2xl p-6 shadow-xl hover:border-primary-400 transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-primary-400 mb-4 text-4xl">📈</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Reports & Analytics
              </h3>
              <p className="text-gray-400">
                Comprehensive reporting with project health, team productivity, and financial insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
