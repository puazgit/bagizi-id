/**
 * @fileoverview School Detail Page
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 */

import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Edit } from 'lucide-react'
import SchoolDetailClient from './SchoolDetailClient'

interface SchoolDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata(): Promise<Metadata> {
  // Generic metadata for all school detail pages
  return {
    title: `Detail Sekolah | Bagizi-ID`,
    description: 'Detail informasi sekolah mitra penerima manfaat',
  }
}

/**
 * School Detail Page (Server Component)
 * 
 * Displays complete school information including:
 * - Basic information
 * - Contact details
 * - Student statistics
 * - Facilities
 * - Delivery information
 * - Program history
 * 
 * @example
 * Navigation: /school/[id]
 */
export default async function SchoolDetailPage({ params }: SchoolDetailPageProps) {
  const resolvedParams = await params
  const schoolId = resolvedParams.id

  // Validate ID format (optional but recommended)
  if (!schoolId || schoolId.length < 10) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/school">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Detail Sekolah</h1>
            <p className="text-muted-foreground mt-2">
              Informasi lengkap sekolah mitra
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/school/${schoolId}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Data
          </Link>
        </Button>
      </div>

      {/* Client Component with Suspense */}
      <Suspense fallback={<SchoolDetailSkeleton />}>
        <SchoolDetailClient schoolId={schoolId} />
      </Suspense>
    </div>
  )
}

/**
 * Loading Skeleton for School Detail
 */
function SchoolDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Main Card Skeleton */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-4 w-full" />
          </div>

          <div className="grid grid-cols-4 gap-4 pt-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Info Skeleton */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  )
}
