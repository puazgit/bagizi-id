/**
 * @fileoverview Districts Management Page
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
  useDistricts,
  useCreateDistrict,
  useUpdateDistrict,
  useDistrict,
  useDeleteDistrict,
} from '@/features/admin/regional-data/hooks'
import type {
  RegionalFilters as RegionalFiltersType,
  CreateDistrictInput,
  UpdateDistrictInput,
} from '@/features/admin/regional-data/types'

/**
 * Districts Management Page
 * 
 * List, create, and manage districts (kecamatan)
 */
export default function DistrictsPage() {
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
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null)

  // Queries
  const { data: districtsData, isLoading } = useDistricts(filters)
  const { data: selectedDistrict, isLoading: isLoadingDistrict } = useDistrict(
    selectedDistrictId || '', 
    !!selectedDistrictId && editDialogOpen
  )
  const { mutate: createDistrict, isPending: isCreating } = useCreateDistrict()
  const { mutate: updateDistrict, isPending: isUpdating } = useUpdateDistrict()
  const { mutate: deleteDistrict, isPending: isDeleting } = useDeleteDistrict()

  // Debug: Log selected district data
  useEffect(() => {
    if (editDialogOpen && selectedDistrictId) {
      console.log('[DistrictsPage] Edit dialog opened', {
        selectedDistrictId,
        selectedDistrict,
        isLoadingDistrict
      })
    }
  }, [editDialogOpen, selectedDistrictId, selectedDistrict, isLoadingDistrict])

  // Handlers
  const handleCreate = (data: CreateDistrictInput) => {
    createDistrict(data, {
      onSuccess: () => {
        setCreateDialogOpen(false)
        toast.success('Kecamatan berhasil ditambahkan')
      },
    })
  }

  const handleUpdate = (data: UpdateDistrictInput) => {
    if (!selectedDistrictId) return
    
    updateDistrict({ id: selectedDistrictId, data }, {
      onSuccess: () => {
        setEditDialogOpen(false)
        setSelectedDistrictId(null)
        toast.success('Kecamatan berhasil diperbarui')
      },
    })
  }

  const handleFormSubmit = async (data: unknown) => {
    if (editDialogOpen) {
      handleUpdate(data as UpdateDistrictInput)
    } else {
      handleCreate(data as CreateDistrictInput)
    }
  }

  const handleEdit = (id: string) => {
    setSelectedDistrictId(id)
    setEditDialogOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setSelectedDistrictId(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!selectedDistrictId) return

    deleteDistrict(selectedDistrictId, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setSelectedDistrictId(null)
        toast.success('Kecamatan berhasil dihapus')
      },
      onError: (error) => {
        toast.error(error.message || 'Gagal menghapus kecamatan')
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
          <h1 className="text-3xl font-bold tracking-tight">Kecamatan</h1>
          <p className="text-muted-foreground">
            Kelola data kecamatan di seluruh Indonesia
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kecamatan
        </Button>
      </div>

      {/* Statistics */}
      <RegionalStatistics showTrends />

      {/* Filters */}
      <RegionalFilters
        filters={filters}
        onChange={setFilters}
        level="district"
      />

      {/* Table */}
      <RegionalTable
        level="district"
        data={districtsData}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onPageChange={handlePageChange}
      />

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Kecamatan Baru</DialogTitle>
            <DialogDescription>
              Tambahkan data kecamatan baru ke dalam sistem
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <RegionalForm
              level="district"
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
            <DialogTitle>Edit Kecamatan</DialogTitle>
            <DialogDescription>
              Perbarui data kecamatan yang sudah ada
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {isLoadingDistrict ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Memuat data...</span>
              </div>
            ) : selectedDistrict ? (
              <>
                {/* Debug: Log data sebelum pass ke form */}
                {console.log('[DistrictsPage] Passing data to RegionalForm:', {
                  id: selectedDistrict.id,
                  code: selectedDistrict.code,
                  name: selectedDistrict.name,
                  regencyId: selectedDistrict.regencyId,
                  hasRegency: !!selectedDistrict.regency,
                  regencyProvinceId: selectedDistrict.regency?.provinceId,
                  fullData: selectedDistrict
                })}
                <RegionalForm
                  key={selectedDistrict.id} // Force re-mount when different district
                  level="district"
                  mode="edit"
                  initialData={selectedDistrict}
                  onSubmit={handleFormSubmit}
                  onCancel={() => {
                    setEditDialogOpen(false)
                    setSelectedDistrictId(null)
                  }}
                  isLoading={isUpdating}
                />
              </>
            ) : (
              <div className="text-center py-8 text-destructive">
                Data kecamatan tidak ditemukan
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
              Hapus Kecamatan?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kecamatan ini? Tindakan ini tidak dapat dibatalkan.
              Semua desa/kelurahan di bawahnya juga akan terhapus.
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
