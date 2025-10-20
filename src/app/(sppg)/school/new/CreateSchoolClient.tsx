/**
 * @fileoverview Create School Client Component
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCreateSchool } from '@/features/sppg/school/hooks'
import { SchoolForm } from '@/features/sppg/school/components'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2 } from 'lucide-react'
import type { SchoolMasterInput } from '@/features/sppg/school/schemas'

/**
 * Client component for create school page
 * Full form implementation with SchoolForm component
 */
export default function CreateSchoolClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const programId = searchParams.get('programId')
  const { mutate: createSchool, isPending } = useCreateSchool()

  const handleSubmit = async (data: SchoolMasterInput) => {
    createSchool(data, {
      onSuccess: (result) => {
        if (result.data?.id) {
          router.push(`/school/${result.data.id}`)
        } else {
          router.push('/school')
        }
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Success Notice */}
      <Alert>
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <strong>Form Tambah Sekolah Baru</strong>
          <p className="mt-1 text-sm text-muted-foreground">
            Lengkapi semua informasi sekolah yang akan ditambahkan. Field bertanda * wajib diisi.
          </p>
        </AlertDescription>
      </Alert>

      {/* School Create Form */}
      <SchoolForm
        defaultValues={programId ? { programId } : undefined}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </div>
  )
}
