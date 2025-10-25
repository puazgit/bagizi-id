/**
 * @fileoverview User Filters Component
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, X, Filter } from 'lucide-react'
import { UserRole, UserType } from '@prisma/client'
import { USER_ROLE_OPTIONS, USER_TYPE_OPTIONS } from '../types'
import type { UserFilters as UserFiltersType } from '../types'

interface UserFiltersProps {
  filters: UserFiltersType
  onFiltersChange: (filters: UserFiltersType) => void
  sppgOptions?: Array<{ id: string; name: string; code: string }>
}

/**
 * User Filters Component
 * Provides search and filtering capabilities for user list
 */
export function UserFilters({ filters, onFiltersChange, sppgOptions = [] }: UserFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '')
  const [localFilters, setLocalFilters] = useState<UserFiltersType>(filters)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        handleFilterChange({ search: searchValue || undefined })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchValue]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (updates: Partial<UserFiltersType>) => {
    const newFilters = { ...localFilters, ...updates, page: 1 }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleClearFilters = () => {
    const clearedFilters: UserFiltersType = {
      page: 1,
      limit: filters.limit || 20,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
    setSearchValue('')
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const activeFiltersCount = [
    filters.search,
    filters.userRole,
    filters.userType,
    filters.isActive !== undefined,
    filters.sppgId,
    filters.hasEmailVerified !== undefined
  ].filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {activeFiltersCount > 0 && (
          <Button variant="outline" onClick={handleClearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* User Role Filter */}
        <Select
          value={filters.userRole || 'all'}
          onValueChange={(value) => 
            handleFilterChange({ userRole: value === 'all' ? undefined : value as UserRole })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            
            {/* Platform Level */}
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Platform Level
            </div>
            {USER_ROLE_OPTIONS
              .filter(opt => opt.category === 'platform')
              .map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            
            {/* SPPG Management */}
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              SPPG Management
            </div>
            {USER_ROLE_OPTIONS
              .filter(opt => opt.category === 'sppg-management')
              .map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            
            {/* SPPG Operational */}
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              SPPG Operational
            </div>
            {USER_ROLE_OPTIONS
              .filter(opt => opt.category === 'sppg-operational')
              .map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            
            {/* SPPG Staff */}
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              SPPG Staff
            </div>
            {USER_ROLE_OPTIONS
              .filter(opt => opt.category === 'sppg-staff')
              .map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            
            {/* Limited Access */}
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Limited Access
            </div>
            {USER_ROLE_OPTIONS
              .filter(opt => opt.category === 'limited')
              .map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {/* User Type Filter */}
        <Select
          value={filters.userType || 'all'}
          onValueChange={(value) => 
            handleFilterChange({ userType: value === 'all' ? undefined : value as UserType })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {USER_TYPE_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={
            filters.isActive === undefined 
              ? 'all' 
              : filters.isActive 
                ? 'active' 
                : 'inactive'
          }
          onValueChange={(value) => 
            handleFilterChange({ 
              isActive: value === 'all' ? undefined : value === 'active' 
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* Email Verified Filter */}
        <Select
          value={
            filters.hasEmailVerified === undefined 
              ? 'all' 
              : filters.hasEmailVerified 
                ? 'verified' 
                : 'unverified'
          }
          onValueChange={(value) => 
            handleFilterChange({ 
              hasEmailVerified: value === 'all' ? undefined : value === 'verified' 
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Email" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Emails</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
          </SelectContent>
        </Select>

        {/* SPPG Filter */}
        {sppgOptions.length > 0 && (
          <Select
            value={filters.sppgId || 'all'}
            onValueChange={(value) => 
              handleFilterChange({ sppgId: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="SPPG" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All SPPG</SelectItem>
              {sppgOptions.map(sppg => (
                <SelectItem key={sppg.id} value={sppg.id}>
                  {sppg.name} ({sppg.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {filters.userRole && (
            <Badge variant="secondary" className="gap-1">
              Role: {USER_ROLE_OPTIONS.find(opt => opt.value === filters.userRole)?.label}
              <button
                onClick={() => handleFilterChange({ userRole: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.userType && (
            <Badge variant="secondary" className="gap-1">
              Type: {USER_TYPE_OPTIONS.find(opt => opt.value === filters.userType)?.label}
              <button
                onClick={() => handleFilterChange({ userType: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.isActive !== undefined && (
            <Badge variant="secondary" className="gap-1">
              {filters.isActive ? 'Active' : 'Inactive'}
              <button
                onClick={() => handleFilterChange({ isActive: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.hasEmailVerified !== undefined && (
            <Badge variant="secondary" className="gap-1">
              {filters.hasEmailVerified ? 'Verified' : 'Unverified'}
              <button
                onClick={() => handleFilterChange({ hasEmailVerified: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.sppgId && (
            <Badge variant="secondary" className="gap-1">
              SPPG: {sppgOptions.find(s => s.id === filters.sppgId)?.name}
              <button
                onClick={() => handleFilterChange({ sppgId: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
