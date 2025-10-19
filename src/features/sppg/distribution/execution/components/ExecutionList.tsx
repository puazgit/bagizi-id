'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  MoreHorizontal, 
  Eye, 
  Play, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react'
import { useExecutions } from '../hooks'
import { 
  type ExecutionListItem,
  EXECUTION_STATUS_LABELS,
  EXECUTION_STATUS_COLORS
} from '../types'
import { DistributionStatus } from '@prisma/client'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface ExecutionListProps {
  defaultStatus?: DistributionStatus
  defaultScheduleId?: string
}

export function ExecutionList({ 
  defaultStatus, 
  defaultScheduleId 
}: ExecutionListProps) {
  // Filter state
  const [status, setStatus] = useState<DistributionStatus | undefined>(defaultStatus)
  const [scheduleId] = useState<string | undefined>(defaultScheduleId)
  const [hasIssues, setHasIssues] = useState<boolean | undefined>()
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')

  // Fetch executions with filters and auto-refresh
  const { 
    data: response, 
    isLoading,
    refetch,
    isRefetching 
  } = useExecutions({
    status,
    scheduleId,
    hasIssues,
    dateFrom: dateFrom ? new Date(dateFrom) : undefined,
    dateTo: dateTo ? new Date(dateTo) : undefined,
  })

  const executions = response?.executions || []

  // Table columns
  const columns: ColumnDef<ExecutionListItem>[] = [
    {
      accessorKey: 'distributionCode',
      header: 'Kode Distribusi',
      cell: ({ row }) => (
        <Link 
          href={`/distribution/execution/${row.original.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.original.distributionCode}
        </Link>
      ),
    },
    {
      accessorKey: 'scheduleName',
      header: 'Jadwal',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <Link
            href={`/distribution/schedule/${row.original.scheduleId}`}
            className="text-sm font-medium hover:underline"
          >
            {row.original.scheduleName}
          </Link>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        const variant = EXECUTION_STATUS_COLORS[status]
        const label = EXECUTION_STATUS_LABELS[status]

        return (
          <Badge variant={variant}>
            {label}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'actualStartTime',
      header: 'Waktu Mulai',
      cell: ({ row }) => row.original.actualStartTime ? (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {format(new Date(row.original.actualStartTime), 'dd MMM yyyy HH:mm', { locale: id })}
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">Belum dimulai</span>
      ),
    },
    {
      accessorKey: 'progress',
      header: 'Progress',
      cell: ({ row }) => {
        const delivered = row.original.totalPortionsDelivered || 0
        const planned = row.original.plannedPortions || 0
        const percentage = planned > 0 ? Math.round((delivered / planned) * 100) : 0

        return (
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium">
              {delivered.toLocaleString('id-ID')} / {planned.toLocaleString('id-ID')} porsi
            </div>
            <div className="text-xs text-muted-foreground">
              {percentage}% selesai
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'issuesCount',
      header: 'Masalah',
      cell: ({ row }) => {
        const issueCount = row.original.issuesCount || 0

        if (issueCount === 0) {
          return (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Tidak ada
            </Badge>
          )
        }

        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {issueCount} masalah
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const execution = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/distribution/execution/${execution.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail
                </Link>
              </DropdownMenuItem>
              {execution.status === 'SCHEDULED' && (
                <DropdownMenuItem asChild>
                  <Link href={`/distribution/execution/${execution.id}/start`}>
                    <Play className="mr-2 h-4 w-4" />
                    Mulai Eksekusi
                  </Link>
                </DropdownMenuItem>
              )}
              {['PREPARING', 'IN_TRANSIT', 'DISTRIBUTING'].includes(execution.status) && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/distribution/execution/${execution.id}/update`}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Update Progress
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/distribution/execution/${execution.id}/complete`}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Selesaikan
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/distribution/execution/${execution.id}/cancel`}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Batalkan
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              {['PREPARING', 'IN_TRANSIT', 'DISTRIBUTING'].includes(execution.status) && (
                <DropdownMenuItem asChild>
                  <Link href={`/distribution/execution/${execution.id}/report-issue`}>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Laporkan Masalah
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Daftar Eksekusi Distribusi</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filter Panel */}
        <div className="mb-6 p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Filter</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={status || 'all'}
                onValueChange={(value) => setStatus(value === 'all' ? undefined : value as DistributionStatus)}
              >
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="SCHEDULED">Terjadwal</SelectItem>
                  <SelectItem value="PREPARING">Persiapan</SelectItem>
                  <SelectItem value="IN_TRANSIT">Dalam Perjalanan</SelectItem>
                  <SelectItem value="DISTRIBUTING">Distribusi</SelectItem>
                  <SelectItem value="COMPLETED">Selesai</SelectItem>
                  <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Has Issues Filter */}
            <div className="space-y-2">
              <Label htmlFor="issues-filter">Masalah</Label>
              <Select
                value={hasIssues === undefined ? 'all' : hasIssues ? 'yes' : 'no'}
                onValueChange={(value) => setHasIssues(value === 'all' ? undefined : value === 'yes')}
              >
                <SelectTrigger id="issues-filter">
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="yes">Ada Masalah</SelectItem>
                  <SelectItem value="no">Tidak Ada Masalah</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date From */}
            <div className="space-y-2">
              <Label htmlFor="date-from">Tanggal Mulai (Dari)</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            {/* Start Date To */}
            <div className="space-y-2">
              <Label htmlFor="date-to">Tanggal Mulai (Sampai)</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {/* Clear Filters */}
          {(status || hasIssues !== undefined || dateFrom || dateTo) && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatus(undefined)
                  setHasIssues(undefined)
                  setDateFrom('')
                  setDateTo('')
                }}
              >
                Reset Filter
              </Button>
            </div>
          )}
        </div>

        {/* Data Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={executions}
            searchKey="distributionCode"
            searchPlaceholder="Cari kode distribusi..."
          />
        )}
      </CardContent>
    </Card>
  )
}
