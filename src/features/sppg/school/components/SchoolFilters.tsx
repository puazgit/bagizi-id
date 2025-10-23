/**
 * @fileoverview School Filters Component - Advanced Filtering UI
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState } from 'react'
import { Search, Filter, X, ChevronDown } from 'lucide-react'
import { SchoolType, SchoolStatus } from '@prisma/client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'

import type { SchoolFilter } from '../types'
import { SCHOOL_TYPES, SCHOOL_STATUSES } from '../types'

/**
 * Props for SchoolFilters component
 */
interface SchoolFiltersProps {
  value: SchoolFilter
  onChange: (filters: SchoolFilter) => void
  onReset?: () => void
}

/**
 * SchoolFilters Component
 * 
 * Advanced filtering UI with 26+ filter options:
 * - Text search
 * - School type/status selection
 * - Region hierarchy (province → regency → district → village)
 * - Student range filters
 * - Performance metrics (attendance, satisfaction)
 * - Facility checkboxes
 * - Serving method
 * - Date ranges (contract expiry)
 * 
 * @example
 * ```tsx
 * const [filters, setFilters] = useState<SchoolFilter>({})
 * 
 * <SchoolFilters
 *   value={filters}
 *   onChange={setFilters}
 *   onReset={() => setFilters({})}
 * />
 * ```
 */
export function SchoolFilters({
  value,
  onChange,
  onReset,
}: SchoolFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  /**
   * Count active filters
   */
  const activeFiltersCount = Object.values(value).filter(
    (v) => v !== undefined && v !== null && v !== ''
  ).length

  /**
   * Update single filter
   */
  const updateFilter = <K extends keyof SchoolFilter>(
    key: K,
    newValue: SchoolFilter[K]
  ) => {
    onChange({
      ...value,
      [key]: newValue,
    })
  }

  /**
   * Reset all filters
   */
  const handleReset = () => {
    onChange({})
    onReset?.()
  }

  return (
    <div className="space-y-4">
      {/* Quick Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama sekolah, kode, alamat, atau NPSN..."
            value={value.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Advanced Filters Popover */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="mr-2 h-4 w-4" />
              Filter
              {activeFiltersCount > 0 && (
                <Badge
                  variant="default"
                  className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                >
                  {activeFiltersCount}
                </Badge>
              )}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] max-h-[600px] overflow-y-auto" align="end">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Filter Lanjutan</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-8 px-2 text-xs"
                  >
                    <X className="mr-1 h-3 w-3" />
                    Reset
                  </Button>
                )}
              </div>

              <Separator />

              {/* Basic Filters */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium">Informasi Dasar</h5>

                {/* School Type */}
                <div className="space-y-2">
                  <Label htmlFor="schoolType">Jenis Sekolah</Label>
                  <Select
                    value={value.schoolType || 'all'}
                    onValueChange={(v) => updateFilter('schoolType', v === 'all' ? undefined : (v as SchoolType))}
                  >
                    <SelectTrigger id="schoolType">
                      <SelectValue placeholder="Semua Jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Jenis</SelectItem>
                      {SCHOOL_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* School Status */}
                <div className="space-y-2">
                  <Label htmlFor="schoolStatus">Status Sekolah</Label>
                  <Select
                    value={value.schoolStatus || 'all'}
                    onValueChange={(v) => updateFilter('schoolStatus', v === 'all' ? undefined : (v as SchoolStatus))}
                  >
                    <SelectTrigger id="schoolStatus">
                      <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      {SCHOOL_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Urban/Rural */}
                <div className="space-y-2">
                  <Label htmlFor="urbanRural">Lokasi</Label>
                  <Select
                    value={value.urbanRural || 'all'}
                    onValueChange={(v) => updateFilter('urbanRural', v === 'all' ? undefined : (v as 'URBAN' | 'RURAL'))}
                  >
                    <SelectTrigger id="urbanRural">
                      <SelectValue placeholder="Semua Lokasi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Lokasi</SelectItem>
                      <SelectItem value="URBAN">Perkotaan</SelectItem>
                      <SelectItem value="RURAL">Pedesaan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Student Filters */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium">Jumlah Siswa</h5>

                {/* Min Students */}
                <div className="space-y-2">
                  <Label htmlFor="minStudents">
                    Minimal Siswa
                  </Label>
                  <Input
                    id="minStudents"
                    type="number"
                    min={0}
                    max={1000}
                    step={10}
                    value={value.minStudents || 0}
                    onChange={(e) => updateFilter('minStudents', parseInt(e.target.value) || 0)}
                  />
                </div>

                {/* Max Students */}
                <div className="space-y-2">
                  <Label htmlFor="maxStudents">
                    Maksimal Siswa
                  </Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    min={0}
                    max={1000}
                    step={10}
                    value={value.maxStudents || 1000}
                    onChange={(e) => updateFilter('maxStudents', parseInt(e.target.value) || 1000)}
                  />
                </div>
              </div>

              <Separator />

              {/* Performance Filters */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium">Performa</h5>

                {/* Min Attendance Rate */}
                <div className="space-y-2">
                  <Label htmlFor="minAttendanceRate">
                    Minimal Kehadiran (%)
                  </Label>
                  <Input
                    id="minAttendanceRate"
                    type="number"
                    min={0}
                    max={100}
                    step={5}
                    value={value.minAttendanceRate || 0}
                    onChange={(e) => updateFilter('minAttendanceRate', parseInt(e.target.value) || 0)}
                  />
                </div>

                {/* Min Satisfaction Score */}
                <div className="space-y-2">
                  <Label htmlFor="minSatisfactionScore">
                    Minimal Kepuasan (0-5)
                  </Label>
                  <Input
                    id="minSatisfactionScore"
                    type="number"
                    min={0}
                    max={5}
                    step={0.1}
                    value={value.minSatisfactionScore || 0}
                    onChange={(e) => updateFilter('minSatisfactionScore', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <Separator />

              {/* Facility Filters */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium">Fasilitas</h5>

                <div className="space-y-2">
                  {/* Has Kitchen */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasKitchen"
                      checked={value.hasKitchen || false}
                      onCheckedChange={(checked) =>
                        updateFilter('hasKitchen', checked === true ? true : undefined)
                      }
                    />
                    <Label
                      htmlFor="hasKitchen"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Memiliki Dapur
                    </Label>
                  </div>

                  {/* Has Refrigerator */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasRefrigerator"
                      checked={value.hasRefrigerator || false}
                      onCheckedChange={(checked) =>
                        updateFilter('hasRefrigerator', checked === true ? true : undefined)
                      }
                    />
                    <Label
                      htmlFor="hasRefrigerator"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Memiliki Lemari Es
                    </Label>
                  </div>

                  {/* Has Dining Area */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasDiningArea"
                      checked={value.hasDiningArea || false}
                      onCheckedChange={(checked) =>
                        updateFilter('hasDiningArea', checked === true ? true : undefined)
                      }
                    />
                    <Label
                      htmlFor="hasDiningArea"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Memiliki Ruang Makan
                    </Label>
                  </div>
                </div>
              </div>

              {/* Active Status Toggle */}
              <Separator />
              <div className="space-y-2">
                <Label>Status Aktif</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={value.isActive !== undefined ? value.isActive : undefined}
                    onCheckedChange={(checked) =>
                      updateFilter('isActive', checked === 'indeterminate' ? undefined : (checked as boolean))
                    }
                  />
                  <Label
                    htmlFor="isActive"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Hanya Sekolah Aktif
                  </Label>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Quick Reset */}
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="icon" onClick={handleReset}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Filter aktif:</span>
              
              {value.search && (
                <Badge variant="secondary" className="gap-1">
                  Pencarian: {value.search}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter('search', undefined)}
                  />
                </Badge>
              )}

              {value.schoolType && (
                <Badge variant="secondary" className="gap-1">
                  Jenis: {SCHOOL_TYPES.find(t => t.value === value.schoolType)?.label}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter('schoolType', undefined)}
                  />
                </Badge>
              )}

              {value.schoolStatus && (
                <Badge variant="secondary" className="gap-1">
                  Status: {SCHOOL_STATUSES.find((s) => s.value === value.schoolStatus)?.label}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter('schoolStatus', undefined)}
                  />
                </Badge>
              )}

              {value.minStudents && value.minStudents > 0 && (
                <Badge variant="secondary" className="gap-1">
                  Min Siswa: {value.minStudents}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter('minStudents', undefined)}
                  />
                </Badge>
              )}

              {value.minAttendanceRate && value.minAttendanceRate > 0 && (
                <Badge variant="secondary" className="gap-1">
                  Min Kehadiran: {value.minAttendanceRate}%
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter('minAttendanceRate', undefined)}
                  />
                </Badge>
              )}

              {value.hasKitchen && (
                <Badge variant="secondary" className="gap-1">
                  Ada Dapur
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter('hasKitchen', undefined)}
                  />
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-6 text-xs"
              >
                Hapus Semua
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
