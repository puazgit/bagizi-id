/**
 * @fileoverview All Deliveries List Component - Cross-Schedule View
 * @version Next.js 15.5.4 / shadcn/ui / TanStack Table
 * @author Bagizi-ID Development Team
 * @see {@link /docs/DISTRIBUTION_WORKFLOW_COMPLETE.md} Complete Workflow
 * 
 * @description
 * Displays ALL deliveries across all schedules with:
 * - Real-time status tracking
 * - Multi-filter support (status, driver, date range)
 * - Search by target/driver name
 * - Statistics summary
 * - Quick actions (view, track, complete)
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, MapPin, Eye, Navigation, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useAllDeliveries } from '../hooks'

// ============================================================================
// Types
// ============================================================================

import type { DeliveryListItem } from '../types'

// ============================================================================
// Status Configuration
// ============================================================================

const STATUS_CONFIG = {
  ASSIGNED: {
    variant: 'secondary' as const,
    label: 'Ditugaskan',
    icon: Clock,
  },
  DEPARTED: {
    variant: 'default' as const,
    label: 'Dalam Perjalanan',
    icon: Navigation,
  },
  DELIVERED: {
    variant: 'outline' as const,
    label: 'Terkirim',
    icon: CheckCircle2,
  },
  FAILED: {
    variant: 'destructive' as const,
    label: 'Gagal',
    icon: AlertCircle,
  },
}

// ============================================================================
// Status Badge Component
// ============================================================================

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || {
    variant: 'secondary',
    label: status,
    icon: Clock,
  }
  
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className="font-medium gap-1.5">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function AllDeliveriesList() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [driverFilter, setDriverFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch deliveries
  const {
    data: response,
    isLoading,
    error,
  } = useAllDeliveries(
    {
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      driverName: driverFilter || undefined,
      search: searchQuery || undefined,
    },
    {
      page: 1,
      limit: 100, // Show all deliveries for cross-schedule view
      sortField: 'plannedTime',
      sortDirection: 'asc',
    }
  )

  const deliveries = response?.data || []
  const pagination = response?.pagination
  const statistics = response?.statistics

  /**
   * Handle view detail
   */
  const handleView = (id: string) => {
    router.push(`/distribution/delivery/${id}`)
  }

  /**
   * Handle live tracking
   */
  const handleTrack = (id: string) => {
    router.push(`/distribution/delivery/${id}/track`)
  }

  /**
   * Handle complete delivery
   */
  const handleComplete = (id: string) => {
    router.push(`/distribution/delivery/${id}/complete`)
  }

  /**
   * Table columns definition
   */
  const columns: ColumnDef<DeliveryListItem>[] = [
    {
      accessorKey: 'plannedTime',
      header: 'Waktu',
      cell: ({ row }) => {
        const plannedValue = row.getValue('plannedTime')
        if (!plannedValue) {
          return <span className="text-sm text-muted-foreground">-</span>
        }
        
        const planned = new Date(plannedValue as string)
        // Validate date
        if (isNaN(planned.getTime())) {
          return <span className="text-sm text-muted-foreground">Invalid date</span>
        }
        
        const arrival = row.original.arrivalTime
        const arrivalDate = arrival ? new Date(arrival) : null
        const isLate = arrivalDate && !isNaN(arrivalDate.getTime()) && arrivalDate > planned
        
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm">{format(planned, 'HH:mm', { locale: localeId })}</span>
            </div>
            {arrivalDate && !isNaN(arrivalDate.getTime()) && (
              <div className={`text-xs ${isLate ? 'text-destructive' : 'text-muted-foreground'}`}>
                Tiba: {format(arrivalDate, 'HH:mm', { locale: localeId })}
                {isLate && ' (Terlambat)'}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'targetName',
      header: 'Tujuan',
      cell: ({ row }) => (
        <div className="max-w-[250px]">
          <div className="font-medium truncate">{row.getValue('targetName')}</div>
          <div className="text-sm text-muted-foreground truncate">
            {row.original.targetAddress}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {row.original.schedule.menuName}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'portionsPlanned',
      header: 'Porsi',
      cell: ({ row }) => (
        <div className="text-center">
          <div className="font-medium">{row.original.portionsDelivered || 0}</div>
          <div className="text-xs text-muted-foreground">
            dari {row.getValue('portionsPlanned')}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'driverName',
      header: 'Driver',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('driverName')}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const issuesCount = row.original._count?.issues || 0
        
        return (
          <div className="flex flex-col gap-1">
            <StatusBadge status={status} />
            {issuesCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                {issuesCount} Kendala
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const delivery = row.original

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
              <DropdownMenuItem onClick={() => handleView(delivery.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>
              {(delivery.status === 'DEPARTED' || delivery.status === 'ASSIGNED') && (
                <DropdownMenuItem onClick={() => handleTrack(delivery.id)}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Lacak Lokasi
                </DropdownMenuItem>
              )}
              {delivery.status === 'DEPARTED' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleComplete(delivery.id)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Tandai Selesai
                  </DropdownMenuItem>
                </>
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
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Memuat data pengiriman...</div>
      </div>
    )
  }

  /**
   * Handle error state
   */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="text-destructive mb-2">Gagal memuat data</div>
        <div className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'Terjadi kesalahan'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Summary */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics?.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Ditugaskan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary-foreground">
                {((statistics?.byStatus as Record<string, number> | undefined)?.['ASSIGNED']) || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Dalam Perjalanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {((statistics?.byStatus as Record<string, number> | undefined)?.['DEPARTED']) || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Terkirim</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {((statistics?.byStatus as Record<string, number> | undefined)?.['DELIVERED']) || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Gagal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {((statistics?.byStatus as Record<string, number> | undefined)?.['FAILED']) || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Pengiriman</CardTitle>
          <CardDescription>
            Filter berdasarkan status, driver, atau cari tujuan pengiriman
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem value="ASSIGNED">Ditugaskan</SelectItem>
                  <SelectItem value="DEPARTED">Dalam Perjalanan</SelectItem>
                  <SelectItem value="DELIVERED">Terkirim</SelectItem>
                  <SelectItem value="FAILED">Gagal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Driver Filter */}
            <div className="space-y-2">
              <Label htmlFor="driver-filter">Driver</Label>
              <Input
                id="driver-filter"
                placeholder="Nama driver..."
                value={driverFilter}
                onChange={(e) => setDriverFilter(e.target.value)}
              />
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Cari</Label>
              <Input
                id="search"
                placeholder="Cari tujuan atau alamat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={deliveries}
        searchKey="targetName"
        searchPlaceholder="Cari tujuan pengiriman..."
      />

      {/* Pagination Info */}
      {pagination && (
        <div className="text-sm text-muted-foreground text-center">
          Menampilkan {deliveries.length} dari {pagination.total} pengiriman
          {pagination.totalPages > 1 && ` (Halaman ${pagination.page} dari ${pagination.totalPages})`}
        </div>
      )}
    </div>
  )
}
