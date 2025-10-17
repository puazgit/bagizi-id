/**
 * @fileoverview Food Production List Component with Filters
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
import { Search, Filter, X, ChefHat } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProductions } from '../hooks/useProductions'
import { ProductionCard } from './ProductionCard'
import type { ProductionFilters } from '../api/productionApi'
import type { FoodProduction } from '@prisma/client'
import Link from 'next/link'

// ============================================================================
// Types
// ============================================================================

interface ProductionListProps {
  className?: string
  initialFilters?: ProductionFilters
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
          <ChefHat className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">
            {hasFilters ? 'Tidak ada produksi ditemukan' : 'Belum ada Produksi'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {hasFilters
              ? 'Coba ubah filter pencarian Anda'
              : 'Mulai dengan membuat jadwal produksi pertama Anda untuk merencanakan produksi makanan'}
          </p>
          {hasFilters ? (
            <div className="flex justify-center mt-4">
              <Button variant="outline" onClick={onReset}>
                <X className="h-4 w-4 mr-2" />
                Reset Filter
              </Button>
            </div>
          ) : (
            <div className="flex justify-center mt-4">
              <Button asChild>
                <Link href="/production/new">
                  <ChefHat className="h-4 w-4 mr-2" />
                  Buat Produksi Baru
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Error State
 */
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="text-4xl mb-2">⚠️</div>
          <h3 className="text-lg font-semibold">Gagal memuat data produksi</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Terjadi kesalahan saat mengambil data. Silakan coba lagi.
          </p>
          <div className="flex justify-center mt-4">
            <Button variant="outline" onClick={onRetry}>
              Coba Lagi
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Main Component: Food Production List
 */
export function ProductionList({ className, initialFilters = {} }: ProductionListProps) {
  const [filters, setFilters] = useState<ProductionFilters>({
    page: 1,
    limit: 12,
    ...initialFilters,
  })

  const productionsQuery = useProductions(filters)
  const productions = productionsQuery.data || []
  const isLoading = productionsQuery.isLoading
  const isError = productionsQuery.isError
  const refetch = productionsQuery.refetch

  // Handle filter changes
  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value || undefined, page: 1 }))
  }

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value !== 'ALL' ? (value as 'PLANNED' | 'PREPARING' | 'COOKING' | 'QUALITY_CHECK' | 'COMPLETED' | 'CANCELLED') : undefined,
      page: 1,
    }))
  }

  const handleStartDateChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      startDate: value || undefined,
      page: 1,
    }))
  }

  const handleEndDateChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      endDate: value || undefined,
      page: 1,
    }))
  }

  const handleResetFilters = () => {
    setFilters({ page: 1, limit: 12 })
  }

  // Check if any filters are active
  const hasActiveFilters = Boolean(
    filters.search ||
      filters.status ||
      filters.startDate ||
      filters.endDate ||
      filters.menuId ||
      filters.programId
  )

  // Get active filter count
  const activeFilterCount = [
    filters.search,
    filters.status,
    filters.startDate,
    filters.endDate,
    filters.menuId,
    filters.programId,
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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari batch number atau menu..."
                  value={filters.search || ''}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Status Filter */}
              <Select
                value={filters.status || 'ALL'}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem value="PLANNED">Dijadwalkan</SelectItem>
                  <SelectItem value="PREPARING">Persiapan</SelectItem>
                  <SelectItem value="COOKING">Memasak</SelectItem>
                  <SelectItem value="QUALITY_CHECK">Quality Check</SelectItem>
                  <SelectItem value="COMPLETED">Selesai</SelectItem>
                  <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-2 lg:col-span-1">
                <Input
                  type="date"
                  placeholder="Dari tanggal"
                  value={filters.startDate || ''}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                />
              </div>
            </div>

            {/* Second Row - End Date */}
            {filters.startDate && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="lg:col-start-4">
                  <Input
                    type="date"
                    placeholder="Sampai tanggal"
                    value={filters.endDate || ''}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    min={filters.startDate}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && <LoadingSkeleton />}

      {/* Error State */}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {/* Productions Grid */}
      {!isLoading && !isError && productions && productions.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {productions.map((production) => (
            <ProductionCard 
              key={production.id} 
              production={production as FoodProduction & { 
                menu?: { id: string; menuName: string; menuCode: string; mealType: string } | null;
                program?: { id: string; programName: string } | null;
                _count?: { qualityChecks: number }
              }} 
              onDelete={() => refetch()} 
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && (!productions || productions.length === 0) && (
        <EmptyState hasFilters={hasActiveFilters} onReset={handleResetFilters} />
      )}

      {/* Results Count */}
      {!isLoading && !isError && productions && productions.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Menampilkan {productions.length} produksi
          {hasActiveFilters && ' (terfilter)'}
        </div>
      )}
    </div>
  )
}
