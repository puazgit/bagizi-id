/**
 * @fileoverview Edit Menu Plan Page
 * @description Page for editing existing menu plans
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { MenuPlanForm } from '@/features/sppg/menu-planning/components'
import { useMenuPlan, useActivePrograms } from '@/features/sppg/menu-planning/hooks'
import { Skeleton } from '@/components/ui/skeleton'

interface EditMenuPlanPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditMenuPlanPage({ params }: EditMenuPlanPageProps) {
  const resolvedParams = use(params)
  const planId = resolvedParams.id
  const router = useRouter()

  const { data: plan, isLoading: isPlanLoading, error: planError } = useMenuPlan(planId)
  const { data: programs, isLoading: isProgramsLoading, error: programsError } = useActivePrograms()

  const isLoading = isPlanLoading || isProgramsLoading
  const error = planError || programsError

  const handleSuccess = () => {
    router.push(`/menu-planning/${planId}`)
  }

  const handleCancel = () => {
    router.push(`/menu-planning/${planId}`)
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 md:space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="flex-1 space-y-4 md:space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/menu-planning">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Rencana Menu
        </Link>
      </Button>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Gagal memuat rencana menu. Silakan coba lagi.'}
          </AlertDescription>
        </Alert>

        <Button onClick={() => router.push('/menu-planning')}>
          Kembali ke Rencana Menu
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 md:space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/menu-planning/${planId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Detail Rencana
        </Link>
      </Button>

      {/* Page Header */}
      <div className="space-y-3 md:space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Rencana Menu</h1>
          <p className="text-muted-foreground">
            Perbarui informasi rencana menu di bawah ini
          </p>
        </div>
      </div>

      {/* Status Warning */}
      {plan.status !== 'DRAFT' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Rencana ini memiliki status <strong>{plan.status}</strong>. Perubahan mungkin
            memerlukan persetujuan ulang sesuai alur kerja organisasi Anda.
          </AlertDescription>
        </Alert>
      )}

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Rencana</CardTitle>
          <CardDescription>
            Perbarui detail di bawah ini. Anda dapat menyimpan perubahan sebagai draf atau mengirimkan
            untuk review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MenuPlanForm
            plan={plan}
            programs={programs || []}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}
