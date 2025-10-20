/**
 * @fileoverview School List Component with Data Table
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState } from 'react'
import { useSchools, useDeleteSchool } from '../hooks'
import type { SchoolMaster } from '../types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { 
  School, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Plus,
  Search
} from 'lucide-react'
import { SCHOOL_TYPES } from '../types'
import { cn } from '@/lib/utils'

interface SchoolListProps {
  programId?: string
  onEdit?: (id: string) => void
  onView?: (id: string) => void
  onCreate?: () => void
}

/**
 * School List Component
 * 
 * Features:
 * - Data table with sorting and filtering
 * - Search functionality
 * - Filter by type, status, program
 * - CRUD operations (view, edit, delete)
 * - Dark mode support
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <SchoolList
 *   programId="prog_123"
 *   onEdit={(id) => router.push(`/school/${id}/edit`)}
 *   onView={(id) => router.push(`/school/${id}`)}
 *   onCreate={() => router.push('/school/new')}
 * />
 * ```
 */
export function SchoolList({ 
  programId, 
  onEdit, 
  onView, 
  onCreate 
}: SchoolListProps) {
  const [search, setSearch] = useState('')
  const [schoolType, setSchoolType] = useState<string>('all')
  const [isActive, setIsActive] = useState<string>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Fetch schools with filters
  const { data: schools, isLoading, error } = useSchools({
    mode: 'standard',
    programId,
    isActive: isActive === 'all' ? undefined : isActive === 'active',
    schoolType: schoolType === 'all' ? undefined : schoolType,
    search: search || undefined,
  })

  const deleteSchool = useDeleteSchool()

  const handleDelete = async () => {
    if (deleteId) {
      await deleteSchool.mutateAsync(deleteId)
      setDeleteId(null)
    }
  }

  // Filter schools client-side for search (if API doesn't handle it)
  const filteredSchools = schools?.filter(school => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      school.schoolName.toLowerCase().includes(searchLower) ||
      school.schoolCode?.toLowerCase().includes(searchLower) ||
      school.schoolAddress?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5 text-primary" />
              Daftar Sekolah Mitra
            </CardTitle>
            <CardDescription>
              Kelola data sekolah penerima manfaat program gizi
            </CardDescription>
          </div>
          {onCreate && (
            <Button onClick={onCreate} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Sekolah
            </Button>
          )}
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama sekolah, kode, atau alamat..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* School Type Filter */}
            <Select value={schoolType} onValueChange={setSchoolType}>
              <SelectTrigger>
                <SelectValue placeholder="Jenis Sekolah" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                {SCHOOL_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={isActive} onValueChange={setIsActive}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Schools List */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">Error: {error.message}</p>
            </div>
          ) : !filteredSchools?.length ? (
            <div className="text-center py-12">
              <School className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                {search ? 'Tidak ada sekolah yang sesuai dengan pencarian' : 'Belum ada data sekolah'}
              </p>
              {onCreate && !search && (
                <Button onClick={onCreate} className="mt-4" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Sekolah Pertama
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSchools.map(school => (
                <SchoolListItem
                  key={school.id}
                  school={school}
                  onEdit={onEdit}
                  onView={onView}
                  onDelete={(id) => setDeleteId(id)}
                />
              ))}
            </div>
          )}

          {filteredSchools && filteredSchools.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Menampilkan {filteredSchools.length} dari {schools?.length || 0} sekolah
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Sekolah?</AlertDialogTitle>
            <AlertDialogDescription>
              Data sekolah akan dinonaktifkan. Anda dapat mengaktifkannya kembali nanti.
              Tindakan ini tidak akan menghapus data historis.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteSchool.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSchool.isPending ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/**
 * School List Item Component
 * Individual school card in the list
 */
interface SchoolListItemProps {
  school: SchoolMaster
  onEdit?: (id: string) => void
  onView?: (id: string) => void
  onDelete?: (id: string) => void
}

function SchoolListItem({ school, onEdit, onView, onDelete }: SchoolListItemProps) {
  const schoolTypeLabel = SCHOOL_TYPES.find(t => t.value === school.schoolType)?.label || school.schoolType

  return (
    <div className={cn(
      'flex items-start justify-between p-4 rounded-lg border',
      'bg-card hover:bg-accent/50 transition-colors',
      !school.isActive && 'opacity-60'
    )}>
      <div className="flex-1 space-y-2">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">
                {school.schoolName}
              </h3>
              {!school.isActive && (
                <Badge variant="secondary">Tidak Aktif</Badge>
              )}
            </div>
            {school.schoolCode && (
              <p className="text-sm text-muted-foreground">
                Kode: {school.schoolCode}
              </p>
            )}
          </div>
          <Badge variant="outline">{schoolTypeLabel}</Badge>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total Siswa</span>
            <p className="font-medium">{school.totalStudents}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Target Penerima</span>
            <p className="font-medium">{school.targetStudents}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Status</span>
            <p className="font-medium">{school.schoolStatus}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Metode Penyajian</span>
            <p className="font-medium">{school.servingMethod}</p>
          </div>
        </div>

        {/* Address */}
        {school.schoolAddress && (
          <p className="text-sm text-muted-foreground">
            📍 {school.schoolAddress}
          </p>
        )}
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="ml-4">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          {onView && (
            <DropdownMenuItem onClick={() => onView(school.id)}>
              <Eye className="mr-2 h-4 w-4" />
              Lihat Detail
            </DropdownMenuItem>
          )}
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(school.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Data
            </DropdownMenuItem>
          )}
          {onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(school.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
