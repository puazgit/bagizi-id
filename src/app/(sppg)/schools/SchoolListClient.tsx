/**
 * @fileoverview School List Client Wrapper - Handles Navigation & Actions
 * @version Next.js 15.5.4 / Client Component
 * @author Bagizi-ID Development Team
 */

'use client'

import { useRouter } from 'next/navigation'
import { SchoolList } from '@/features/sppg/school/components/SchoolList'

/**
 * Client wrapper for SchoolList with navigation handlers
 * 
 * Provides CRUD navigation:
 * - onCreate: Navigate to /schools/new
 * - onView: Navigate to /schools/[id]
 * - onEdit: Navigate to /schools/[id]/edit
 * - onDelete: Handled by SchoolList component
 */
export function SchoolListClient() {
  const router = useRouter()

  const handleCreate = () => {
    router.push('/schools/new')
  }

  const handleView = (id: string) => {
    router.push(`/schools/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/schools/${id}/edit`)
  }

  return (
    <SchoolList
      onCreate={handleCreate}
      onView={handleView}
      onEdit={handleEdit}
    />
  )
}
