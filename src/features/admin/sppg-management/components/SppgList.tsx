/**
 * SPPG List Component
 * Displays list of SPPG with grid/list view toggle and pagination
 * 
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { SppgCard } from './SppgCard'
import { useSppgs, useDeleteSppg, useActivateSppg, useSuspendSppg } from '../hooks'
import { type SppgFilters } from '../types'
import { Grid3x3, List, AlertCircle, Plus, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface SppgListProps {
  filters: SppgFilters
  onFiltersChange?: (filters: SppgFilters) => void
}

type ViewMode = 'grid' | 'list'

export function SppgList({ filters, onFiltersChange }: SppgListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [selectedSppgId, setSelectedSppgId] = useState<string | null>(null)

  const { data, isLoading, error } = useSppgs(filters)
  const { mutate: deleteSppg, isPending: isDeleting } = useDeleteSppg()
  const { mutate: activateSppg } = useActivateSppg()
  const { mutate: suspendSppg, isPending: isSuspending } = useSuspendSppg()

  // Debug logging
  console.log('🔍 SppgList Debug:', {
    isLoading,
    hasError: !!error,
    errorMessage: error?.message,
    hasData: !!data,
    dataStructure: data ? Object.keys(data) : null,
    filters
  })

  // Handlers
  const handleView = (id: string) => {
    window.location.href = `/admin/sppg/${id}`
  }

  const handleEdit = (id: string) => {
    window.location.href = `/admin/sppg/${id}/edit`
  }

  const handleActivate = (id: string) => {
    activateSppg(id)
  }

  const handleSuspendClick = (id: string) => {
    setSelectedSppgId(id)
    setSuspendDialogOpen(true)
  }

  const handleSuspendConfirm = () => {
    if (selectedSppgId) {
      suspendSppg({
        id: selectedSppgId,
        reason: 'Suspended by admin - Manual suspension from admin dashboard'
      })
      setSuspendDialogOpen(false)
      setSelectedSppgId(null)
    }
  }

  const handleDeleteClick = (id: string) => {
    setSelectedSppgId(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (selectedSppgId) {
      deleteSppg(selectedSppgId)
      setDeleteDialogOpen(false)
      setSelectedSppgId(null)
    }
  }

  const handlePageChange = (page: number) => {
    if (onFiltersChange) {
      onFiltersChange({ ...filters, page })
    }
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Gagal Memuat Data</h3>
        <p className="text-muted-foreground mb-2">
          Terjadi kesalahan saat memuat data SPPG
        </p>
        <p className="text-sm text-destructive mb-4 max-w-md">
          Error: {error.message}
        </p>
        <Button onClick={() => window.location.reload()}>
          Muat Ulang
        </Button>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        <div className={cn(
          'grid gap-4',
          viewMode === 'grid' 
            ? 'md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        )}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border rounded-lg p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Empty state
  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Belum Ada SPPG</h3>
        <p className="text-muted-foreground mb-4">
          {filters.search 
            ? 'Tidak ada SPPG yang sesuai dengan pencarian Anda' 
            : 'Mulai dengan menambahkan SPPG pertama'}
        </p>
        <Button asChild>
          <Link href="/admin/sppg/new">
            <Plus className="h-4 w-4 mr-2" />
            Tambah SPPG
          </Link>
        </Button>
      </div>
    )
  }

  // At this point, data and data.data are guaranteed to exist
  const sppgList = data.data
  const pagination = data.pagination

  return (
    <>
      <div className="space-y-4">
        {/* Header with view toggle */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan {sppgList.length} dari {pagination.total} SPPG
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* SPPG Grid/List */}
        <div className={cn(
          'grid gap-4',
          viewMode === 'grid' 
            ? 'md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        )}>
          {sppgList.map((sppg) => (
            <SppgCard
              key={sppg.id}
              sppg={sppg}
              onView={handleView}
              onEdit={handleEdit}
              onActivate={handleActivate}
              onSuspend={handleSuspendClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange((filters.page || 1) - 1)}
                    className={cn(
                      (filters.page || 1) <= 1 && 'pointer-events-none opacity-50'
                    )}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink isActive>
                    {filters.page || 1}
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange((filters.page || 1) + 1)}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Suspend Confirmation Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend SPPG?</AlertDialogTitle>
            <AlertDialogDescription>
              SPPG akan disuspend dan tidak dapat diakses sampai diaktifkan kembali.
              Aksi ini akan dicatat dalam audit log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSuspendConfirm}
              disabled={isSuspending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSuspending ? 'Memproses...' : 'Suspend'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus SPPG?</AlertDialogTitle>
            <AlertDialogDescription>
              SPPG akan dihapus secara permanen (status menjadi INACTIVE).
              Pastikan SPPG tidak memiliki data yang masih aktif.
              Aksi ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
