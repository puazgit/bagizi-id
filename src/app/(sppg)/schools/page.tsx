/**
 * @fileoverview School Beneficiary List Page - Main School Management
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { Suspense } from 'react'
import { Metadata } from 'next'

import { SchoolListClient } from './SchoolListClient'
import { SchoolStats } from '@/features/sppg/school/components/SchoolStats'
import { 
  Card, 
  CardContent, 
  CardHeader 
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Page metadata for SEO
 */
export const metadata: Metadata = {
  title: 'Daftar Sekolah Penerima Manfaat | Bagizi-ID',
  description: 'Kelola data sekolah penerima manfaat program pangan di SPPG Anda',
}

/**
 * Loading skeleton for stats
 */
function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[60px] mb-2" />
            <Skeleton className="h-3 w-[120px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/**
 * Loading skeleton for list
 */
function ListLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-4 w-[300px] mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Schools Page Component
 * 
 * Main page for managing school beneficiaries with:
 * - Statistics overview (4 cards)
 * - Full CRUD operations
 * - Advanced filtering
 * - Export capabilities
 * 
 * @returns School management page
 */
export default function SchoolsPage() {
  return (
    <div className="flex-1 space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="space-y-3 md:space-y-4">
        <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Sekolah Penerima Manfaat
            </h1>
            <p className="text-sm text-muted-foreground mt-1 md:mt-2">
              Kelola data sekolah dan institusi pendidikan penerima program pangan
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <Suspense fallback={<StatsLoading />}>
        <SchoolStats />
      </Suspense>

      {/* Main Content - School List with CRUD */}
      <Suspense fallback={<ListLoading />}>
        <SchoolListClient />
      </Suspense>
    </div>
  )
}
