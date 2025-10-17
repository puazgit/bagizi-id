/**
 * @fileoverview Procurement Plan List Component with Filters
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProcurementPlans } from '../hooks/useProcurementPlans'
import { ProcurementPlanCard } from './ProcurementPlanCard'
import type { ProcurementPlanFilters } from '../api/planApi'
import type { ProcurementPlan } from '@prisma/client'

// ============================================================================
// Types
// ============================================================================

interface ProcurementPlanListProps {
  className?: string
  initialFilters?: ProcurementPlanFilters
}

// ============================================================================
// Helper Components
// ============================================================================

/**
 * Loading Skeleton
 */
function LoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-2 w-full" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/**
 * Empty State
 */
function EmptyState({ hasFilters, onReset }: { hasFilters: boolean; onReset: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="text-4xl mb-2">📋</div>
          <h3 className="text-lg font-semibold">
            {hasFilters ? 'Tidak ada rencana ditemukan' : 'Belum ada Rencana Pengadaan'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {hasFilters
              ? 'Coba ubah filter pencarian Anda'
              : 'Mulai dengan membuat rencana pengadaan pertama Anda untuk merencanakan budget dan target'}
          </p>
          {hasFilters && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" onClick={onReset}>
                <X className="h-4 w-4 mr-2" />
                Reset Filter
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Main Component: Procurement Plan List
 */
export function ProcurementPlanList({ className, initialFilters = {} }: ProcurementPlanListProps) {
  const [filters, setFilters] = useState<ProcurementPlanFilters>({
    page: 1,
    limit: 12,
    ...initialFilters,
  })

  const plansQuery = useProcurementPlans(filters)
  const plans = plansQuery.data || []
  const isLoading = plansQuery.isLoading
  const refetch = plansQuery.refetch

  // Handle filter changes
  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value || undefined, page: 1 }))
  }

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      approvalStatus: value !== 'all' ? value : undefined,
      page: 1,
    }))
  }

  const handleYearChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      planYear: value !== 'all' ? parseInt(value) : undefined,
      page: 1,
    }))
  }

  const handleQuarterChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      planQuarter: value !== 'all' ? parseInt(value) : undefined,
      page: 1,
    }))
  }

  const handleResetFilters = () => {
    setFilters({ page: 1, limit: 12 })
  }

  // Check if any filters are active
  const hasActiveFilters = Boolean(
    filters.search ||
      filters.approvalStatus ||
      filters.planMonth ||
      filters.planYear ||
      filters.planQuarter
  )

  // Get current year and generate year options
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i)

  // Get active filter count
  const activeFilterCount = [
    filters.search,
    filters.approvalStatus,
    filters.planMonth,
    filters.planYear,
    filters.planQuarter,
  ].filter(Boolean).length

  return (
    <div className={cn('space-y-6', className)}>
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter</span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary">{activeFilterCount} aktif</Badge>
                )}
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama rencana..."
                  value={filters.search || ''}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Status Filter */}
              <Select
                value={filters.approvalStatus || 'all'}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SUBMITTED">Menunggu</SelectItem>
                  <SelectItem value="APPROVED">Disetujui</SelectItem>
                  <SelectItem value="REJECTED">Ditolak</SelectItem>
                  <SelectItem value="REVISION">Revisi</SelectItem>
                </SelectContent>
              </Select>

              {/* Year Filter */}
              <Select
                value={filters.planYear?.toString() || 'all'}
                onValueChange={handleYearChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahun</SelectItem>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Quarter Filter */}
              <Select
                value={filters.planQuarter?.toString() || 'all'}
                onValueChange={handleQuarterChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kuartal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kuartal</SelectItem>
                  <SelectItem value="1">Q1 (Jan-Mar)</SelectItem>
                  <SelectItem value="2">Q2 (Apr-Jun)</SelectItem>
                  <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
                  <SelectItem value="4">Q4 (Okt-Des)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && <LoadingSkeleton />}

      {/* Plans Grid */}
      {!isLoading && plans && plans.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <ProcurementPlanCard 
              key={plan.id} 
              plan={plan as ProcurementPlan & { sppg?: { name: string } | null; program?: { name: string } | null }} 
              onDelete={() => refetch()} 
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!plans || plans.length === 0) && (
        <EmptyState hasFilters={hasActiveFilters} onReset={handleResetFilters} />
      )}

      {/* Results Count */}
      {!isLoading && plans && plans.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Menampilkan {plans.length} rencana pengadaan
          {hasActiveFilters && ' (terfilter)'}
        </div>
      )}
    </div>
  )
}
