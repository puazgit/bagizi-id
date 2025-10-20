/**
 * @fileoverview School List Client Component
 * @version Next.js 15.5.4 / React Query
 * @author Bagizi-ID Development Team
 */

'use client'

import { useRouter } from 'next/navigation'
import { SchoolStats, SchoolList } from '@/features/sppg/school/components'

/**
 * School List Client Component
 * 
 * Handles client-side interactions for school management:
 * - Statistics display
 * - School list with filters
 * - Navigation to detail/edit pages
 * - Create new school
 */
export function SchoolListClient() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Statistics Dashboard */}
      <SchoolStats />

      {/* School List with Actions */}
      <SchoolList
        onView={(id) => router.push(`/school/${id}`)}
        onEdit={(id) => router.push(`/school/${id}/edit`)}
        onCreate={() => router.push('/school/new')}
      />
    </div>
  )
}
