/**
 * Admin SPPG Detail Page - Orchestrator
 * Component-based architecture following enterprise patterns
 * 
 * @route /admin/sppg/[id]
 * @access Platform Admin (SUPERADMIN, SUPPORT, ANALYST)
 * 
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /.github/copilot-instructions.md} Component-Based Architecture Guidelines
 */

'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import {
  useSppg,
  useDeleteSppg,
  useActivateSppg,
  useSuspendSppg,
} from '@/features/admin/sppg-management/hooks'
import {
  SppgDetailHeader,
  SppgOverviewTab,
  SppgProfileTab,
  SppgLocationTab,
  SppgBudgetTab,
  SppgDemoTab,
  SppgSystemTab,
} from '@/features/admin/sppg-management/components/detail'
import { toast } from 'sonner'

/**
 * SPPG Detail Page Orchestrator
 * Coordinates components and manages state/actions
 */
export default function SppgDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  // State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Queries & Mutations
  const { data: sppg, isLoading, error } = useSppg(id)
  const { mutate: deleteSppg, isPending: isDeleting } = useDeleteSppg()
  const { mutate: activateSppg, isPending: isActivating } = useActivateSppg()
  const { mutate: suspendSppg, isPending: isSuspending } = useSuspendSppg()

  // Action Handlers
  const handleDelete = () => {
    deleteSppg(id, {
      onSuccess: () => {
        toast.success('SPPG berhasil dihapus')
        router.push('/admin/sppg')
      },
      onError: (error) => {
        toast.error(error.message || 'Gagal menghapus SPPG')
      },
    })
  }

  const handleActivate = () => {
    activateSppg(id, {
      onSuccess: () => {
        toast.success('SPPG berhasil diaktifkan')
      },
      onError: (error) => {
        toast.error(error.message || 'Gagal mengaktifkan SPPG')
      },
    })
  }

  const handleSuspend = () => {
    suspendSppg(
      { id, reason: 'Suspended by admin' },
      {
        onSuccess: () => {
          toast.success('SPPG berhasil disuspend')
        },
        onError: (error) => {
          toast.error(error.message || 'Gagal suspend SPPG')
        },
      }
    )
  }

  const handleEdit = () => {
    router.push(`/admin/sppg/${id}/edit`)
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  // Error State
  if (error || !sppg) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error?.message || 'SPPG tidak ditemukan'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Main Render
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Component */}
      <SppgDetailHeader
        sppg={sppg}
        onDelete={() => setDeleteDialogOpen(true)}
        onEdit={handleEdit}
        onActivate={handleActivate}
        onSuspend={handleSuspend}
        isDeleting={isDeleting}
        isActivating={isActivating}
        isSuspending={isSuspending}
      />

      {/* Tabs with Tab Components */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="location">Lokasi & Kontak</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          {sppg.isDemoAccount && <TabsTrigger value="demo">Demo</TabsTrigger>}
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <SppgOverviewTab sppg={sppg} />
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <SppgProfileTab sppg={sppg} />
        </TabsContent>

        <TabsContent value="location" className="mt-6">
          <SppgLocationTab sppg={sppg} />
        </TabsContent>

        <TabsContent value="budget" className="mt-6">
          <SppgBudgetTab sppg={sppg} />
        </TabsContent>

        {sppg.isDemoAccount && (
          <TabsContent value="demo" className="mt-6">
            <SppgDemoTab sppg={sppg} />
          </TabsContent>
        )}

        <TabsContent value="system" className="mt-6">
          <SppgSystemTab sppg={sppg} />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-lg">
            <div className="bg-background border rounded-lg shadow-lg p-6 space-y-4">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Konfirmasi Hapus</h2>
                <p className="text-sm text-muted-foreground">
                  Apakah Anda yakin ingin menghapus SPPG <strong>{sppg.name}</strong>?
                  Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteDialogOpen(false)}
                  className="px-4 py-2 border rounded-md hover:bg-accent"
                  disabled={isDeleting}
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    handleDelete()
                    setDeleteDialogOpen(false)
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
                >
                  {isDeleting ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}