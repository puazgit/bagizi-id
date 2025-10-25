/**
 * @fileoverview Demo Request Table Component with Actions
 * @version Next.js 15.5.4 / shadcn/ui DataTable / TanStack Table
 * @author Bagizi-ID Development Team
 * @see {@link /docs/ADMIN_DEMO_REQUESTS_FRONTEND_FOUNDATION_COMPLETE.md} Foundation Documentation
 */

'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  CheckCircle,
  XCircle,
  UserPlus,
  RefreshCw,
} from 'lucide-react'
import type { DemoRequestListItem } from '../types/demo-request.types'
import { 
  DEMO_REQUEST_STATUS_VARIANTS, 
  ORGANIZATION_TYPE_LABELS 
} from '../types/demo-request.types'
import { ApproveDialog } from './dialogs/ApproveDialog'
import { RejectDialog } from './dialogs/RejectDialog'
import { AssignDialog } from './dialogs/AssignDialog'
import { ConvertDialog } from './dialogs/ConvertDialog'

// ================================ COMPONENT INTERFACES ================================

interface DemoRequestTableProps {
  data: DemoRequestListItem[]
  onView?: (id: string) => void
  isLoading?: boolean
}

interface DialogState {
  approve: boolean
  reject: boolean
  assign: boolean
  convert: boolean
}

// ================================ UTILITY FUNCTIONS ================================

/**
 * Get badge variant based on status
 */
const getStatusBadge = (status: string) => {
  const variantMap = DEMO_REQUEST_STATUS_VARIANTS[status as keyof typeof DEMO_REQUEST_STATUS_VARIANTS]
  
  // Map custom variants to shadcn Badge variants
  const validVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'default': 'default',
    'secondary': 'secondary',
    'success': 'default', // Green success → default
    'destructive': 'destructive',
    'info': 'secondary', // Blue info → secondary
    'warning': 'outline', // Yellow warning → outline
  }
  
  const variant = validVariants[variantMap] || 'secondary'
  
  return (
    <Badge variant={variant} className="capitalize">
      {status.replace(/_/g, ' ')}
    </Badge>
  )
}

/**
 * Get badge for organization type
 */
const getOrgTypeBadge = (orgType: string) => {
  const label = ORGANIZATION_TYPE_LABELS[orgType as keyof typeof ORGANIZATION_TYPE_LABELS] || orgType
  
  const variants: Record<string, string> = {
    YAYASAN: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    LEMBAGA: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    SEKOLAH: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    PEMERINTAH: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
  }
  
  return (
    <Badge variant="outline" className={variants[orgType] || ''}>
      {label}
    </Badge>
  )
}

/**
 * Format conversion probability as percentage badge
 */
const getProbabilityBadge = (probability: number | null) => {
  if (probability === null) return <span className="text-muted-foreground">-</span>
  
  const variant = probability >= 70 ? 'default' : probability >= 40 ? 'secondary' : 'outline'
  const color = probability >= 70 ? 'text-green-600' : probability >= 40 ? 'text-yellow-600' : 'text-gray-600'
  
  return (
    <Badge variant={variant} className={color}>
      {probability}%
    </Badge>
  )
}

// ================================ MAIN COMPONENT ================================

/**
 * Demo Request Table with inline actions
 * 
 * Features:
 * - Sortable columns
 * - Filterable by organization name
 * - Action dropdown per row
 * - Integrated dialogs for actions
 * 
 * @param data - Array of demo request list items
 * @param onView - Callback when view action clicked
 * @param isLoading - Loading state
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useDemoRequests()
 * 
 * <DemoRequestTable
 *   data={data}
 *   onView={(id) => router.push(`/admin/demo-requests/${id}`)}
 *   isLoading={isLoading}
 * />
 * ```
 */
export function DemoRequestTable({
  data,
  onView,
  isLoading = false,
}: DemoRequestTableProps) {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [selectedOrgName, setSelectedOrgName] = useState<string>('')
  const [dialogs, setDialogs] = useState<DialogState>({
    approve: false,
    reject: false,
    assign: false,
    convert: false,
  })

  const openDialog = (type: keyof DialogState, requestId: string, orgName: string) => {
    setSelectedRequestId(requestId)
    setSelectedOrgName(orgName)
    setDialogs({ ...dialogs, [type]: true })
  }

  const closeDialog = (type: keyof DialogState) => {
    setDialogs({ ...dialogs, [type]: false })
    setSelectedRequestId(null)
    setSelectedOrgName('')
  }

  const columns: ColumnDef<DemoRequestListItem>[] = [
    {
      accessorKey: 'organizationName',
      header: 'Organisasi',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue('organizationName')}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.picName}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'organizationType',
      header: 'Jenis',
      cell: ({ row }) => getOrgTypeBadge(row.getValue('organizationType')),
    },
    {
      accessorKey: 'targetBeneficiaries',
      header: 'Penerima',
      cell: ({ row }) => {
        const count = row.getValue('targetBeneficiaries') as number
        return (
          <div className="text-center font-medium">
            {count.toLocaleString('id-ID')}
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.getValue('status')),
    },
    {
      accessorKey: 'createdAt',
      header: 'Tanggal',
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as Date
        return (
          <div className="text-sm text-muted-foreground">
            {format(new Date(date), 'dd MMM yyyy', { locale: localeId })}
          </div>
        )
      },
    },
    {
      accessorKey: 'conversionProbability',
      header: 'Probabilitas',
      cell: ({ row }) => getProbabilityBadge(row.getValue('conversionProbability')),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const request = row.original

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
              <DropdownMenuItem onClick={() => onView?.(request.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => openDialog('approve', request.id, request.organizationName)}
              >
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                Setujui
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDialog('reject', request.id, request.organizationName)}
              >
                <XCircle className="mr-2 h-4 w-4 text-destructive" />
                Tolak
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDialog('assign', request.id, request.organizationName)}
              >
                <UserPlus className="mr-2 h-4 w-4 text-blue-600" />
                Tugaskan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => openDialog('convert', request.id, request.organizationName)}
              >
                <RefreshCw className="mr-2 h-4 w-4 text-primary" />
                Konversi ke SPPG
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Memuat data...</div>
      </div>
    )
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="organizationName"
        searchPlaceholder="Cari nama organisasi..."
      />

      {/* Action Dialogs */}
      {selectedRequestId && (
        <>
          <ApproveDialog
            open={dialogs.approve}
            onOpenChange={() => closeDialog('approve')}
            requestId={selectedRequestId}
            organizationName={selectedOrgName}
          />
          <RejectDialog
            open={dialogs.reject}
            onOpenChange={() => closeDialog('reject')}
            requestId={selectedRequestId}
            organizationName={selectedOrgName}
          />
          <AssignDialog
            open={dialogs.assign}
            onOpenChange={() => closeDialog('assign')}
            requestId={selectedRequestId}
            organizationName={selectedOrgName}
          />
          <ConvertDialog
            open={dialogs.convert}
            onOpenChange={() => closeDialog('convert')}
            requestId={selectedRequestId}
            organizationName={selectedOrgName}
          />
        </>
      )}
    </>
  )
}
