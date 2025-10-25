/**
 * @fileoverview Admin Platform Breadcrumb Navigation
 * Dynamic breadcrumb based on current route
 * 
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Home } from 'lucide-react'

interface BreadcrumbSegment {
  label: string
  href?: string
}

// Route label mapping
const routeLabels: Record<string, string> = {
  admin: 'Admin Dashboard',
  sppg: 'SPPG Management',
  users: 'User Management',
  regional: 'Regional Data',
  subscriptions: 'Subscriptions',
  invoices: 'Invoices',
  analytics: 'Platform Analytics',
  'activity-logs': 'Activity Logs',
  notifications: 'Notifications',
  settings: 'System Settings',
  security: 'Security',
  database: 'Database',
  help: 'Help Center',
  profile: 'Profile',
  new: 'Create New',
  edit: 'Edit',
}

export function AdminBreadcrumb() {
  const pathname = usePathname()

  // Generate breadcrumb segments from pathname
  const generateBreadcrumbs = (): BreadcrumbSegment[] => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbSegment[] = []

    // Always start with home
    breadcrumbs.push({
      label: 'Home',
      href: '/admin'
    })

    let currentPath = ''
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      currentPath += `/${segment}`

      // Skip if it's just 'admin' as we already have home
      if (segment === 'admin') continue

      // Check if it's a UUID (detail page)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)
      
      if (isUUID) {
        // For UUID, use generic "Detail" or get from parent context
        breadcrumbs.push({
          label: 'Detail',
          // No href for current detail page
          href: i < segments.length - 1 ? currentPath : undefined
        })
      } else {
        // Use mapped label or capitalize segment
        const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
        breadcrumbs.push({
          label,
          // Only add href if not the last segment
          href: i < segments.length - 1 ? currentPath : undefined
        })
      }
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // Don't show breadcrumb on home page
  if (pathname === '/admin') {
    return null
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {crumb.href ? (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>
                    {index === 0 ? (
                      <span className="flex items-center gap-1">
                        <Home className="h-3.5 w-3.5" />
                        {crumb.label}
                      </span>
                    ) : (
                      crumb.label
                    )}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>
                  {index === 0 ? (
                    <span className="flex items-center gap-1">
                      <Home className="h-3.5 w-3.5" />
                      {crumb.label}
                    </span>
                  ) : (
                    crumb.label
                  )}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
