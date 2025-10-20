/**
 * @fileoverview StockMovementHistory Component - Stock Movement History Table
 * @description Comprehensive paginated table displaying all stock movements with advanced
 * filtering (date range, type, status, search), manager approval actions, export functionality,
 * and real-time updates. Uses TanStack Table for performance and flexibility.
 * 
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import React, { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  ArrowUpDown,
  MoreHorizontal,
  Download,
  CheckCircle,
  XCircle,
  Calendar,
  Search,
  Filter,
  ArrowDownToLine,
  ArrowUpFromLine,
  Activity,
  AlertCircle,
  Eye,
  FileText,
  User,
  Clock,
} from 'lucide-react'
import { MovementType } from '@prisma/client'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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

// Hooks & Types
import { useStockMovements, useApproveStockMovement } from '../hooks/useStockMovement'
import type { StockMovementDetail } from '../types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface StockMovementHistoryProps {
  inventoryId?: string
  showFilters?: boolean
  pageSize?: number
}

export function StockMovementHistory({
  inventoryId,
  showFilters = true,
  pageSize = 10,
}: StockMovementHistoryProps) {
  // Filter states
  const [movementType, setMovementType] = useState<MovementType | 'ALL'>('ALL')
  const [approvalStatus, setApprovalStatus] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()

  // Table states
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'movedAt', desc: true }, // Default: newest first
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageSize,
  })

  // Approval dialog state
  const [approvalDialog, setApprovalDialog] = useState<{
    open: boolean
    movementId: string
    action: 'approve' | 'reject'
  }>({
    open: false,
    movementId: '',
    action: 'approve',
  })

  // Fetch data with filters
  const filters = useMemo(() => {
    return {
      inventoryId,
      movementType: movementType !== 'ALL' ? movementType : undefined,
      isApproved: approvalStatus === 'APPROVED' ? true : approvalStatus === 'PENDING' ? false : undefined,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      search: searchQuery || undefined,
    }
  }, [inventoryId, movementType, approvalStatus, startDate, endDate, searchQuery])

  const { data: movements = [], isLoading, error } = useStockMovements(filters)
  const { mutate: approveMovement, isPending: isApproving } = useApproveStockMovement()

  // Get movement type config
  const getMovementTypeConfig = (type: MovementType) => {
    const configs: Record<MovementType, {
      label: string
      icon: React.ReactNode
      variant: 'default' | 'secondary' | 'destructive' | 'outline'
    }> = {
      IN: {
        label: 'Masuk',
        icon: <ArrowDownToLine className="h-3 w-3" />,
        variant: 'default',
      },
      OUT: {
        label: 'Keluar',
        icon: <ArrowUpFromLine className="h-3 w-3" />,
        variant: 'destructive',
      },
      ADJUSTMENT: {
        label: 'Penyesuaian',
        icon: <Activity className="h-3 w-3" />,
        variant: 'secondary',
      },
      EXPIRED: {
        label: 'Kedaluwarsa',
        icon: <AlertCircle className="h-3 w-3" />,
        variant: 'outline',
      },
      DAMAGED: {
        label: 'Rusak',
        icon: <AlertCircle className="h-3 w-3" />,
        variant: 'destructive',
      },
      TRANSFER: {
        label: 'Transfer',
        icon: <Activity className="h-3 w-3" />,
        variant: 'secondary',
      },
    }
    return configs[type]
  }

  // Table columns
  const columns: ColumnDef<StockMovementDetail>[] = [
    {
      accessorKey: 'movedAt',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Tanggal
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue('movedAt'))
        return (
          <div className="flex flex-col">
            <span className="font-medium">{format(date, 'dd MMM yyyy', { locale: localeId })}</span>
            <span className="text-xs text-muted-foreground">{format(date, 'HH:mm', { locale: localeId })}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'movementType',
      header: 'Jenis',
      cell: ({ row }) => {
        const type = row.getValue('movementType') as MovementType
        const config = getMovementTypeConfig(type)
        return (
          <Badge variant={config.variant} className="gap-1">
            {config.icon}
            {config.label}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value === 'ALL' || row.getValue(id) === value
      },
    },
    {
      accessorKey: 'inventory',
      header: 'Item',
      cell: ({ row }) => {
        const inventory = row.original.inventory
        return (
          <div className="flex flex-col">
            <span className="font-medium">{inventory.itemName}</span>
            {inventory.itemCode && (
              <span className="text-xs text-muted-foreground">{inventory.itemCode}</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Jumlah
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const quantity = row.getValue('quantity') as number
        const unit = row.original.unit
        const type = row.original.movementType
        const color = type === 'IN' ? 'text-green-600 dark:text-green-400' : type === 'OUT' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'
        return (
          <span className={cn('font-semibold', color)}>
            {type === 'IN' ? '+' : type === 'OUT' ? '-' : ''}{quantity} {unit}
          </span>
        )
      },
    },
    {
      id: 'stock',
      header: 'Stok',
      cell: ({ row }) => {
        const before = row.original.stockBefore
        const after = row.original.stockAfter
        const unit = row.original.unit
        return (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{before}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-semibold">{after} {unit}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'batchNumber',
      header: 'Batch',
      cell: ({ row }) => {
        const batch = row.getValue('batchNumber') as string | null
        return batch ? (
          <span className="text-xs font-mono">{batch}</span>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )
      },
    },
    {
      accessorKey: 'referenceNumber',
      header: 'Referensi',
      cell: ({ row }) => {
        const ref = row.getValue('referenceNumber') as string | null
        const refType = row.original.referenceType
        return ref ? (
          <div className="flex flex-col">
            <span className="text-xs font-mono">{ref}</span>
            {refType && (
              <span className="text-xs text-muted-foreground">{refType}</span>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )
      },
    },
    {
      accessorKey: 'mover',
      header: 'Oleh',
      cell: ({ row }) => {
        const mover = row.original.mover
        return mover ? (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{mover.name}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )
      },
    },
    {
      id: 'approval',
      header: 'Status',
      cell: ({ row }) => {
        const approvedBy = row.original.approvedBy
        const approvedAt = row.original.approvedAt
        const approver = row.original.approver

        if (approvedBy && approvedAt) {
          return (
            <div className="flex flex-col gap-1">
              <Badge variant="default" className="w-fit gap-1">
                <CheckCircle className="h-3 w-3" />
                Disetujui
              </Badge>
              {approver && (
                <span className="text-xs text-muted-foreground">
                  oleh {approver.name}
                </span>
              )}
            </div>
          )
        }

        return (
          <Badge variant="outline" className="w-fit gap-1">
            <Clock className="h-3 w-3" />
            Menunggu
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const movement = row.original
        const isPending = !movement.approvedBy

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
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>
              {movement.documentUrl && (
                <DropdownMenuItem
                  onClick={() => window.open(movement.documentUrl!, '_blank')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Lihat Dokumen
                </DropdownMenuItem>
              )}
              {isPending && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setApprovalDialog({
                      open: true,
                      movementId: movement.id,
                      action: 'approve',
                    })}
                    className="text-green-600 dark:text-green-400"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Setujui
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setApprovalDialog({
                      open: true,
                      movementId: movement.id,
                      action: 'reject',
                    })}
                    className="text-red-600 dark:text-red-400"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Tolak
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Table instance
  const table = useReactTable({
    data: movements,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  })

  // Handle approval
  const handleApproval = () => {
    approveMovement(
      { id: approvalDialog.movementId },
      {
        onSuccess: () => {
          toast.success(
            approvalDialog.action === 'approve'
              ? 'Pergerakan stok berhasil disetujui'
              : 'Pergerakan stok ditolak'
          )
          setApprovalDialog({ open: false, movementId: '', action: 'approve' })
        },
        onError: (error) => {
          toast.error(`Gagal ${approvalDialog.action === 'approve' ? 'menyetujui' : 'menolak'}: ${error.message}`)
        },
      }
    )
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Tanggal', 'Jenis', 'Item', 'Jumlah', 'Stok Sebelum', 'Stok Setelah', 'Batch', 'Referensi', 'Oleh', 'Status']
    const rows = movements.map(m => [
      format(new Date(m.movedAt), 'dd/MM/yyyy HH:mm'),
      getMovementTypeConfig(m.movementType).label,
      m.inventory.itemName,
      `${m.quantity} ${m.unit}`,
      m.stockBefore,
      m.stockAfter,
      m.batchNumber || '-',
      m.referenceNumber || '-',
      m.mover?.name || '-',
      m.approvedBy ? 'Disetujui' : 'Menunggu',
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stock-movements-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Data berhasil diekspor ke CSV')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Riwayat Pergerakan Stok</CardTitle>
            <CardDescription>
              Daftar semua pergerakan stok dengan filter dan approval
            </CardDescription>
          </div>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Ekspor CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        {showFilters && (
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari referensi, batch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Movement Type */}
              <Select
                value={movementType}
                onValueChange={(value) => setMovementType(value as MovementType | 'ALL')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Jenis Pergerakan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Jenis</SelectItem>
                  <SelectItem value="IN">Stok Masuk</SelectItem>
                  <SelectItem value="OUT">Stok Keluar</SelectItem>
                  <SelectItem value="ADJUSTMENT">Penyesuaian</SelectItem>
                  <SelectItem value="EXPIRED">Kedaluwarsa</SelectItem>
                  <SelectItem value="DAMAGED">Rusak</SelectItem>
                  <SelectItem value="TRANSFER">Transfer</SelectItem>
                </SelectContent>
              </Select>

              {/* Approval Status */}
              <Select
                value={approvalStatus}
                onValueChange={(value) => setApprovalStatus(value as 'ALL' | 'PENDING' | 'APPROVED')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status Approval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem value="PENDING">Menunggu Approval</SelectItem>
                  <SelectItem value="APPROVED">Sudah Disetujui</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range */}
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Calendar className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'dd/MM/yy') : 'Dari'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Calendar className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'dd/MM/yy') : 'Sampai'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(movementType !== 'ALL' || approvalStatus !== 'ALL' || searchQuery || startDate || endDate) && (
              <Alert>
                <Filter className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span className="text-sm">
                    Filter aktif: {movements.length} hasil ditemukan
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMovementType('ALL')
                      setApprovalStatus('ALL')
                      setSearchQuery('')
                      setStartDate(undefined)
                      setEndDate(undefined)
                    }}
                  >
                    Reset Filter
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <Separator />
          </div>
        )}

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>Memuat data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2 text-destructive">
                      <AlertCircle className="h-6 w-6" />
                      <span>Gagal memuat data: {error.message}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Activity className="h-8 w-8" />
                      <span>Belum ada pergerakan stok</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} dari{' '}
              {table.getFilteredRowModel().rows.length} baris dipilih
            </div>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Sebelumnya
            </Button>
            <div className="text-sm text-muted-foreground">
              Halaman {table.getState().pagination.pageIndex + 1} dari{' '}
              {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Approval Dialog */}
      <AlertDialog open={approvalDialog.open} onOpenChange={(open) => setApprovalDialog({ ...approvalDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {approvalDialog.action === 'approve' ? 'Setujui Pergerakan Stok?' : 'Tolak Pergerakan Stok?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {approvalDialog.action === 'approve'
                ? 'Pergerakan stok yang disetujui akan mengubah stok inventory secara permanen.'
                : 'Pergerakan stok yang ditolak tidak akan mengubah stok inventory.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproval}
              disabled={isApproving}
              className={cn(
                approvalDialog.action === 'reject' && 'bg-destructive hover:bg-destructive/90'
              )}
            >
              {isApproving ? 'Memproses...' : approvalDialog.action === 'approve' ? 'Setujui' : 'Tolak'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
