/**
 * @fileoverview Enterprise login page with Auth.js v5 and modular architecture
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { LoginPage } from '@/features/auth/components'
import { getUserRedirectUrl } from '@/features/auth/lib'

interface PageProps {
  searchParams: Promise<{
    callbackUrl?: string
    error?: string
    logout?: string
  }>
}

/**
 * Enterprise login page with automatic redirects for authenticated users
 */
export default async function Page({ searchParams }: PageProps) {
  // Await searchParams for Next.js 15 compatibility
  const params = await searchParams
  
  // Check if user is already authenticated
  const session = await auth()
  
  if (session?.user) {
    // Redirect authenticated users to their appropriate dashboard
    const redirectUrl = params.callbackUrl || getUserRedirectUrl(session.user)
    redirect(redirectUrl)
  }
  
  // Show success message for logout
  if (params.logout === 'success') {
    // You could show a toast or message here
    console.log('Successfully logged out')
  }
  
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <LoginPage callbackUrl={params.callbackUrl} />
    </Suspense>
  )
}

/**
 * Metadata for SEO and security
 */
export const metadata = {
  title: 'Login - Bagizi-ID SPPG Management Platform',
  description: 'Masuk ke platform manajemen SPPG Bagizi-ID untuk mengelola program gizi dengan mudah dan efisien.',
  robots: 'noindex, nofollow', // Don't index login pages
  openGraph: {
    title: 'Login - Bagizi-ID',
    description: 'Platform manajemen SPPG terpercaya untuk program gizi Indonesia.',
    type: 'website'
  }
}