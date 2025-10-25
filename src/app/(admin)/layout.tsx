/**
 * Admin Platform Layout
 * Main layout wrapper for all admin pages
 * 
 * @route /admin/*
 * @access Platform Admin (SUPERADMIN, SUPPORT, ANALYST)
 * 
 * Features:
 * - Responsive sidebar with collapsible menu
 * - Top header with search and notifications
 * - Breadcrumb navigation
 * - Theme toggle support
 * - Mobile-friendly drawer
 * 
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { ReactNode } from 'react'
import { AdminLayoutClient } from '@/components/shared/layouts/AdminLayoutClient'

interface AdminLayoutProps {
  children: ReactNode
}

/**
 * Admin Layout (Server Component)
 * Wraps with client component to prevent hydration mismatch
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
