/**
 * @fileoverview Provinces Management Page
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
  useProvinces,
  useCreateProvince,
  useUpdateProvince,
  useProvince,
  useDeleteProvince,
} from '@/features/admin/regional-data/hooks'
import type {
  RegionalFilters as RegionalFiltersType,
  CreateProvinceInput,
  UpdateProvinceInput,
} from '@/features/admin/regional-data/types'

/**
 * Provinces Management Page
 * 
 * List, create, and manage provinces
 */
export default function ProvincesPage() {
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
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(null)

  // Queries
  const { data: provincesData, isLoading } = useProvinces(filters)
  const { data: selectedProvince, isLoading: isLoadingProvince } = useProvince(
    selectedProvinceId || '', 
    !!selectedProvinceId && editDialogOpen
  )
  const { mutate: createProvince, isPending: isCreating } = useCreateProvince()
  const { mutate: updateProvince, isPending: isUpdating } = useUpdateProvince()
  const { mutate: deleteProvince, isPending: isDeleting } = useDeleteProvince()

  // Debug: Log selected province data
  useEffect(() => {
    if (editDialogOpen && selectedProvinceId) {
      console.log('[ProvincesPage] Edit dialog opened', {
        selectedProvinceId,
        selectedProvince,
        isLoadingProvince
      })
    }
  }, [editDialogOpen, selectedProvinceId, selectedProvince, isLoadingProvince])

  // Handlers
  const handleCreate = (data: CreateProvinceInput) => {
    createProvince(data, {
      onSuccess: () => {
        setCreateDialogOpen(false)
        toast.success('Provinsi berhasil ditambahkan')
      },
    })
  }

  const handleUpdate = (data: UpdateProvinceInput) => {
    if (!selectedProvinceId) return
    
    updateProvince({ id: selectedProvinceId, data }, {
      onSuccess: () => {
        setEditDialogOpen(false)
        setSelectedProvinceId(null)
        toast.success('Provinsi berhasil diperbarui')
      },
    })
  }

  const handleFormSubmit = async (data: unknown) => {
    if (editDialogOpen) {
      handleUpdate(data as UpdateProvinceInput)
    } else {
      handleCreate(data as CreateProvinceInput)
    }
  }

  const handleEdit = (id: string) => {
    setSelectedProvinceId(id)
    setEditDialogOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setSelectedProvinceId(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!selectedProvinceId) return

    deleteProvince(selectedProvinceId, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setSelectedProvinceId(null)
        toast.success('Provinsi berhasil dihapus')
      },
      onError: (error) => {
        toast.error(error.message || 'Gagal menghapus provinsi')
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
          <h1 className="text-3xl font-bold tracking-tight">Provinsi</h1>
          <p className="text-muted-foreground">
            Kelola data provinsi di seluruh Indonesia
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Provinsi
        </Button>
      </div>

      {/* Statistics */}
      <RegionalStatistics showTrends />

      {/* Filters */}
      <RegionalFilters
        filters={filters}
        onChange={setFilters}
        level="province"
        showCascade={false}
      />

      {/* Table */}
      <RegionalTable
        level="province"
        data={provincesData}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onPageChange={handlePageChange}
        showParent={false}
      />

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Provinsi Baru</DialogTitle>
            <DialogDescription>
              Tambahkan data provinsi baru ke dalam sistem
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <RegionalForm
              level="province"
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
            <DialogTitle>Edit Provinsi</DialogTitle>
            <DialogDescription>
              Perbarui data provinsi yang sudah ada
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {isLoadingProvince ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Memuat data...</span>
              </div>
            ) : selectedProvince ? (
              <RegionalForm
                key={selectedProvince.id} // Force re-mount when different province
                level="province"
                mode="edit"
                initialData={selectedProvince}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setEditDialogOpen(false)
                  setSelectedProvinceId(null)
                }}
                isLoading={isUpdating}
              />
            ) : (
              <div className="text-center py-8 text-destructive">
                Data provinsi tidak ditemukan
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
              Hapus Provinsi?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus provinsi ini? Tindakan ini tidak dapat dibatalkan.
              Semua kabupaten/kota, kecamatan, dan desa di bawah provinsi ini juga akan terhapus.
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
