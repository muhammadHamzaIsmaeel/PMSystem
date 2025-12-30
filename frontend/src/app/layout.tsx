'use client'

import { usePathname } from 'next/navigation'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { MainLayout } from '@/components/layout/MainLayout'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// Metadata cannot be exported from a client component.
// This is a known limitation in Next.js.
// We'll keep the metadata here for reference, but it won't be applied.
// export const metadata: Metadata = {
//   title: 'Project Management System',
//   description:
//     'Full-featured project management with Kanban boards, time tracking, and financial management',
// }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const isDashboardRoute = [
    '/dashboard',
    '/projects',
    '/tasks',
    '/expenses',
    '/time-tracking',
    '/income',
    '/financial',
    '/reports',
    '/users',
    '/kanban', // Added for the project selection page
    '/projects/[id]/kanban', // Added for project-specific kanban boards
  ].some((route) => pathname.startsWith(route.replace('[id]', ''))) // Handle dynamic [id] segments

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {isDashboardRoute ? (
            <MainLayout>{children}</MainLayout>
          ) : (
            children
          )}
        </AuthProvider>
      </body>
    </html>
  )
}
