/**
 * @fileoverview Regional Filters Component
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CascadeSelect, type CascadeValue } from './CascadeSelect'
import type { RegionalFilters as RegionalFiltersType } from '../types'

/**
 * Component props
 */
interface RegionalFiltersProps {
  /**
   * Current filters
   */
  filters: RegionalFiltersType
  
  /**
   * Callback when filters change
   */
  onChange: (filters: RegionalFiltersType) => void
  
  /**
   * Regional level (determines which cascade levels to show)
   */
  level: 'province' | 'regency' | 'district' | 'village'
  
  /**
   * Show search input
   * @default true
   */
  showSearch?: boolean
  
  /**
   * Show cascade filters
   * @default true
   */
  showCascade?: boolean
  
  /**
   * Show sort controls
   * @default true
   */
  showSort?: boolean
  
  /**
   * Show clear button
   * @default true
   */
  showClear?: boolean
  
  /**
   * Custom class name
   */
  className?: string
}

/**
 * Regional Filters Component
 * 
 * Search and filter controls for regional data tables
 * 
 * @example
 * ```tsx
 * const [filters, setFilters] = useState<RegionalFiltersType>({
 *   search: '',
 *   sortBy: 'code',
 *   sortOrder: 'asc'
 * })
 * 
 * <RegionalFilters
 *   filters={filters}
 *   onChange={setFilters}
 *   level="district"
 * />
 * ```
 */
export function RegionalFilters({
  filters,
  onChange,
  level,
  showSearch = true,
  showCascade = true,
  showSort = true,
  showClear = true,
  className,
}: RegionalFiltersProps) {
  // Local search state for debouncing
  const [searchInput, setSearchInput] = useState(filters.search || '')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onChange({ ...filters, search: searchInput })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchInput, filters, onChange])

  // Sync local state when external filters change
  useEffect(() => {
    if (filters.search !== undefined && filters.search !== searchInput) {
      setSearchInput(filters.search)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search])

  // Handle cascade change
  const handleCascadeChange = useCallback((cascade: CascadeValue) => {
    onChange({
      ...filters,
      provinceId: cascade.provinceId,
      regencyId: cascade.regencyId,
      districtId: cascade.districtId,
    })
  }, [filters, onChange])

  // Handle sort by change
  const handleSortByChange = (sortBy: 'code' | 'name') => {
    onChange({ ...filters, sortBy })
  }

  // Handle sort order change
  const handleSortOrderChange = (sortOrder: 'asc' | 'desc') => {
    onChange({ ...filters, sortOrder })
  }

  // Clear all filters
  const handleClear = () => {
    setSearchInput('')
    onChange({
      search: '',
      provinceId: undefined,
      regencyId: undefined,
      districtId: undefined,
      sortBy: 'code',
      sortOrder: 'asc',
      page: 1,
      limit: filters.limit,
    })
  }

  // Check if any filter is active
  const hasActiveFilters = 
    searchInput.length > 0 ||
    filters.provinceId ||
    filters.regencyId ||
    filters.districtId

  // Determine which cascade levels to show based on current level
  const cascadeMaxLevel = (() => {
    switch (level) {
      case 'province':
        return undefined // No cascade for province level
      case 'regency':
        return 'province' as const
      case 'district':
        return 'regency' as const
      case 'village':
        return 'district' as const
    }
  })()

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Sort Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        {/* Search Input */}
        {showSearch && (
          <div className="flex-1 space-y-2">
            <Label htmlFor="search-input">Cari</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search-input"
                type="text"
                placeholder="Cari berdasarkan nama atau kode..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchInput && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchInput('')}
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Sort Controls */}
        {showSort && (
          <div className="flex gap-2">
            <div className="space-y-2">
              <Label htmlFor="sort-by">Urutkan</Label>
              <Select
                value={filters.sortBy || 'code'}
                onValueChange={(value) => handleSortByChange(value as 'code' | 'name')}
              >
                <SelectTrigger id="sort-by" className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="code">Kode</SelectItem>
                  <SelectItem value="name">Nama</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort-order">Arah</Label>
              <Select
                value={filters.sortOrder || 'asc'}
                onValueChange={(value) => handleSortOrderChange(value as 'asc' | 'desc')}
              >
                <SelectTrigger id="sort-order" className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">A-Z / 0-9</SelectItem>
                  <SelectItem value="desc">Z-A / 9-0</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Clear Button */}
        {showClear && hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            className="shrink-0"
          >
            <X className="mr-2 h-4 w-4" />
            Reset Filter
          </Button>
        )}
      </div>

      {/* Cascade Filters */}
      {showCascade && cascadeMaxLevel && (
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span>Filter berdasarkan wilayah</span>
          </div>
          
          <CascadeSelect
            value={{
              provinceId: filters.provinceId,
              regencyId: filters.regencyId,
              districtId: filters.districtId,
            }}
            onChange={handleCascadeChange}
            maxLevel={cascadeMaxLevel}
            layout="horizontal"
            showLabels
            showClear
            showCounts
          />
        </div>
      )}
    </div>
  )
}

/**
 * Compact version without labels (for smaller spaces)
 */
export function RegionalFiltersCompact(props: Omit<RegionalFiltersProps, 'showSort'>) {
  return <RegionalFilters {...props} showSort={false} />
}
