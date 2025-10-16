/**
 * @fileoverview Create Menu Plan Page
 * @description Page for creating new menu plans
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { MenuPlanForm } from '@/features/sppg/menu-planning/components'
import { useActivePrograms } from '@/features/sppg/menu-planning/hooks'

export default function CreateMenuPlanPage() {
  const router = useRouter()
  const { data: programs, isLoading, error } = useActivePrograms()

  const handleSuccess = (planId: string) => {
    router.push(`/menu-planning/${planId}`)
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="flex-1 space-y-4 md:space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/menu-planning">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Rencana Menu
        </Link>
      </Button>

      {/* Page Header */}
      <div className="space-y-3 md:space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buat Rencana Menu</h1>
          <p className="text-muted-foreground">
            Buat rencana menu baru untuk program gizi Anda
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Gagal memuat program: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Form Card */}
      {!isLoading && !error && (
        <Card>
          <CardHeader>
            <CardTitle>Informasi Rencana</CardTitle>
            <CardDescription>
              Isi detail di bawah ini untuk membuat rencana menu baru. Anda dapat menyimpannya
              sebagai draf atau mengirimkan untuk review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MenuPlanForm 
              programs={programs || []} 
              onSuccess={handleSuccess} 
              onCancel={handleCancel} 
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
