/**
 * @fileoverview DeliveryList component with shadcn/ui DataTable
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * 
 * @description
 * Comprehensive delivery list with:
 * - Filters: status, driver, issues, quality, date range
 * - Sorting: time, status, portions
 * - Statistics summary
 * - Real-time updates
 */

'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, MapPin, AlertCircle, CheckCircle2, Clock, Package } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useDeliveries } from '@/features/sppg/distribution/delivery/hooks'
import type { DeliveryListItem } from '@/features/sppg/distribution/delivery/types'

// ============================================================================
// Types
// ============================================================================

interface DeliveryListProps {
  executionId: string
  onViewDetail?: (id: string) => void
  onTrackLive?: (id: string) => void
  onComplete?: (id: string) => void
}

// ============================================================================
// Status Badge Component
// ============================================================================

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    ASSIGNED: { variant: 'secondary', label: 'Ditugaskan' },
    DEPARTED: { variant: 'default', label: 'Dalam Perjalanan' },
    DELIVERED: { variant: 'outline', label: 'Terkirim' },
    FAILED: { variant: 'destructive', label: 'Gagal' },
  }

  const config = variants[status] || { variant: 'secondary', label: status }

  return (
    <Badge variant={config.variant} className="font-medium">
      {config.label}
    </Badge>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function DeliveryList({
  executionId,
  onViewDetail,
  onTrackLive,
  onComplete,
}: DeliveryListProps) {
  // Filters state
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [driverFilter, setDriverFilter] = useState<string>('')
  const [issuesFilter, setIssuesFilter] = useState<string>('all')
  const [qualityFilter, setQualityFilter] = useState<string>('all')

  // Build filters object
  const filters = {
    ...(statusFilter !== 'all' && { status: statusFilter }),
    ...(driverFilter && { driverName: driverFilter }),
    ...(issuesFilter === 'with-issues' && { hasIssues: true }),
    ...(issuesFilter === 'no-issues' && { hasIssues: false }),
    ...(qualityFilter === 'checked' && { qualityChecked: true }),
    ...(qualityFilter === 'unchecked' && { qualityChecked: false }),
  }

  // Fetch data
  const { data, isLoading, error } = useDeliveries(executionId, filters)

  // Define columns
  const columns: ColumnDef<DeliveryListItem>[] = [
    {
      accessorKey: 'targetName',
      header: 'Tujuan Pengiriman',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium">{row.getValue('targetName')}</span>
          <span className="text-xs text-muted-foreground line-clamp-1">
            {row.original.targetAddress}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'plannedTime',
      header: 'Waktu Rencana',
      cell: ({ row }) => {
        const date = row.getValue('plannedTime') as Date
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: localeId })}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    },
    {
      accessorKey: 'portionsDelivered',
      header: 'Porsi',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {row.getValue('portionsDelivered')} / {row.original.portionsPlanned}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'driverName',
      header: 'Driver',
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue('driverName')}</span>
      ),
    },
    {
      id: 'indicators',
      header: 'Indikator',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.foodQualityChecked && (
            <div title="Quality Checked">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
          )}
          {row.original._count && row.original._count.issues > 0 && (
            <div title={`${row.original._count.issues} Issues`}>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
          )}
          {row.original.currentLocation && (
            <div title="GPS Tracked">
              <MapPin className="h-4 w-4 text-blue-600" />
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
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
              <DropdownMenuItem onClick={() => onViewDetail?.(delivery.id)}>
                Lihat Detail
              </DropdownMenuItem>
              {delivery.status === 'DEPARTED' && (
                <>
                  <DropdownMenuItem onClick={() => onTrackLive?.(delivery.id)}>
                    <MapPin className="mr-2 h-4 w-4" />
                    Lacak Langsung
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onComplete?.(delivery.id)}>
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

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      {data?.statistics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Pengiriman</CardDescription>
              <CardTitle className="text-3xl">{data.statistics.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tepat Waktu</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {data.statistics.onTimeCount}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Terlambat</CardDescription>
              <CardTitle className="text-3xl text-destructive">
                {data.statistics.delayedCount}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Dengan Masalah</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">
                {data.statistics.withIssuesCount}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Pengiriman</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="ASSIGNED">Ditugaskan</SelectItem>
                  <SelectItem value="DEPARTED">Dalam Perjalanan</SelectItem>
                  <SelectItem value="DELIVERED">Terkirim</SelectItem>
                  <SelectItem value="FAILED">Gagal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Driver</label>
              <Input
                placeholder="Cari nama driver..."
                value={driverFilter}
                onChange={(e) => setDriverFilter(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Masalah</label>
              <Select value={issuesFilter} onValueChange={setIssuesFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="with-issues">Dengan Masalah</SelectItem>
                  <SelectItem value="no-issues">Tanpa Masalah</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Quality Check</label>
              <Select value={qualityFilter} onValueChange={setQualityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="checked">Sudah Dicek</SelectItem>
                  <SelectItem value="unchecked">Belum Dicek</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengiriman</CardTitle>
          <CardDescription>
            {data?.data.length || 0} pengiriman ditemukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Memuat data...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-destructive">Error: {error.message}</div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={data?.data || []}
              searchKey="targetName"
              searchPlaceholder="Cari tujuan pengiriman..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
