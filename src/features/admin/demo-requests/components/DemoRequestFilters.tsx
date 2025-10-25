/**
 * @fileoverview Demo Request Filters Component - Filter sidebar
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/ADMIN_DEMO_REQUESTS_FRONTEND_FOUNDATION_COMPLETE.md} Foundation Documentation
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import {
  Filter,
  X,
  Calendar as CalendarIcon,
  Search,
  RefreshCw,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { demoRequestFiltersSchema, type DemoRequestFilters } from '../schemas/demo-request.schema'
import { DemoRequestStatus, OrganizationType } from '@prisma/client'

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

interface DemoRequestFiltersProps {
  /**
   * Current filter values
   */
  filters?: Partial<DemoRequestFilters>

  /**
   * Callback when filters change
   */
  onFiltersChange: (filters: DemoRequestFilters) => void

  /**
   * Show compact view
   * @default false
   */
  compact?: boolean

  /**
   * Show reset button
   * @default true
   */
  showReset?: boolean

  /**
   * Show apply button
   * @default false
   */
  showApply?: boolean

  /**
   * Additional CSS classes
   */
  className?: string
}

interface FilterStats {
  activeCount: number
  hasSearch: boolean
  hasStatus: boolean
  hasOrgType: boolean
  hasDateRange: boolean
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get status label in Indonesian
 */
function getStatusLabel(status: DemoRequestStatus): string {
  const labels: Record<DemoRequestStatus, string> = {
    SUBMITTED: 'Dikirim',
    UNDER_REVIEW: 'Dalam Review',
    APPROVED: 'Disetujui',
    REJECTED: 'Ditolak',
    DEMO_ACTIVE: 'Demo Aktif',
    EXPIRED: 'Kadaluarsa',
    CONVERTED: 'Terkonversi',
    CANCELLED: 'Dibatalkan',
  }
  return labels[status]
}

/**
 * Get organization type label in Indonesian
 */
function getOrgTypeLabel(type: OrganizationType): string {
  const labels: Record<OrganizationType, string> = {
    PEMERINTAH: 'Pemerintah',
    SWASTA: 'Swasta',
    YAYASAN: 'Yayasan',
    KOMUNITAS: 'Komunitas',
    LAINNYA: 'Lainnya',
  }
  return labels[type]
}

/**
 * Calculate filter statistics
 */
function getFilterStats(filters: Partial<DemoRequestFilters>): FilterStats {
  let activeCount = 0
  
  const hasSearch = Boolean(filters.search?.trim())
  const hasStatus = Boolean(filters.status)
  const hasOrgType = Boolean(filters.organizationType)
  const hasDateRange = Boolean(filters.startDate || filters.endDate)

  if (hasSearch) activeCount++
  if (hasStatus) activeCount++
  if (hasOrgType) activeCount++
  if (hasDateRange) activeCount++
  if (filters.assignedTo) activeCount++
  if (filters.isConverted !== undefined) activeCount++

  return {
    activeCount,
    hasSearch,
    hasStatus,
    hasOrgType,
    hasDateRange,
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * DemoRequestFilters - Filter sidebar component
 *
 * Features:
 * - Search input
 * - Status filter (single select)
 * - Organization type filter (single select)
 * - Demo type filter (checkboxes)
 * - Date range picker (start/end)
 * - Assigned to filter
 * - Conversion status filter
 * - Reset filters button
 * - Apply filters button (optional)
 * - Active filter count badge
 * - Real-time or on-apply filtering
 *
 * @example
 * ```tsx
 * <DemoRequestFilters
 *   filters={currentFilters}
 *   onFiltersChange={(filters) => {
 *     setFilters(filters)
 *     refetch()
 *   }}
 *   showApply={true}
 * />
 * ```
 */
export function DemoRequestFilters({
  filters = {},
  onFiltersChange,
  compact = false,
  showReset = true,
  showApply = false,
  className,
}: DemoRequestFiltersProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.startDate ? new Date(filters.startDate) : undefined
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters.endDate ? new Date(filters.endDate) : undefined
  )
  const [localFilters, setLocalFilters] = useState<Partial<DemoRequestFilters>>(filters)
  const isFirstRender = useRef(true)
  const isUpdatingFromProps = useRef(false)

  const stats = getFilterStats(localFilters)

  // Update local state when external filters change
  useEffect(() => {
    // Skip on first render to avoid infinite loop
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    
    // Mark that we're updating from props to prevent triggering onFiltersChange
    isUpdatingFromProps.current = true
    setLocalFilters(filters)
    if (filters.startDate) setStartDate(new Date(filters.startDate))
    if (filters.endDate) setEndDate(new Date(filters.endDate))
    
    // Reset flag after state update
    setTimeout(() => {
      isUpdatingFromProps.current = false
    }, 0)
  }, [filters])

  // Auto-apply filters if showApply is false
  useEffect(() => {
    // Skip on first render or when updating from props
    if (isFirstRender.current || isUpdatingFromProps.current) {
      return
    }
    
    if (!showApply) {
      const validated = demoRequestFiltersSchema.safeParse(localFilters)
      if (validated.success) {
        // Use JSON.stringify to compare objects and prevent infinite loop
        const currentFiltersStr = JSON.stringify(filters)
        const newFiltersStr = JSON.stringify(validated.data)
        
        if (currentFiltersStr !== newFiltersStr) {
          onFiltersChange(validated.data)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localFilters, showApply])

  const applyFilters = () => {
    const validated = demoRequestFiltersSchema.safeParse(localFilters)
    if (validated.success) {
      onFiltersChange(validated.data)
    }
  }

  const handleReset = () => {
    const emptyFilters: DemoRequestFilters = {}
    setLocalFilters(emptyFilters)
    setStartDate(undefined)
    setEndDate(undefined)
    onFiltersChange(emptyFilters)
  }

  const updateFilter = (key: keyof DemoRequestFilters, value: string | boolean | undefined) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const removeFilter = (key: keyof DemoRequestFilters) => {
    setLocalFilters((prev) => {
      const updated = { ...prev }
      delete updated[key]
      return updated
    })
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filter Header with Active Count and Reset */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Filters</h3>
          {stats.activeCount > 0 && (
            <Badge variant="secondary" className="h-5 px-2 text-xs">
              {stats.activeCount} active
            </Badge>
          )}
        </div>
        {showReset && stats.activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 px-2 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Filters Grid - Compact Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="md:col-span-2">
          <Label htmlFor="search" className="text-xs font-medium mb-1.5 block">
            Search
          </Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search organization, email, PIC..."
              value={localFilters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="h-9 pl-8 text-sm"
            />
            {localFilters.search && (
              <button
                onClick={() => removeFilter('search')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <Label htmlFor="status" className="text-xs font-medium mb-1.5 block">
            Status
          </Label>
          <Select
            value={localFilters.status || 'all'}
            onValueChange={(value) =>
              value === 'all'
                ? removeFilter('status')
                : updateFilter('status', value as DemoRequestStatus)
            }
          >
            <SelectTrigger id="status" className="h-9 text-sm">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.values(DemoRequestStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {getStatusLabel(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Organization Type Filter */}
        <div>
          <Label htmlFor="orgType" className="text-xs font-medium mb-1.5 block">
            Organization Type
          </Label>
          <Select
            value={localFilters.organizationType || 'all'}
            onValueChange={(value) =>
              value === 'all'
                ? removeFilter('organizationType')
                : updateFilter('organizationType', value as OrganizationType)
            }
          >
            <SelectTrigger id="orgType" className="h-9 text-sm">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.values(OrganizationType).map((type) => (
                <SelectItem key={type} value={type}>
                  {getOrgTypeLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced Filters - Collapsible */}
      {(startDate || endDate || localFilters.isConverted !== undefined) && (
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-xs font-medium text-muted-foreground">Advanced Filters</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Date Range - Compact */}
            <div className="md:col-span-2 flex gap-2">
              {/* Start Date */}
              <div className="flex-1">
                <Label htmlFor="startDate" className="text-xs font-medium mb-1.5 block">
                  From Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="startDate"
                      variant="outline"
                      className={cn(
                        'w-full h-9 justify-start text-left font-normal text-sm',
                        !startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {startDate ? format(startDate, 'PP', { locale: idLocale }) : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date)
                        updateFilter('startDate', date?.toISOString())
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="flex-1">
                <Label htmlFor="endDate" className="text-xs font-medium mb-1.5 block">
                  To Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="endDate"
                      variant="outline"
                      className={cn(
                        'w-full h-9 justify-start text-left font-normal text-sm',
                        !endDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {endDate ? format(endDate, 'PP', { locale: idLocale }) : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date)
                        updateFilter('endDate', date?.toISOString())
                      }}
                      initialFocus
                      disabled={(date) => startDate ? date < startDate : false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Conversion Status */}
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Conversion Status</Label>
              <div className="flex items-center gap-2 h-9">
                <Button
                  variant={localFilters.isConverted === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (localFilters.isConverted === true) {
                      removeFilter('isConverted')
                    } else {
                      updateFilter('isConverted', true)
                    }
                  }}
                  className="h-9 flex-1 text-xs"
                >
                  Converted
                </Button>
                <Button
                  variant={localFilters.isConverted === false ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (localFilters.isConverted === false) {
                      removeFilter('isConverted')
                    } else {
                      updateFilter('isConverted', false)
                    }
                  }}
                  className="h-9 flex-1 text-xs"
                >
                  Not Converted
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Button (optional) */}
      {showApply && (
        <div className="pt-3 border-t">
          <Button onClick={applyFilters} className="w-full h-9" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Terapkan Filter
          </Button>
        </div>
      )}

      {/* Active Filters Summary */}
      {stats.activeCount > 0 && !compact && (
        <div className="pt-3 border-t space-y-2">
          <Label className="text-xs text-muted-foreground">
            Filter Aktif ({stats.activeCount})
          </Label>
          <div className="flex flex-wrap gap-2">
            {stats.hasSearch && (
              <Badge variant="secondary" className="gap-1 h-6 text-xs">
                Pencarian
                <button
                  onClick={() => removeFilter('search')}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {stats.hasStatus && (
              <Badge variant="secondary" className="gap-1 h-6 text-xs">
                Status
                <button
                  onClick={() => removeFilter('status')}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {stats.hasOrgType && (
              <Badge variant="secondary" className="gap-1 h-6 text-xs">
                Tipe Org
                <button
                  onClick={() => removeFilter('organizationType')}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {stats.hasDateRange && (
              <Badge variant="secondary" className="gap-1 h-6 text-xs">
                Tanggal
                <button
                  onClick={() => {
                    setStartDate(undefined)
                    setEndDate(undefined)
                    removeFilter('startDate')
                    removeFilter('endDate')
                  }}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
