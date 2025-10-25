/**
 * @fileoverview Regencies Management Page
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
  useRegencies,
  useCreateRegency,
  useUpdateRegency,
  useRegency,
  useDeleteRegency,
} from '@/features/admin/regional-data/hooks'
import type {
  RegionalFilters as RegionalFiltersType,
  CreateRegencyInput,
  UpdateRegencyInput,
} from '@/features/admin/regional-data/types'

/**
 * Regencies Management Page
 * 
 * List, create, and manage regencies (kabupaten/kota)
 */
export default function RegenciesPage() {
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
  const [selectedRegencyId, setSelectedRegencyId] = useState<string | null>(null)

  // Queries
  const { data: regenciesData, isLoading } = useRegencies(filters)
  const { data: selectedRegency, isLoading: isLoadingRegency } = useRegency(
    selectedRegencyId || '', 
    !!selectedRegencyId && editDialogOpen
  )
  const { mutate: createRegency, isPending: isCreating } = useCreateRegency()
  const { mutate: updateRegency, isPending: isUpdating } = useUpdateRegency()
  const { mutate: deleteRegency, isPending: isDeleting } = useDeleteRegency()

  // Debug: Log selected regency data
  useEffect(() => {
    if (editDialogOpen && selectedRegencyId) {
      console.log('[RegenciesPage] Edit dialog opened', {
        selectedRegencyId,
        selectedRegency,
        isLoadingRegency
      })
    }
  }, [editDialogOpen, selectedRegencyId, selectedRegency, isLoadingRegency])

  // Handlers
  const handleCreate = (data: CreateRegencyInput) => {
    createRegency(data, {
      onSuccess: () => {
        setCreateDialogOpen(false)
        toast.success('Kabupaten/Kota berhasil ditambahkan')
      },
    })
  }

  const handleUpdate = (data: UpdateRegencyInput) => {
    if (!selectedRegencyId) return
    
    updateRegency({ id: selectedRegencyId, data }, {
      onSuccess: () => {
        setEditDialogOpen(false)
        setSelectedRegencyId(null)
        toast.success('Kabupaten/Kota berhasil diperbarui')
      },
    })
  }

  const handleFormSubmit = async (data: unknown) => {
    if (editDialogOpen) {
      handleUpdate(data as UpdateRegencyInput)
    } else {
      handleCreate(data as CreateRegencyInput)
    }
  }

  const handleEdit = (id: string) => {
    setSelectedRegencyId(id)
    setEditDialogOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setSelectedRegencyId(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!selectedRegencyId) return

    deleteRegency(selectedRegencyId, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setSelectedRegencyId(null)
        toast.success('Kabupaten/Kota berhasil dihapus')
      },
      onError: (error) => {
        toast.error(error.message || 'Gagal menghapus kabupaten/kota')
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
          <h1 className="text-3xl font-bold tracking-tight">Kabupaten/Kota</h1>
          <p className="text-muted-foreground">
            Kelola data kabupaten dan kota di seluruh Indonesia
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kabupaten/Kota
        </Button>
      </div>

      {/* Statistics */}
      <RegionalStatistics showTrends />

      {/* Filters */}
      <RegionalFilters
        filters={filters}
        onChange={setFilters}
        level="regency"
      />

      {/* Table */}
      <RegionalTable
        level="regency"
        data={regenciesData}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onPageChange={handlePageChange}
      />

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Kabupaten/Kota Baru</DialogTitle>
            <DialogDescription>
              Tambahkan data kabupaten atau kota baru ke dalam sistem
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <RegionalForm
              level="regency"
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
            <DialogTitle>Edit Kabupaten/Kota</DialogTitle>
            <DialogDescription>
              Perbarui data kabupaten atau kota yang sudah ada
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {isLoadingRegency ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Memuat data...</span>
              </div>
            ) : selectedRegency ? (
              <RegionalForm
                key={selectedRegency.id} // Force re-mount when different regency
                level="regency"
                mode="edit"
                initialData={selectedRegency}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setEditDialogOpen(false)
                  setSelectedRegencyId(null)
                }}
                isLoading={isUpdating}
              />
            ) : (
              <div className="text-center py-8 text-destructive">
                Data kabupaten/kota tidak ditemukan
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
              Hapus Kabupaten/Kota?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kabupaten/kota ini? Tindakan ini tidak dapat dibatalkan.
              Semua kecamatan dan desa di bawahnya juga akan terhapus.
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
