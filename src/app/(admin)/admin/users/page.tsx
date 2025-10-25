/**
 * @fileoverview User Management List Page
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Download } from 'lucide-react'
import { 
  UserStatistics, 
  UserFilters, 
  UserList 
} from '@/features/admin/user-management/components'
import type { UserFilters as UserFiltersType } from '@/features/admin/user-management/types'

/**
 * User Management Page
 * Main page for managing platform users
 */
export default function UsersPage() {
  const [filters, setFilters] = useState<UserFiltersType>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage all platform users, roles, and permissions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button asChild>
            <Link href="/admin/users/new">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Widget */}
      <UserStatistics />

      {/* Filters */}
      <UserFilters 
        filters={filters} 
        onFiltersChange={setFilters} 
      />

      {/* User List */}
      <UserList 
        filters={filters} 
        onFiltersChange={setFilters} 
      />
    </div>
  )
}
