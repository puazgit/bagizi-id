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

  console.log('='.repeat(80))
  console.log('[Middleware] 🚀 REQUEST START:', {
    pathname,
    method: req.method,
    timestamp: new Date().toISOString()
  })

  // Public routes
  const isPublicRoute = 
    pathname === '/' ||
    pathname.startsWith('/features') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/blog') ||
    pathname.startsWith('/case-studies')

  // Auth routes
  const isAuthRoute = 
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/demo-request')

  // Admin routes
  const isAdminRoute = pathname.startsWith('/admin')

  // SPPG routes (Layer 2: SPPG Operations)
  const isSppgRoute = 
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/menu') ||
    pathname.startsWith('/procurement') ||
    pathname.startsWith('/production') ||
    pathname.startsWith('/distribution') ||
    pathname.startsWith('/inventory') ||
    pathname.startsWith('/hrd') ||
    pathname.startsWith('/reports')

  console.log('[Middleware] 📋 Route Classification:', {
    isPublicRoute,
    isAuthRoute,
    isAdminRoute,
    isSppgRoute
  })

  // Allow public routes
  if (isPublicRoute) {
    console.log('[Middleware] ✅ Public route - allowing access')
    return NextResponse.next()
  }

  console.log('[Middleware] 🔐 Session Check:', {
    hasSession: !!session,
    userId: session?.user?.id,
    email: session?.user?.email,
    userRole: session?.user?.userRole,
    userType: session?.user?.userType,
    sppgId: session?.user?.sppgId
  })

  // Redirect to login if not authenticated
  if (!session && !isAuthRoute) {
    console.log('[Middleware] ❌ No session - redirecting to login')
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Redirect authenticated users away from auth pages
  if (session && isAuthRoute) {
    const redirectUrl = 
      session.user.userRole === 'PLATFORM_SUPERADMIN' 
        ? '/admin' 
        : '/dashboard'
    console.log('[Middleware] 🔄 Auth route with session - redirecting to:', redirectUrl)
    return NextResponse.redirect(new URL(redirectUrl, req.url))
  }

  // Check SPPG access
  if (isSppgRoute) {
    console.log('[Middleware] 🏢 SPPG Route Check:', {
      pathname,
      sppgId: session?.user?.sppgId,
      userRole: session?.user?.userRole,
      userType: session?.user?.userType,
      email: session?.user?.email
    })

    // Must have sppgId
    if (!session?.user.sppgId) {
      console.log('[Middleware] ❌ FAILED: No sppgId - redirecting to access-denied')
      return NextResponse.redirect(new URL('/access-denied', req.url))
    }

    // Check if SPPG role
    const isSppgUser = session.user.userRole?.startsWith('SPPG_') ||
                      session.user.userType === 'SPPG_USER' ||
                      session.user.userType === 'SPPG_ADMIN'
    
    console.log('[Middleware] 👤 SPPG User Validation:', { 
      isSppgUser,
      roleStartsWithSPPG: session.user.userRole?.startsWith('SPPG_'),
      typeIsSppgUser: session.user.userType === 'SPPG_USER',
      typeIsSppgAdmin: session.user.userType === 'SPPG_ADMIN'
    })
    
    if (!isSppgUser) {
      console.log('[Middleware] ❌ FAILED: Not SPPG user - redirecting to admin')
      return NextResponse.redirect(new URL('/admin', req.url))
    }

    console.log('[Middleware] ✅ SPPG user validation passed')
  }

  // Check admin access
  if (isAdminRoute) {
    const isAdmin = 
      session?.user.userRole === 'PLATFORM_SUPERADMIN' ||
      session?.user.userRole === 'PLATFORM_SUPPORT' ||
      session?.user.userRole === 'PLATFORM_ANALYST'
    
    console.log('[Middleware] 👑 Admin Access Check:', { isAdmin })
    
    if (!isAdmin) {
      console.log('[Middleware] ❌ FAILED: Not admin - redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // **CRITICAL: Role-Based Access Control for SPPG Routes**
  // Each SPPG route requires specific roles for security and operational control
  
  // Menu Management - Nutrition experts and administrators
  if (pathname.startsWith('/menu')) {
    const userRole = session?.user?.userRole ?? ''
    const allowedRoles = ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AHLI_GIZI']
    const hasAccess = allowedRoles.includes(userRole)
    
    console.log('[Middleware] 🍽️  Menu Access Check:', {
      userRole,
      allowedRoles,
      hasAccess
    })
    
    if (!hasAccess) {
      console.log('[Middleware] ❌ FAILED: Menu access denied')
      return NextResponse.redirect(new URL('/dashboard?error=access-denied', req.url))
    }
  }

  // Production Management - Production staff and quality control
  if (pathname.startsWith('/production')) {
    const userRole = session?.user?.userRole ?? ''
    const allowedRoles = ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_PRODUKSI_MANAGER', 'SPPG_STAFF_DAPUR', 'SPPG_STAFF_QC', 'SPPG_AHLI_GIZI']
    const hasAccess = allowedRoles.includes(userRole)
    
    console.log('[Middleware] 🏭 PRODUCTION ACCESS CHECK:', {
      pathname,
      userRole,
      userRoleType: typeof userRole,
      allowedRoles,
      hasAccess,
      email: session?.user?.email,
      isRoleInArray: allowedRoles.includes(userRole),
      roleComparisons: allowedRoles.map(role => ({
        role,
        matches: role === userRole,
        strictEqual: role === userRole,
        looseEqual: role == userRole
      }))
    })
    
    if (!hasAccess) {
      console.log('[Middleware] ❌❌❌ FAILED: Production access DENIED - REDIRECTING TO DASHBOARD')
      console.log('[Middleware] 🔴 Redirect reason: userRole not in allowedRoles')
      return NextResponse.redirect(new URL('/dashboard?error=access-denied', req.url))
    }
    
    console.log('[Middleware] ✅✅✅ Production access GRANTED - allowing request to proceed')
  }

  console.log('[Middleware] ✅ All checks passed - allowing request')
  console.log('='.repeat(80))
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