/**
 * @fileoverview Edit School Client Component  
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { useRouter } from 'next/navigation'
import { useSchool, useUpdateSchool } from '@/features/sppg/school/hooks'
import { SchoolForm } from '@/features/sppg/school/components'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react'
import type { SchoolMasterInput } from '@/features/sppg/school/schemas'

interface EditSchoolClientProps {
  schoolId: string
}

/**
 * Client component for edit school page
 * Full form implementation with SchoolForm component
 */
export default function EditSchoolClient({ schoolId }: EditSchoolClientProps) {
  const router = useRouter()
  const { data: school, isLoading, error } = useSchool(schoolId)
  const { mutate: updateSchool, isPending } = useUpdateSchool()

  const handleSubmit = async (data: SchoolMasterInput) => {
    updateSchool(
      { id: schoolId, data },
      {
        onSuccess: () => {
          router.push(`/school/${schoolId}`)
        },
      }
    )
  }

  // Loading state
  if (isLoading) {
    return <EditFormSkeleton />
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Gagal memuat data sekolah. Silakan coba lagi.
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          onClick={() => router.push(`/school/${schoolId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Detail
        </Button>
      </div>
    )
  }

  // Not found state
  if (!school) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            Sekolah tidak ditemukan atau Anda tidak memiliki akses.
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          onClick={() => router.push('/school')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Daftar Sekolah
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Notice */}
      <Alert>
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <strong>Form Edit Sekolah</strong>
          <p className="mt-1 text-sm text-muted-foreground">
            Ubah data sekolah sesuai kebutuhan. Semua field bertanda * wajib diisi.
          </p>
        </AlertDescription>
      </Alert>

      {/* School Edit Form */}
      <SchoolForm
        defaultValues={school as Partial<SchoolMasterInput>}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="edit"
      />
    </div>
  )
}

/**
 * Loading skeleton for edit form
 */
function EditFormSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
