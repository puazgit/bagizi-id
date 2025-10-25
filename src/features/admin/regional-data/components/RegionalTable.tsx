/**
 * @fileoverview Regional Data Table Component
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  MapPin,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  ProvinceListItem,
  RegencyListItem,
  DistrictListItem,
  VillageListItem,
  PaginatedResponse,
} from '../types'
import { 
  getRegionLabel,
  getTimezoneLabel,
  getRegencyTypeLabel,
  getVillageTypeLabel
} from '../types'
import { formatRegionalCode, getShortRegionLabel } from '../lib'

/**
 * Regional entity union type
 */
type RegionalEntity = ProvinceListItem | RegencyListItem | DistrictListItem | VillageListItem

/**
 * Component props
 */
interface RegionalTableProps<T extends RegionalEntity> {
  /**
   * Regional level
   */
  level: 'province' | 'regency' | 'district' | 'village'
  
  /**
   * Table data
   */
  data?: PaginatedResponse<T>
  
  /**
   * Loading state
   */
  isLoading?: boolean
  
  /**
   * View handler
   */
  onView?: (id: string) => void
  
  /**
   * Edit handler
   */
  onEdit?: (id: string) => void
  
  /**
   * Delete handler
   */
  onDelete?: (id: string) => void
  
  /**
   * Page change handler
   */
  onPageChange?: (page: number) => void
  
  /**
   * Page size change handler
   */
  onPageSizeChange?: (size: number) => void
  
  /**
   * Show parent column
   * @default true
   */
  showParent?: boolean
  
  /**
   * Show counts column
   * @default true
   */
  showCounts?: boolean
  
  /**
   * Custom class name
   */
  className?: string
}

/**
 * Regional Table Component
 * 
 * Generic table for displaying regional data at any level
 * 
 * @example
 * ```tsx
 * <RegionalTable
 *   level="province"
 *   data={provincesData}
 *   isLoading={isLoading}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 * ```
 */
export function RegionalTable<T extends RegionalEntity>({
  level,
  data,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  onPageChange,
  showParent = true,
  showCounts = true,
  className,
}: RegionalTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(data?.pagination?.page ?? 1)

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn('rounded-md border', className)}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Skeleton className="h-4 w-16" /></TableHead>
              <TableHead><Skeleton className="h-4 w-32" /></TableHead>
              {showParent && <TableHead><Skeleton className="h-4 w-32" /></TableHead>}
              {showCounts && <TableHead><Skeleton className="h-4 w-20" /></TableHead>}
              <TableHead><Skeleton className="h-4 w-16" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                {showParent && <TableCell><Skeleton className="h-4 w-32" /></TableCell>}
                {showCounts && <TableCell><Skeleton className="h-4 w-12" /></TableCell>}
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  // Empty state
  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className={cn('rounded-md border p-8 text-center', className)}>
        <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">Tidak ada data</h3>
        <p className="text-sm text-muted-foreground">
          Belum ada data {getShortRegionLabel(level).toLowerCase()} yang ditambahkan.
        </p>
      </div>
    )
  }

  // Get parent column title based on level
  const getParentTitle = () => {
    switch (level) {
      case 'regency':
        return 'Provinsi'
      case 'district':
        return 'Kabupaten/Kota'
      case 'village':
        return 'Kecamatan'
      default:
        return ''
    }
  }

  // Get child count label based on level
  const getCountLabel = () => {
    switch (level) {
      case 'province':
        return 'Kab/Kota'
      case 'regency':
        return 'Kecamatan'
      case 'district':
        return 'Desa/Kel'
      default:
        return ''
    }
  }

  // Get parent name from item
  const getParentName = (item: T): string => {
    // Check in order of hierarchy (most specific parent first)
    if ('districtName' in item) return String(item.districtName || '')  // For villages
    if ('regencyName' in item) return String(item.regencyName || '')    // For districts
    if ('provinceName' in item) return String(item.provinceName || '')  // For regencies
    return ''
  }

  // Get child count from item
  const getChildCount = (item: T) => {
    if ('regencyCount' in item) return item.regencyCount
    if ('districtCount' in item) return item.districtCount
    if ('villageCount' in item) return item.villageCount
    return 0
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    onPageChange?.(page)
  }

  // Calculate pagination
  const totalPages = data?.pagination?.totalPages ?? 1
  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  return (
    <div className={cn('space-y-4', className)}>
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Kode</TableHead>
              <TableHead>Nama</TableHead>
              
              {/* Province-specific columns */}
              {level === 'province' && (
                <>
                  <TableHead className="w-[140px]">Region</TableHead>
                  <TableHead className="w-[100px]">Timezone</TableHead>
                </>
              )}
              
              {/* Regency-specific columns */}
              {level === 'regency' && (
                <TableHead className="w-[120px]">Tipe</TableHead>
              )}
              
              {/* Village-specific columns */}
              {level === 'village' && (
                <>
                  <TableHead className="w-[120px]">Tipe</TableHead>
                  <TableHead className="w-[100px]">Kode Pos</TableHead>
                </>
              )}
              
              {showParent && level !== 'province' && (
                <TableHead>{getParentTitle()}</TableHead>
              )}
              {showCounts && level !== 'village' && (
                <TableHead className="w-[100px] text-right">
                  {getCountLabel()}
                </TableHead>
              )}
              <TableHead className="w-[80px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((item: T) => (
              <TableRow key={item.id}>
                <TableCell>
                  <code className="rounded bg-muted px-2 py-1 text-xs font-mono">
                    {formatRegionalCode(item.code)}
                  </code>
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                
                {/* Province-specific cells */}
                {level === 'province' && 'region' in item && (
                  <>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {getRegionLabel(item.region)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {'timezone' in item && getTimezoneLabel(item.timezone)}
                      </Badge>
                    </TableCell>
                  </>
                )}
                
                {/* Regency-specific cells */}
                {level === 'regency' && 'type' in item && (
                  <TableCell>
                    <Badge variant={(item as RegencyListItem).type === 'CITY' ? 'default' : 'secondary'}>
                      {getRegencyTypeLabel((item as RegencyListItem).type)}
                    </Badge>
                  </TableCell>
                )}
                
                {/* Village-specific cells */}
                {level === 'village' && 'type' in item && (
                  <>
                    <TableCell>
                      <Badge variant={(item as VillageListItem).type === 'URBAN_VILLAGE' ? 'default' : 'secondary'}>
                        {getVillageTypeLabel((item as VillageListItem).type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {(item as VillageListItem).postalCode ? (
                        <code className="rounded bg-muted px-2 py-1 text-xs font-mono">
                          {(item as VillageListItem).postalCode}
                        </code>
                      ) : (
                        <span className="text-xs">-</span>
                      )}
                    </TableCell>
                  </>
                )}
                {showParent && level !== 'province' && (
                  <TableCell className="text-muted-foreground">
                    {getParentName(item) ?? '-'}
                  </TableCell>
                )}
                {showCounts && level !== 'village' && (
                  <TableCell className="text-right">
                    <Badge variant="secondary">
                      {getChildCount(item).toLocaleString('id-ID')}
                    </Badge>
                  </TableCell>
                )}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(item.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat Detail
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(item.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(item.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Menampilkan {((currentPage - 1) * (data?.pagination?.limit ?? 10)) + 1} - {Math.min(currentPage * (data?.pagination?.limit ?? 10), data?.pagination?.total ?? 0)} dari {data?.pagination?.total ?? 0} data
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(1)}
              disabled={!canGoPrevious}
            >
              <ChevronsLeft className="h-4 w-4" />
              <span className="sr-only">First page</span>
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!canGoPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">{currentPage}</span>
              <span className="text-sm text-muted-foreground">dari {totalPages}</span>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!canGoNext}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(totalPages)}
              disabled={!canGoNext}
            >
              <ChevronsRight className="h-4 w-4" />
              <span className="sr-only">Last page</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
