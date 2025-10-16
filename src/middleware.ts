/**
 * @fileoverview Enhanced middleware for multi-layer route protection and role-based access control
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Public routes that don't require authentication
  const isPublicRoute = 
    pathname === '/' ||
    pathname.startsWith('/features') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/blog') ||
    pathname.startsWith('/case-studies') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/public') ||
    pathname === '/favicon.ico'

  // Authentication routes
  const isAuthRoute = 
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/demo-request') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password')

  // Admin routes (Platform management)
  const isAdminRoute = pathname.startsWith('/admin')

  // SPPG routes (Tenant operations)
  const isSppgRoute = 
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/menu') ||
    pathname.startsWith('/procurement') ||
    pathname.startsWith('/production') ||
    pathname.startsWith('/distribution') ||
    pathname.startsWith('/inventory') ||
    pathname.startsWith('/hrd') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/settings')

  // Allow public routes without authentication
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Redirect unauthenticated users to login (except auth routes)
  if (!session && !isAuthRoute) {
    const loginUrl = new URL('/login', req.url)
    // Preserve the original URL for redirect after login
    if (!isAuthRoute) {
      loginUrl.searchParams.set('callbackUrl', pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if (session && isAuthRoute) {
    // Determine redirect based on user role and type
    let redirectUrl = '/dashboard' // Default SPPG dashboard

    if (session.user.userRole === 'PLATFORM_SUPERADMIN' || 
        session.user.userRole === 'PLATFORM_SUPPORT' ||
        session.user.userRole === 'PLATFORM_ANALYST') {
      redirectUrl = '/admin' // Platform admin dashboard
    } else if (session.user.userType === 'DEMO_REQUEST') {
      redirectUrl = '/demo-setup'
    } else if (session.user.userType === 'PROSPECT') {
      redirectUrl = '/onboarding'
    }

    return NextResponse.redirect(new URL(redirectUrl, req.url))
  }

  // Admin route protection - Platform roles only
  if (isAdminRoute) {
    const isPlatformUser = 
      session?.user.userRole === 'PLATFORM_SUPERADMIN' ||
      session?.user.userRole === 'PLATFORM_SUPPORT' ||
      session?.user.userRole === 'PLATFORM_ANALYST'
    
    if (!isPlatformUser) {
      // Non-platform users get redirected to their appropriate dashboard
      const redirectUrl = session?.user.sppgId ? '/dashboard' : '/access-denied'
      return NextResponse.redirect(new URL(redirectUrl, req.url))
    }
  }

  // SPPG route protection - SPPG users only
  if (isSppgRoute) {
    // Must have sppgId for SPPG access (multi-tenant safety)
    if (!session?.user.sppgId) {
      return NextResponse.redirect(new URL('/access-denied', req.url))
    }

    // Check if user has SPPG role
    const isSppgUser = session.user.userRole?.startsWith('SPPG_') ||
                      session.user.userType === 'SPPG_USER' ||
                      session.user.userType === 'SPPG_ADMIN'
    
    if (!isSppgUser) {
      // Platform users trying to access SPPG routes get redirected to admin
      return NextResponse.redirect(new URL('/admin', req.url))
    }

    // Demo user restrictions
    if (session.user.userRole === 'DEMO_USER') {
      const allowedDemoRoutes = ['/dashboard', '/menu', '/procurement']
      const isAllowedDemoRoute = allowedDemoRoutes.some(route => 
        pathname.startsWith(route)
      )
      
      if (!isAllowedDemoRoute) {
        return NextResponse.redirect(new URL('/dashboard?demo=limited', req.url))
      }
    }
  }

  // Role-based feature access within SPPG routes
  if (isSppgRoute && session?.user.userRole) {
    const userRole = session.user.userRole

    // Menu management access
    if (pathname.startsWith('/menu') && 
        !['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AHLI_GIZI'].includes(userRole)) {
      return NextResponse.redirect(new URL('/dashboard?error=access-denied', req.url))
    }

    // Procurement access
    if (pathname.startsWith('/procurement') && 
        !['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN'].includes(userRole)) {
      return NextResponse.redirect(new URL('/dashboard?error=access-denied', req.url))
    }

    // Production access
    if (pathname.startsWith('/production') && 
        !['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_PRODUKSI_MANAGER', 'SPPG_STAFF_DAPUR'].includes(userRole)) {
      return NextResponse.redirect(new URL('/dashboard?error=access-denied', req.url))
    }

    // Distribution access
    if (pathname.startsWith('/distribution') && 
        !['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_DISTRIBUSI_MANAGER', 'SPPG_STAFF_DISTRIBUSI'].includes(userRole)) {
      return NextResponse.redirect(new URL('/dashboard?error=access-denied', req.url))
    }

    // HRD access
    if (pathname.startsWith('/hrd') && 
        !['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_HRD_MANAGER'].includes(userRole)) {
      return NextResponse.redirect(new URL('/dashboard?error=access-denied', req.url))
    }

    // Reports access - most roles can view, but some are restricted
    if (pathname.startsWith('/reports/financial') && 
        !['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN'].includes(userRole)) {
      return NextResponse.redirect(new URL('/reports?error=access-denied', req.url))
    }
  }

  return NextResponse.next()
})

// Matcher configuration - exclude API routes and static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}