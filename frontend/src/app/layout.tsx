'use client'

import { usePathname } from 'next/navigation'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import DashboardLayout from '@/components/layout/DashboardLayout'

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
    '/income',
    '/users',
  ].some((route) => pathname.startsWith(route))

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {isDashboardRoute ? (
            <DashboardLayout>{children}</DashboardLayout>
          ) : (
            children
          )}
        </AuthProvider>
      </body>
    </html>
  )
}
