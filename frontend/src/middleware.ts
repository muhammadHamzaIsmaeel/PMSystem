/**
 * Next.js middleware for authentication and route protection
 * Runs on every request to protected routes
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password']

// Auth routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ['/login', '/register']

/**
 * Check if token exists in cookies
 */
function hasAuthToken(request: NextRequest): boolean {
  const token = request.cookies.get('access_token')?.value
  return !!token
}

/**
 * Middleware function to protect routes
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthenticated = hasAuthToken(request)

  // Allow access to public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    // If authenticated and trying to access auth pages, redirect to dashboard
    if (isAuthenticated && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Allow access to protected routes if authenticated
  return NextResponse.next()
}

/**
 * Configure which routes the middleware runs on
 * Matches all routes except static files and api routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
}
