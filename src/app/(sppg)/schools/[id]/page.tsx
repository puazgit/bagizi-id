/**
 * @fileoverview School Detail Page - Comprehensive School Information
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { Suspense } from 'react'
import { Metadata } from 'next'

import { SchoolDetail } from '@/features/sppg/school/components/SchoolDetail'
import { schoolApi } from '@/features/sppg/school/api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Page props - Next.js 15+ requires params to be a Promise
 */
interface SchoolDetailPageProps {
  params: Promise<{
    id: string
  }>
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata(
  { params }: SchoolDetailPageProps
): Promise<Metadata> {
  try {
    const { id } = await params
    // Fetch school data for metadata
    const response = await schoolApi.getById(id)
    
    if (!response.success || !response.data) {
      return {
        title: 'Sekolah Tidak Ditemukan | Bagizi-ID',
      }
    }

    const school = response.data

    return {
      title: `${school.schoolName} | Sekolah Penerima Manfaat`,
      description: `Detail informasi ${school.schoolName} - ${school.schoolType}, ${school.totalStudents} siswa penerima manfaat`,
    }
  } catch {
    return {
      title: 'Sekolah Tidak Ditemukan | Bagizi-ID',
    }
  }
}

/**
 * Loading skeleton for detail page
 */
function DetailLoading() {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-[300px]" />
        <Skeleton className="h-4 w-[400px]" />
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>

        {/* Content Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * School Detail Page Component
 * 
 * Displays comprehensive school information with:
 * - 6-tab interface (Overview, Contact, Students, Feeding, Facilities, History)
 * - Quick actions (Edit, Delete, Reactivate)
 * - Export and print capabilities
 * - Real-time data updates
 * 
 * @param params - Route parameters with school ID (Promise in Next.js 15+)
 * @returns School detail page
 */
export default async function SchoolDetailPage({ 
  params 
}: SchoolDetailPageProps) {
  const { id } = await params
  
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* Detail Component with Tabs */}
      <Suspense fallback={<DetailLoading />}>
        <SchoolDetail schoolId={id} />
      </Suspense>
    </div>
  )
}
