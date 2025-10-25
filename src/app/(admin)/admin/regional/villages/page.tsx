/**
 * @fileoverview Villages Management Page
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  RegionalStatistics,
  RegionalFilters,
  RegionalTable,
  RegionalForm,
  RegionalNav,
} from '@/features/admin/regional-data/components'
import {
  useVillages,
  useCreateVillage,
  useUpdateVillage,
  useVillage,
  useDeleteVillage,
} from '@/features/admin/regional-data/hooks'
import type {
  RegionalFilters as RegionalFiltersType,
  CreateVillageInput,
  UpdateVillageInput,
} from '@/features/admin/regional-data/types'

/**
 * Villages Management Page
 * 
 * List, create, and manage villages (desa/kelurahan)
 */
export default function VillagesPage() {
  // State
  const [filters, setFilters] = useState<RegionalFiltersType>({
    search: '',
    sortBy: 'code',
    sortOrder: 'asc',
    page: 1,
    limit: 20,
  })
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedVillageId, setSelectedVillageId] = useState<string | null>(null)

  // Queries
  const { data: villagesData, isLoading } = useVillages(filters)
  const { data: selectedVillage, isLoading: isLoadingVillage } = useVillage(
    selectedVillageId || '', 
    !!selectedVillageId && editDialogOpen
  )
  const { mutate: createVillage, isPending: isCreating } = useCreateVillage()
  const { mutate: updateVillage, isPending: isUpdating } = useUpdateVillage()
  const { mutate: deleteVillage, isPending: isDeleting } = useDeleteVillage()

  // Debug: Log selected village data
  useEffect(() => {
    if (editDialogOpen && selectedVillageId) {
      console.log('[VillagesPage] Edit dialog opened', {
        selectedVillageId,
        selectedVillage,
        isLoadingVillage
      })
    }
  }, [editDialogOpen, selectedVillageId, selectedVillage, isLoadingVillage])

  // Handlers
  const handleCreate = (data: CreateVillageInput) => {
    createVillage(data, {
      onSuccess: () => {
        setCreateDialogOpen(false)
        toast.success('Desa/Kelurahan berhasil ditambahkan')
      },
    })
  }

  const handleUpdate = (data: UpdateVillageInput) => {
    if (!selectedVillageId) return

    updateVillage(
      { id: selectedVillageId, data },
      {
        onSuccess: () => {
          setEditDialogOpen(false)
          setSelectedVillageId(null)
          toast.success('Desa/Kelurahan berhasil diperbarui')
        },
      }
    )
  }

  const handleFormSubmit = async (data: unknown) => {
    if (editDialogOpen) {
      handleUpdate(data as UpdateVillageInput)
    } else {
      handleCreate(data as CreateVillageInput)
    }
  }

  const handleEdit = (id: string) => {
    setSelectedVillageId(id)
    setEditDialogOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setSelectedVillageId(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!selectedVillageId) return

    deleteVillage(selectedVillageId, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setSelectedVillageId(null)
        toast.success('Desa/Kelurahan berhasil dihapus')
      },
      onError: (error) => {
        toast.error(error.message || 'Gagal menghapus desa/kelurahan')
      },
    })
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  return (
    <div className="space-y-6">
      {/* Regional Navigation */}
      <RegionalNav />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Desa/Kelurahan</h1>
          <p className="text-muted-foreground">
            Kelola data desa dan kelurahan di seluruh Indonesia
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Desa/Kelurahan
        </Button>
      </div>

      {/* Statistics */}
      <RegionalStatistics showTrends />

      {/* Filters */}
      <RegionalFilters
        filters={filters}
        onChange={setFilters}
        level="village"
      />

      {/* Table */}
      <RegionalTable
        level="village"
        data={villagesData}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onPageChange={handlePageChange}
        showCounts={false}
      />

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Desa/Kelurahan Baru</DialogTitle>
            <DialogDescription>
              Tambahkan data desa atau kelurahan baru ke dalam sistem
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <RegionalForm
              level="village"
              mode="create"
              onSubmit={handleFormSubmit}
              onCancel={() => setCreateDialogOpen(false)}
              isLoading={isCreating}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Desa/Kelurahan</DialogTitle>
            <DialogDescription>
              Perbarui data desa/kelurahan yang sudah ada
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {isLoadingVillage ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Memuat data...</span>
              </div>
            ) : selectedVillage ? (
              <RegionalForm
                key={selectedVillage.id} // Force re-mount when different village
                level="village"
                mode="edit"
                initialData={selectedVillage}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setEditDialogOpen(false)
                  setSelectedVillageId(null)
                }}
                isLoading={isUpdating}
              />
            ) : (
              <div className="text-center py-8 text-destructive">
                Data desa/kelurahan tidak ditemukan
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Hapus Desa/Kelurahan?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus desa/kelurahan ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Batal
            </AlertDialogCancel>
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
    </div>
  )
}
