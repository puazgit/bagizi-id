/**
 * @fileoverview Procurement List Component with Filters and Table
 * @version Next.js 15.5.4 / shadcn/ui / TanStack Table / TanStack Query
 * @see {@link /docs/copilot-instructions.md} Component patterns
 */

'use client'

import { type FC, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  type ColumnFiltersState,
  useReactTable,
} from '@tanstack/react-table'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileText,
} from 'lucide-react'
import { useProcurements, useDeleteProcurement } from '../hooks/useProcurement'
import { ProcurementMethod, ProcurementStatus } from '@prisma/client'
import { cn } from '@/lib/utils'
import type { ProcurementWithDetails } from '../types'

interface ProcurementListProps {
  supplierId?: string
  planId?: string
  className?: string
}

export const ProcurementList: FC<ProcurementListProps> = ({
  supplierId,
  planId,
  className,
}) => {
  const router = useRouter()

  // State
  const [search, setSearch] = useState('')
  const [methodFilter, setMethodFilter] = useState<ProcurementMethod | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<ProcurementStatus | 'ALL'>('ALL')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [procurementToDelete, setProcurementToDelete] = useState<{
    id: string
    code: string
  } | null>(null)

  // Build query filters
  const filters = useMemo(
    () => ({
      ...(supplierId && { supplierId }),
      ...(planId && { planId }),
      ...(methodFilter !== 'ALL' && { purchaseMethod: [methodFilter] }),
      ...(statusFilter !== 'ALL' && { status: [statusFilter] }),
    }),
    [supplierId, planId, methodFilter, statusFilter]
  )

  // Fetch procurements (API returns ProcurementWithDetails with supplier, items relations)
  // Hook already extracts data.data via select, so procurementsResponse is the array
  const { data: procurementsResponse, isLoading, error } = useProcurements(filters)
  
  // Use response directly (already an array from hook's select function)
  const procurements = useMemo(
    () => procurementsResponse || [],
    [procurementsResponse]
  )

  // Client-side search filter
  const filteredProcurements = useMemo(() => {
    if (!search) return procurements

    return procurements.filter((procurement) => {
      const searchLower = search.toLowerCase()
      return (
        procurement.procurementCode.toLowerCase().includes(searchLower) ||
        procurement.supplier?.supplierName?.toLowerCase().includes(searchLower)
      )
    })
  }, [procurements, search])

  // Mutations
  const { mutate: deleteProcurement, isPending: isDeleting } = useDeleteProcurement()

  // Handlers
  const handleView = useCallback((id: string) => {
    router.push(`/procurement/${id}`)
  }, [router])

  const handleEdit = useCallback((id: string) => {
    router.push(`/procurement/${id}/edit`)
  }, [router])

  const handleDelete = useCallback((id: string, code: string) => {
    setProcurementToDelete({ id, code })
    setShowDeleteDialog(true)
  }, [])

  const confirmDelete = useCallback(() => {
    if (procurementToDelete) {
      deleteProcurement(procurementToDelete.id)
    }
    setShowDeleteDialog(false)
    setProcurementToDelete(null)
  }, [procurementToDelete, deleteProcurement])

  const handleCreateNew = useCallback(() => {
    router.push('/procurement/new')
  }, [router])

  // Badge variant helper for purchase method
  const getMethodBadgeVariant = (
    method: ProcurementMethod
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (method) {
      case 'DIRECT':
        return 'default' // Blue
      case 'TENDER':
        return 'secondary' // Green
      case 'CONTRACT':
        return 'outline' // Purple
      case 'EMERGENCY':
        return 'destructive' // Red
      case 'BULK':
        return 'secondary' // Orange
      default:
        return 'default'
    }
  }

  // Badge label helper for purchase method
  const getMethodLabel = (method: ProcurementMethod): string => {
    switch (method) {
      case 'DIRECT':
        return 'Pembelian Langsung'
      case 'TENDER':
        return 'Tender'
      case 'CONTRACT':
        return 'Kontrak'
      case 'EMERGENCY':
        return 'Darurat'
      case 'BULK':
        return 'Pembelian Massal'
      default:
        return method
    }
  }

  // Badge variant helper for status
  const getStatusBadgeVariant = (
    status: ProcurementStatus
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'DRAFT':
        return 'secondary'
      case 'PENDING_APPROVAL':
        return 'outline'
      case 'APPROVED':
        return 'default'
      case 'ORDERED':
        return 'outline'
      case 'PARTIALLY_RECEIVED':
        return 'secondary'
      case 'FULLY_RECEIVED':
        return 'default'
      case 'COMPLETED':
        return 'default'
      case 'CANCELLED':
        return 'destructive'
      case 'REJECTED':
        return 'destructive'
      default:
        return 'default'
    }
  }

  // Badge label helper for status
  const getStatusLabel = (status: ProcurementStatus): string => {
    switch (status) {
      case 'DRAFT':
        return 'Draft'
      case 'PENDING_APPROVAL':
        return 'Menunggu Persetujuan'
      case 'APPROVED':
        return 'Disetujui'
      case 'ORDERED':
        return 'Dipesan'
      case 'PARTIALLY_RECEIVED':
        return 'Sebagian Diterima'
      case 'FULLY_RECEIVED':
        return 'Sepenuhnya Diterima'
      case 'COMPLETED':
        return 'Selesai'
      case 'CANCELLED':
        return 'Dibatalkan'
      case 'REJECTED':
        return 'Ditolak'
      default:
        return status
    }
  }

  // Column definitions
  const columns = useMemo<ColumnDef<ProcurementWithDetails>[]>(
    () => [
      {
        accessorKey: 'procurementCode',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              Kode Pengadaan
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('procurementCode')}</div>
        ),
      },
      {
        accessorKey: 'supplier',
        header: 'Supplier',
        cell: ({ row }) => {
          const supplier = row.original.supplier
          return (
            <div>
              <div className="font-medium">{supplier?.supplierName || '-'}</div>
              {supplier?.supplierType && (
                <div className="text-sm text-muted-foreground">
                  {supplier.supplierType}
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'procurementDate',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              Tanggal
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const date = row.getValue('procurementDate') as Date
          return format(new Date(date), 'dd MMM yyyy', { locale: localeId })
        },
      },
      {
        accessorKey: 'purchaseMethod',
        header: 'Metode',
        cell: ({ row }) => {
          const method = row.getValue('purchaseMethod') as ProcurementMethod
          return (
            <Badge
              variant={getMethodBadgeVariant(method)}
              className={cn(
                method === 'DIRECT' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                method === 'TENDER' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                method === 'CONTRACT' && 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
                method === 'EMERGENCY' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                method === 'BULK' && 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
              )}
            >
              {getMethodLabel(method)}
            </Badge>
          )
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
      },
      {
        accessorKey: 'totalAmount',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              Total
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue('totalAmount'))
          const formatted = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
          }).format(amount)
          return <div className="font-medium text-right">{formatted}</div>
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as ProcurementStatus
          return (
            <Badge variant={getStatusBadgeVariant(status)}>
              {getStatusLabel(status)}
            </Badge>
          )
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const procurement = row.original

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleView(procurement.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEdit(procurement.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Pengadaan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(procurement.id, procurement.procurementCode)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Pengadaan
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [handleView, handleEdit, handleDelete]
  )

  // Table instance with explicit type
  const table = useReactTable<ProcurementWithDetails>({
    data: filteredProcurements,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Daftar Pengadaan
              </CardTitle>
              <CardDescription>
                Kelola data pengadaan bahan makanan dan peralatan
              </CardDescription>
            </div>
            <Button onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Buat Pengadaan
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters & Search */}
          <div className="flex flex-col gap-4">
            {/* Search and Primary Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari kode pengadaan atau supplier..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Method Filter */}
              <Select
                value={methodFilter}
                onValueChange={(value) =>
                  setMethodFilter(value as ProcurementMethod | 'ALL')
                }
              >
                <SelectTrigger className="w-full sm:w-[220px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter metode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Metode</SelectItem>
                  <SelectItem value="DIRECT">Pembelian Langsung</SelectItem>
                  <SelectItem value="TENDER">Tender</SelectItem>
                  <SelectItem value="CONTRACT">Kontrak</SelectItem>
                  <SelectItem value="EMERGENCY">Darurat</SelectItem>
                  <SelectItem value="BULK">Pembelian Massal</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as ProcurementStatus | 'ALL')
                }
              >
                <SelectTrigger className="w-full sm:w-[220px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">Menunggu Persetujuan</SelectItem>
                  <SelectItem value="APPROVED">Disetujui</SelectItem>
                  <SelectItem value="ORDERED">Dipesan</SelectItem>
                  <SelectItem value="PARTIALLY_RECEIVED">Sebagian Diterima</SelectItem>
                  <SelectItem value="FULLY_RECEIVED">Sepenuhnya Diterima</SelectItem>
                  <SelectItem value="COMPLETED">Selesai</SelectItem>
                  <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                  <SelectItem value="REJECTED">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card>
        <CardContent className="p-0">
          {/* Loading State */}
          {isLoading && (
            <div className="p-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Gagal memuat data pengadaan: {error.message}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Table */}
          {!isLoading && !error && (
            <>
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
                    {table.getRowModel().rows?.length ? (
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
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <FileText className="h-8 w-8" />
                            <p>Tidak ada data pengadaan</p>
                            {(search || methodFilter !== 'ALL' || statusFilter !== 'ALL') && (
                              <p className="text-sm">
                                Coba ubah filter atau pencarian Anda
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4">
                <div className="text-sm text-muted-foreground">
                  Menampilkan{' '}
                  <span className="font-medium">
                    {table.getState().pagination.pageIndex *
                      table.getState().pagination.pageSize +
                      1}
                  </span>{' '}
                  sampai{' '}
                  <span className="font-medium">
                    {Math.min(
                      (table.getState().pagination.pageIndex + 1) *
                        table.getState().pagination.pageSize,
                      table.getFilteredRowModel().rows.length
                    )}
                  </span>{' '}
                  dari{' '}
                  <span className="font-medium">
                    {table.getFilteredRowModel().rows.length}
                  </span>{' '}
                  pengadaan
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Sebelumnya
                  </Button>
                  <div className="text-sm font-medium">
                    Halaman {table.getState().pagination.pageIndex + 1} dari{' '}
                    {table.getPageCount()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Berikutnya
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengadaan?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus pengadaan{' '}
              <span className="font-semibold">{procurementToDelete?.code}</span>?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
