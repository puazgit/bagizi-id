/**
 * @fileoverview ProgramList Component - DataTable dengan filtering & sorting
 * @version Next.js 15.5.4 / TanStack Table v8
 * @author Bagizi-ID Development Team
 */

'use client'

import { type FC, useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
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
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  ArrowUpDown,
  Calendar,
  Users,
  Target
} from 'lucide-react'
import {
  formatCurrency,
  formatDateRange,
  calculateProgress,
  getStatusVariant,
  getStatusLabel,
  getProgramTypeLabel,
  getTargetGroupLabel,
  formatNumber,
} from '../lib'
import type { Program } from '../types'

interface ProgramListProps {
  data: Program[]
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  isLoading?: boolean
}

export const ProgramList: FC<ProgramListProps> = ({
  data,
  onView,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const columns = useMemo<ColumnDef<Program>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              Nama Program
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const program = row.original
          return (
            <div className="space-y-1">
              <div className="font-semibold text-foreground">
                {program.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {program.programCode}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string
          return (
            <Badge variant={getStatusVariant(status)}>
              {getStatusLabel(status)}
            </Badge>
          )
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
      },
      {
        accessorKey: 'programType',
        header: 'Jenis Program',
        cell: ({ row }) => {
          const type = row.getValue('programType') as string
          return (
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {getProgramTypeLabel(type)}
              </span>
            </div>
          )
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
      },
      {
        accessorKey: 'targetGroup',
        header: 'Target Kelompok',
        cell: ({ row }) => {
          const group = row.getValue('targetGroup') as string
          return (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {getTargetGroupLabel(group)}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: 'targetRecipients',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              Penerima
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const program = row.original
          const progress = calculateProgress(
            program.currentRecipients,
            program.targetRecipients
          )
          
          return (
            <div className="space-y-1">
              <div className="text-sm font-medium">
                {formatNumber(program.currentRecipients)} / {formatNumber(program.targetRecipients)}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      progress >= 100
                        ? 'bg-green-500'
                        : progress >= 75
                        ? 'bg-blue-500'
                        : progress >= 50
                        ? 'bg-yellow-500'
                        : 'bg-orange-500'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {progress}%
                </span>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'totalBudget',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              Anggaran
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const budget = row.getValue('totalBudget') as number | null
          return (
            <div className="font-medium">
              {formatCurrency(budget)}
            </div>
          )
        },
      },
      {
        accessorKey: 'startDate',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Periode
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const program = row.original
          return (
            <div className="text-sm">
              {formatDateRange(program.startDate, program.endDate)}
            </div>
          )
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const program = row.original

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
                <DropdownMenuItem
                  onClick={() => onView?.(program.id)}
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onEdit?.(program.id)}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Program
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete?.(program.id)}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Program
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [onView, onEdit, onDelete]
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="Cari program..."
    />
  )
}
