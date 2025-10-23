/**
 * @fileoverview Edit School Form Client Component
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { useRouter } from 'next/navigation'

import { SchoolForm } from '@/features/sppg/school/components/SchoolForm'
import { useSchool, useUpdateSchool } from '@/features/sppg/school/hooks'
import type { SchoolMasterInput } from '@/features/sppg/school/schemas'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Props for EditSchoolForm
 */
interface EditSchoolFormProps {
  schoolId: string
}

/**
 * Loading skeleton
 */
function FormLoading() {
  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-4 w-[300px] mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

/**
 * EditSchoolForm Component
 * 
 * Client component wrapper for SchoolForm with edit logic
 */
export function EditSchoolForm({ schoolId }: EditSchoolFormProps) {
  const router = useRouter()
  const { data: school, isLoading } = useSchool(schoolId)
  const { mutateAsync: updateSchool, isPending } = useUpdateSchool()

  const handleSubmit = async (data: SchoolMasterInput) => {
    try {
      const result = await updateSchool({ id: schoolId, data })
      
      if (result.id) {
        // Toast already shown by mutation hook
        router.push(`/schools/${result.id}`)
      }
    } catch (error) {
      // Error already handled by mutation hook
      console.error('Update school error:', error)
    }
  }

  if (isLoading) {
    return <FormLoading />
  }

  if (!school) {
    return (
      <Card className="max-w-4xl">
        <CardContent className="py-10">
          <p className="text-center text-muted-foreground">
            Sekolah tidak ditemukan
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <SchoolForm
      defaultValues={school as unknown as Partial<SchoolMasterInput>}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      mode="edit"
    />
  )
}
