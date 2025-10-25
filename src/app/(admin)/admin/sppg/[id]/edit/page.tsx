/**
 * Admin SPPG Edit Page
 * Edit existing SPPG using reusable SppgForm component
 * 
 * @route /admin/sppg/[id]/edit
 * @access Platform Admin (SUPERADMIN, SUPPORT)
 * 
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /src/features/admin/sppg-management/components/SppgForm.tsx} Form Component
 */

'use client'

import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { SppgForm } from '@/features/admin/sppg-management/components'
import { useSppg } from '@/features/admin/sppg-management/hooks'

/**
 * SPPG Edit Page Component
 * 
 * Features:
 * - Fetches SPPG data using useSppg hook
 * - Passes data to reusable SppgForm in edit mode
 * - Handles loading states with Skeleton
 * - Displays error states with proper messaging
 * - Provides breadcrumb navigation
 * - Back button to detail page
 */
export default function EditSppgPage() {
  const params = useParams()
  const router = useRouter()
  const sppgId = params.id as string

  // Fetch SPPG data for editing
  const { data: sppg, isLoading, error } = useSppg(sppgId)

  return (
    <div className="container py-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/sppg">SPPG</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/admin/sppg/${sppgId}`}>
              {isLoading ? 'Loading...' : sppg?.name || 'Detail'}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit SPPG</h1>
          <p className="text-muted-foreground mt-1">
            Perbarui informasi dan konfigurasi SPPG
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/admin/sppg/${sppgId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Detail
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Gagal Memuat Data SPPG</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {error instanceof Error 
                    ? error.message 
                    : 'Terjadi kesalahan saat memuat data. Silakan coba lagi.'}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Coba Lagi
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push('/admin/sppg')}
              >
                Kembali ke Daftar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && !error && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Form - Using Reusable SppgForm Component */}
      {!isLoading && !error && sppg && (
        <SppgForm 
          mode="edit" 
          initialData={sppg}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
