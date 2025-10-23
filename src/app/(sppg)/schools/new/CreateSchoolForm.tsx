/**
 * @fileoverview Create School Form Client Component
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { useRouter } from 'next/navigation'

import { SchoolForm } from '@/features/sppg/school/components/SchoolForm'
import { useCreateSchool } from '@/features/sppg/school/hooks'
import type { SchoolMasterInput } from '@/features/sppg/school/schemas'

/**
 * CreateSchoolForm Component
 * 
 * Client component wrapper for SchoolForm with create logic
 */
export function CreateSchoolForm() {
  const router = useRouter()
  const { mutateAsync: createSchool, isPending } = useCreateSchool()

  const handleSubmit = async (data: SchoolMasterInput) => {
    try {
      const result = await createSchool(data)
      
      if (result.id) {
        // Toast already shown by mutation hook
        router.push(`/schools/${result.id}`)
      }
    } catch (error) {
      // Error already handled by mutation hook
      console.error('Create school error:', error)
    }
  }

  return (
    <SchoolForm
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      mode="create"
    />
  )
}
