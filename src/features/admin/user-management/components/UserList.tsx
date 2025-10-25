/**
 * @fileoverview User List Component with DataTable
 * @version Next.js 15.5.4 / shadcn/ui / TanStack Table
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  Building2,
  Mail,
  Phone,
  CheckCircle,
  Unlock,
  ArrowUpDown
} from 'lucide-react'
import { useUsers, useDeleteUser, useVerifyEmail, useUnlockAccount } from '../hooks'
import type { UserListItem, UserFilters } from '../types'
import {
  formatUserDisplayName,
  getUserInitials,
  getUserStatusVariant,
  getUserStatusLabel,
  getRoleBadgeColor,
  formatLastLogin,
  isUserLocked
} from '../lib'
import { getRoleLabel, getTypeLabel } from '../types'

interface UserListProps {
  filters: UserFilters
  onFiltersChange: (filters: UserFilters) => void
}

/**
 * User List Component
 * Displays users in a sortable, paginated data table
 */
export function UserList({ filters, onFiltersChange }: UserListProps) {
  const { data, isLoading, error } = useUsers(filters)
  const { mutate: deleteUser } = useDeleteUser()
  const { mutate: verifyEmail } = useVerifyEmail()
  const { mutate: unlockAccount } = useUnlockAccount()

  const [sorting, setSorting] = useState<SortingState>([
    { id: filters.sortBy || 'createdAt', desc: filters.sortOrder === 'desc' }
  ])

  const columns: ColumnDef<UserListItem>[] = [
    {
      id: 'user',
      header: 'User',
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user.avatar || undefined} alt={user.name || user.email} />
              <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <Link 
                href={`/admin/users/${user.id}`}
                className="font-medium hover:text-primary transition-colors truncate"
              >
                {formatUserDisplayName(user)}
              </Link>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Mail className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      id: 'role',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent"
          >
            Role
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="space-y-1">
            <Badge className={`${getRoleBadgeColor(user.userRole)} text-xs`}>
              <Shield className="h-3 w-3 mr-1" />
              {getRoleLabel(user.userRole)}
            </Badge>
            <div className="text-xs text-muted-foreground">
              {getTypeLabel(user.userType)}
            </div>
          </div>
        )
      }
    },
    {
      id: 'sppg',
      header: 'SPPG',
      cell: ({ row }) => {
        const user = row.original
        if (!user.sppg) {
          return <span className="text-sm text-muted-foreground">-</span>
        }
        return (
          <div className="flex items-start gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{user.sppg.name}</span>
              <span className="text-xs text-muted-foreground">{user.sppg.code}</span>
            </div>
          </div>
        )
      }
    },
    {
      id: 'contact',
      header: 'Contact',
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="space-y-1">
            {user.phone && (
              <div className="flex items-center gap-1 text-sm">
                <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{user.phone}</span>
              </div>
            )}
            {!user.phone && (
              <span className="text-sm text-muted-foreground">-</span>
            )}
          </div>
        )
      }
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const user = row.original
        const statusVariant = getUserStatusVariant(user.isActive, user.emailVerified, user.lockedUntil)
        const statusLabel = getUserStatusLabel(user.isActive, user.emailVerified, user.lockedUntil)
        
        return (
          <div className="space-y-1">
            <Badge variant={statusVariant}>
              {statusLabel}
            </Badge>
            {!user.emailVerified && (
              <div className="text-xs text-muted-foreground">
                Email unverified
              </div>
            )}
          </div>
        )
      }
    },
    {
      id: 'lastLogin',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent"
          >
            Last Login
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const user = row.original
        return (
          <span className="text-sm text-muted-foreground">
            {formatLastLogin(user.lastLoginAt)}
          </span>
        )
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const user = row.original
        const locked = isUserLocked(user.lockedUntil)
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/admin/users/${user.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/users/${user.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit User
                </Link>
              </DropdownMenuItem>
              {locked && (
                <DropdownMenuItem onClick={() => unlockAccount(user.id)}>
                  <Unlock className="mr-2 h-4 w-4" />
                  Unlock Account
                </DropdownMenuItem>
              )}
              {!user.emailVerified && (
                <DropdownMenuItem onClick={() => verifyEmail(user.id)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify Email
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {
                  if (confirm(`Delete ${formatUserDisplayName(user)}?`)) {
                    deleteUser(user.id)
                  }
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  const table = useReactTable({
    data: data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: data?.pagination.totalPages || 0,
    state: {
      sorting,
      pagination: {
        pageIndex: (filters.page || 1) - 1,
        pageSize: filters.limit || 20
      }
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater
      setSorting(newSorting)
      
      if (newSorting.length > 0) {
        const sort = newSorting[0]
        onFiltersChange({
          ...filters,
          sortBy: sort.id as 'createdAt' | 'name' | 'email' | 'lastLoginAt',
          sortOrder: sort.desc ? 'desc' : 'asc'
        })
      }
    },
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' 
        ? updater({ pageIndex: (filters.page || 1) - 1, pageSize: filters.limit || 20 })
        : updater
      
      onFiltersChange({
        ...filters,
        page: newPagination.pageIndex + 1,
        limit: newPagination.pageSize
      })
    }
  })

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-8 text-center">
        <p className="text-destructive font-medium">Failed to load users</p>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">No users found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Try adjusting your filters or create a new user
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
          {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
          {data.pagination.total} users
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onFiltersChange({ ...filters, page: 1 })}
            disabled={data.pagination.page === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onFiltersChange({ ...filters, page: data.pagination.page - 1 })}
            disabled={data.pagination.page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => onFiltersChange({ ...filters, page: data.pagination.page + 1 })}
            disabled={!data.pagination.hasMore}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onFiltersChange({ ...filters, page: data.pagination.totalPages })}
            disabled={!data.pagination.hasMore}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
