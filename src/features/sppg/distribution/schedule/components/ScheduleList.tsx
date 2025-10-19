/**
 * @fileoverview DistributionSchedule List Component with Enterprise DataTable
 * @version Next.js 15.5.4 / shadcn/ui / TanStack Table
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Edit, Trash2, Eye, Calendar, Truck, Users } from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/ui/data-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useSchedules, useDeleteSchedule } from '../hooks'
import { ScheduleStatus, DistributionWave } from '../types'

import type { ScheduleListItem } from '../types'

/**
 * Status badge variant mapping
 */
const statusVariants: Record<
  ScheduleStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PLANNED: 'outline',
  PREPARED: 'secondary',
  IN_PROGRESS: 'default',
  COMPLETED: 'default',
  CANCELLED: 'destructive',
  DELAYED: 'destructive',
}

/**
 * Status display labels in Indonesian
 */
const statusLabels: Record<ScheduleStatus, string> = {
  PLANNED: 'Direncanakan',
  PREPARED: 'Disiapkan',
  IN_PROGRESS: 'Berlangsung',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
  DELAYED: 'Tertunda',
}

/**
 * Wave display labels
 */
const waveLabels: Record<DistributionWave, string> = {
  MORNING: 'Pagi',
  MIDDAY: 'Siang',
}

interface ScheduleListProps {
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onView?: (id: string) => void
}

/**
 * ScheduleList Component
 * Enterprise-grade data table for distribution schedules
 */
export function ScheduleList({ onEdit, onDelete, onView }: ScheduleListProps) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<ScheduleStatus | 'ALL'>('ALL')
  const [waveFilter, setWaveFilter] = useState<DistributionWave | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch schedules with filters
  const {
    data: response,
    isLoading,
    error,
  } = useSchedules({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    wave: waveFilter === 'ALL' ? undefined : waveFilter,
    search: searchQuery || undefined,
  })

  // Extract data from API response
  const schedules = response?.data || []

  const { mutate: deleteSchedule, isPending: isDeleting } = useDeleteSchedule()

  /**
   * Handle delete action
   */
  const handleDelete = (schedule: ScheduleListItem) => {
    if (
      window.confirm(
        `Hapus jadwal distribusi "${schedule.menuName}" pada ${format(
          new Date(schedule.distributionDate),
          'dd MMMM yyyy',
          { locale: localeId }
        )}?`
      )
    ) {
      deleteSchedule(schedule.id, {
        onSuccess: () => {
          onDelete?.(schedule.id)
        },
      })
    }
  }

  /**
   * Handle view detail
   */
  const handleView = (id: string) => {
    if (onView) {
      onView(id)
    } else {
      router.push(`/distribution/schedule/${id}`)
    }
  }

  /**
   * Handle edit
   */
  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id)
    } else {
      router.push(`/distribution/schedule/${id}/edit`)
    }
  }

  /**
   * Table columns definition
   */
  const columns: ColumnDef<ScheduleListItem>[] = [
    {
      accessorKey: 'distributionDate',
      header: 'Tanggal',
      cell: ({ row }) => {
        const date = new Date(row.getValue('distributionDate'))
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">
                {format(date, 'dd MMM yyyy', { locale: localeId })}
              </div>
              <div className="text-sm text-muted-foreground">
                {waveLabels[row.original.wave as DistributionWave]}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'menuName',
      header: 'Menu',
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <div className="font-medium truncate">{row.getValue('menuName')}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.totalPortions} porsi
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'estimatedBeneficiaries',
      header: 'Penerima',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue('estimatedBeneficiaries')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'deliveryMethod',
      header: 'Metode',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.getValue('deliveryMethod')}
        </Badge>
      ),
    },
    {
      accessorKey: 'vehicleCount',
      header: 'Kendaraan',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <span>{row.getValue('vehicleCount') || 0}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as ScheduleStatus
        return (
          <Badge variant={statusVariants[status]}>
            {statusLabels[status]}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const schedule = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleView(schedule.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>
              {schedule.status !== 'COMPLETED' && schedule.status !== 'CANCELLED' && (
                <DropdownMenuItem onClick={() => handleEdit(schedule.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Jadwal
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {schedule.status === 'PLANNED' && (
                <DropdownMenuItem
                  onClick={() => handleDelete(schedule)}
                  className="text-destructive focus:text-destructive"
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Jadwal
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  /**
   * Handle loading state
   */
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Jadwal Distribusi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Memuat data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  /**
   * Handle error state
   */
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Jadwal Distribusi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-destructive mb-2">Gagal memuat data</div>
            <div className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Terjadi kesalahan'}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jadwal Distribusi</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as ScheduleStatus | 'ALL')}
            >
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="PLANNED">Direncanakan</SelectItem>
                <SelectItem value="PREPARED">Disiapkan</SelectItem>
                <SelectItem value="IN_PROGRESS">Berlangsung</SelectItem>
                <SelectItem value="COMPLETED">Selesai</SelectItem>
                <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                <SelectItem value="DELAYED">Tertunda</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Wave Filter */}
          <div className="space-y-2">
            <Label htmlFor="wave-filter">Gelombang</Label>
            <Select
              value={waveFilter}
              onValueChange={(value) => setWaveFilter(value as DistributionWave | 'ALL')}
            >
              <SelectTrigger id="wave-filter">
                <SelectValue placeholder="Semua Gelombang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Gelombang</SelectItem>
                <SelectItem value="MORNING">Pagi</SelectItem>
                <SelectItem value="MIDDAY">Siang</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Cari</Label>
            <Input
              id="search"
              placeholder="Cari menu atau metode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={schedules || []}
          searchKey="menuName"
          searchPlaceholder="Cari menu..."
        />
      </CardContent>
    </Card>
  )
}
