/**
 * @fileoverview School Management List Page
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { Suspense } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-react'
import { SchoolListClient } from './SchoolListClient'

export const metadata: Metadata = {
  title: 'Sekolah Mitra | Bagizi-ID',
  description: 'Kelola data sekolah penerima manfaat program gizi',
}

/**
 * School List Page (Server Component)
 * 
 * Features:
 * - Statistics dashboard
 * - School list with filters
 * - Search functionality
 * - CRUD operations
 * 
 * @example
 * Navigation: /school
 */
export default function SchoolPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sekolah Mitra</h1>
          <p className="text-muted-foreground mt-2">
            Kelola data sekolah penerima manfaat program gizi
          </p>
        </div>
        <Button asChild>
          <Link href="/school/new">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Sekolah
          </Link>
        </Button>
      </div>

      {/* Client Component with Suspense */}
      <Suspense fallback={<SchoolListSkeleton />}>
        <SchoolListClient />
      </Suspense>
    </div>
  )
}

/**
 * Loading Skeleton for School List
 */
function SchoolListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-lg border bg-card p-6">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="rounded-lg border bg-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-10 md:col-span-2" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      </div>

      {/* List Skeleton */}
      <div className="rounded-lg border bg-card p-6">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
