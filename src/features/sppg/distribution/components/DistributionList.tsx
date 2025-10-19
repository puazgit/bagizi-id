/**
 * @fileoverview Distribution List Component
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * 
 * Enterprise-grade distribution list with DataTable, filters, and actions
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDistributions, useDeleteDistribution } from '@/features/sppg/distribution/hooks'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Plus, 
  Search, 
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Calendar,
  MapPin,
  Users,
  Package,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { safeFormatDate } from '../lib/dateUtils'

interface DistributionListProps {
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

export function DistributionList({ 
  canCreate = true,
  canEdit = true,
  canDelete = false,
}: DistributionListProps) {
  const router = useRouter()
  
  // Filters state
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'ALL' | 'SCHEDULED' | 'PREPARING' | 'IN_TRANSIT' | 'DISTRIBUTING' | 'COMPLETED' | 'CANCELLED'>('ALL')
  const [mealType, setMealType] = useState<'ALL' | 'BREAKFAST' | 'SNACK' | 'LUNCH' | 'DINNER'>('ALL')
  const [page, setPage] = useState(1)
  const [limit] = useState(20)

  // Fetch distributions with filters
  const { data, isLoading, error } = useDistributions({
    search,
    status: status === 'ALL' ? undefined : status,
    page,
    limit,
  })

  const { mutate: deleteDistribution, isPending: isDeleting } = useDeleteDistribution()

  const distributions = data?.distributions || []
  const total = data?.total || 0
  const totalPages = data?.totalPages || 1
  const summary = data?.summary

  const handleView = (id: string) => {
    router.push(`/distribution/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/distribution/${id}/edit`)
  }

  const handleDelete = (id: string, code: string) => {
    if (!confirm(`Delete distribution ${code}? This action cannot be undone.`)) {
      return
    }

    deleteDistribution(id, {
      onSuccess: () => {
        toast.success('Distribution deleted successfully')
      },
    })
  }

  const handleCreateNew = () => {
    router.push('/distribution/new')
  }

  // Meal type badge variant
  const getMealTypeVariant = (mealType: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      BREAKFAST: 'default',
      SNACK: 'secondary',
      LUNCH: 'default',
      DINNER: 'destructive',
    }
    return variants[mealType] || 'outline'
  }

  // Format meal type label
  const formatMealTypeLabel = (mealType: string) => {
    const labels: Record<string, string> = {
      BREAKFAST: 'Breakfast',
      SNACK: 'Snack',
      LUNCH: 'Lunch',
      DINNER: 'Dinner',
    }
    return labels[mealType] || mealType
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Distributions</CardTitle>
          <CardDescription>{error.message}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Distributions</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selesai</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.completed}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dijadwalkan</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.scheduled}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dalam Perjalanan</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.inTransit}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Manajemen Distribusi</CardTitle>
              <CardDescription>
                Kelola jadwal distribusi makanan dan lacak progres pengiriman
              </CardDescription>
            </div>
            {canCreate && (
              <Button onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                Distribusi Baru
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Gagal memuat data distribusi. Silakan coba lagi.
              </AlertDescription>
            </Alert>
          )}

          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari berdasarkan kode, lokasi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="SCHEDULED">Dijadwalkan</SelectItem>
                <SelectItem value="PREPARING">Persiapan</SelectItem>
                <SelectItem value="IN_TRANSIT">Dalam Perjalanan</SelectItem>
                <SelectItem value="DISTRIBUTING">Sedang Distribusi</SelectItem>
                <SelectItem value="COMPLETED">Selesai</SelectItem>
                <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>

            <Select value={mealType} onValueChange={(value) => setMealType(value as typeof mealType)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter jenis makanan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Jenis Makanan</SelectItem>
                <SelectItem value="BREAKFAST">Sarapan</SelectItem>
                <SelectItem value="SNACK">Snack</SelectItem>
                <SelectItem value="LUNCH">Makan Siang</SelectItem>
                <SelectItem value="DINNER">Makan Malam</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : distributions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Belum ada distribusi</p>
              {canCreate && (
                <Button onClick={handleCreateNew} variant="outline" className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Distribusi Pertama
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Lokasi</TableHead>
                      <TableHead>Jenis Makanan</TableHead>
                      <TableHead>Penerima</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {distributions.map((distribution) => (
                      <TableRow key={distribution.id}>
                        <TableCell className="font-medium">
                          {distribution.distributionCode}
                        </TableCell>
                        <TableCell>
                          {safeFormatDate(distribution.distributionDate)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            {distribution.program?.name || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                            {distribution.distributionPoint}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getMealTypeVariant(distribution.mealType)}>
                            {formatMealTypeLabel(distribution.mealType)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                            {distribution.actualRecipients || distribution.plannedRecipients || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            distribution.status === 'COMPLETED' ? 'default' :
                            distribution.status === 'CANCELLED' ? 'destructive' :
                            'secondary'
                          }>
                            {distribution.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">\
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleView(distribution.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Lihat Detail
                              </DropdownMenuItem>
                              {canEdit && ['SCHEDULED', 'PREPARING'].includes(distribution.status) && (
                                <DropdownMenuItem onClick={() => handleEdit(distribution.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {canDelete && distribution.status !== 'COMPLETED' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(distribution.id, distribution.distributionCode)}
                                    className="text-destructive focus:text-destructive"
                                    disabled={isDeleting}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hapus
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Menampilkan {((page - 1) * limit) + 1} sampai {Math.min(page * limit, total)} dari {total} distribusi
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Berikutnya
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
