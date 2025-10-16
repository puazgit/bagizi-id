/**
 * @fileoverview Menu Plan List Component with Filters
 * @version Next.js 15.5.4 / shadcn/ui / TanStack Query
 * @see {@link /docs/copilot-instructions.md} Component patterns
 */

'use client'

import { type FC, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Search, Filter, AlertCircle } from 'lucide-react'
import { MenuPlanCard } from './MenuPlanCard'
import { useMenuPlans, useDeleteMenuPlan, useSubmitMenuPlan, usePublishMenuPlan } from '../hooks/useMenuPlans'
import { MenuPlanStatus } from '@prisma/client'
import { cn } from '@/lib/utils'
import type { MenuPlanWithRelations } from '../types'

interface MenuPlanListProps {
  programId?: string
  className?: string
}

export const MenuPlanList: FC<MenuPlanListProps> = ({ programId, className }) => {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<MenuPlanStatus | 'ALL'>('ALL')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<{ id: string; name: string } | null>(null)

  // Build filters
  const filters = {
    ...(programId && { programId }),
    ...(statusFilter !== 'ALL' && { status: statusFilter }),
    ...(search && { search })
  }

  // Fetch menu plans
  const { data: response, isLoading, error } = useMenuPlans(filters)
  const plans = response?.plans || []
  const summary = response?.summary

  // Mutations
  const { mutate: deletePlan, isPending: isDeleting } = useDeleteMenuPlan()
  const { mutate: submitPlan, isPending: isSubmitting } = useSubmitMenuPlan()
  const { mutate: publishPlan, isPending: isPublishing } = usePublishMenuPlan()

  // Handlers
  const handleEdit = (id: string) => {
    router.push(`/menu-planning/${id}/edit`)
  }

  const handleDelete = (id: string, name: string) => {
    setPlanToDelete({ id, name })
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (planToDelete) {
      deletePlan(planToDelete.id)
    }
    setShowDeleteDialog(false)
    setPlanToDelete(null)
  }

  const handleSubmit = (id: string) => {
    if (confirm('Kirim rencana ini untuk direview? Anda tidak akan dapat mengeditnya setelahnya.')) {
      submitPlan({ planId: id, data: { submitNotes: 'Submitted from plan list' } })
    }
  }

  const handlePublish = (id: string) => {
    if (confirm('Publikasikan rencana ini? Rencana akan menjadi aktif dan terlihat oleh semua pengguna.')) {
      publishPlan({ planId: id, data: { publishNotes: 'Published from plan list' } })
    }
  }

  const handleCreateNew = () => {
    router.push('/menu-planning/create')
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Menu Planning</CardTitle>
              <CardDescription>
                Manage your menu plans and assignments
              </CardDescription>
            </div>
            <Button onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Plan
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search menu plans..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as MenuPlanStatus | 'ALL')}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter berdasarkan status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="DRAFT">Draf</SelectItem>
                <SelectItem value="PENDING_REVIEW">Menunggu Review</SelectItem>
                <SelectItem value="REVIEWED">Telah Direview</SelectItem>
                <SelectItem value="PENDING_APPROVAL">Menunggu Persetujuan</SelectItem>
                <SelectItem value="APPROVED">Disetujui</SelectItem>
                <SelectItem value="PUBLISHED">Dipublikasikan</SelectItem>
                <SelectItem value="ACTIVE">Aktif</SelectItem>
                <SelectItem value="COMPLETED">Selesai</SelectItem>
                <SelectItem value="ARCHIVED">Diarsipkan</SelectItem>
                <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary Stats */}
          {summary && summary.byStatus && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <StatCard label="Total" value={summary.totalPlans || 0} />
              <StatCard label="Draf" value={summary.byStatus.draft || 0} variant="gray" />
              <StatCard label="Terkirim" value={summary.byStatus.submitted || 0} variant="yellow" />
              <StatCard label="Disetujui" value={summary.byStatus.approved || 0} variant="green" />
              <StatCard label="Dipublikasi" value={summary.byStatus.published || 0} variant="purple" />
              <StatCard label="Diarsipkan" value={summary.byStatus.archived || 0} variant="gray" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Gagal memuat rencana menu. {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!isLoading && !error && plans.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-muted p-3">
                <Filter className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Tidak ada rencana menu</h3>
                <p className="text-muted-foreground mt-1">
                  {search || statusFilter !== 'ALL'
                    ? 'Coba sesuaikan filter Anda'
                    : 'Buat rencana menu pertama Anda untuk memulai'}
                </p>
              </div>
              {!search && statusFilter === 'ALL' && (
                <Button onClick={handleCreateNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Rencana Menu
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans Grid */}
      {!isLoading && !error && plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan: MenuPlanWithRelations) => (
            <MenuPlanCard
              key={plan.id}
              plan={plan}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSubmit={handleSubmit}
              onPublish={handlePublish}
            />
          ))}
        </div>
      )}

      {/* Loading Overlay for Mutations */}
      {(isDeleting || isSubmitting || isPublishing) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-full max-w-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                <div>
                  <p className="font-medium">Processing...</p>
                  <p className="text-sm text-muted-foreground">
                    {isDeleting && 'Deleting menu plan...'}
                    {isSubmitting && 'Submitting for review...'}
                    {isPublishing && 'Publishing menu plan...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Rencana Menu?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus rencana menu &ldquo;{planToDelete?.name}&rdquo;? 
              Tindakan ini tidak dapat dibatalkan. Semua assignment dalam rencana ini juga akan dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/**
 * Stat Card Component
 */
interface StatCardProps {
  label: string
  value: number
  variant?: 'default' | 'gray' | 'yellow' | 'green' | 'purple'
}

const StatCard: FC<StatCardProps> = ({ label, value, variant = 'default' }) => {
  const variantClasses = {
    default: 'bg-background',
    gray: 'bg-gray-50 dark:bg-gray-900/30',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/30',
    green: 'bg-green-50 dark:bg-green-900/30',
    purple: 'bg-purple-50 dark:bg-purple-900/30'
  }

  return (
    <div className={cn(
      'rounded-lg border p-3 transition-colors',
      variantClasses[variant]
    )}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}
