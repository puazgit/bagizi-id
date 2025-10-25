/**
 * SPPG Filters Component
 * Filter sidebar for SPPG list
 * 
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { type SppgFilters as SppgFiltersType } from '../types'
import { X, Search, Filter } from 'lucide-react'

interface SppgFiltersProps {
  filters: SppgFiltersType
  onFiltersChange: (filters: SppgFiltersType) => void
  onReset: () => void
}

export function SppgFilters({
  filters,
  onFiltersChange,
  onReset,
}: SppgFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SppgFiltersType>(filters)

  const handleChange = (key: keyof SppgFiltersType, value: string | number | boolean | undefined) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
  }

  const handleApply = () => {
    onFiltersChange(localFilters)
  }

  const handleReset = () => {
    const emptyFilters: SppgFiltersType = {
      page: 1,
      limit: 10,
    }
    setLocalFilters(emptyFilters)
    onReset()
  }

  const activeFiltersCount = Object.entries(localFilters).filter(
    ([key, value]) => 
      value !== undefined && 
      value !== null && 
      value !== '' &&
      key !== 'page' &&
      key !== 'limit' &&
      key !== 'sortBy' &&
      key !== 'sortOrder'
  ).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-base">Filter</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 px-2"
            >
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Cari</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Nama, kode, email, PIC..."
              value={localFilters.search || ''}
              onChange={(e) => handleChange('search', e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Separator />

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={localFilters.status || 'all'}
            onValueChange={(value) => 
              handleChange('status', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="ACTIVE">Aktif</SelectItem>
              <SelectItem value="INACTIVE">Tidak Aktif</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
              <SelectItem value="PENDING_APPROVAL">Menunggu Persetujuan</SelectItem>
              <SelectItem value="REJECTED">Ditolak</SelectItem>
              <SelectItem value="TERMINATED">Dihentikan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Organization Type */}
        <div className="space-y-2">
          <Label htmlFor="organizationType">Jenis Organisasi</Label>
          <Select
            value={localFilters.organizationType || 'all'}
            onValueChange={(value) => 
              handleChange('organizationType', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger id="organizationType">
              <SelectValue placeholder="Semua Jenis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Jenis</SelectItem>
              <SelectItem value="PEMERINTAH">Pemerintah</SelectItem>
              <SelectItem value="SWASTA">Swasta</SelectItem>
              <SelectItem value="YAYASAN">Yayasan</SelectItem>
              <SelectItem value="KOMUNITAS">Komunitas</SelectItem>
              <SelectItem value="LAINNYA">Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Demo Account */}
        <div className="space-y-2">
          <Label htmlFor="isDemoAccount">Akun Demo</Label>
          <Select
            value={
              localFilters.isDemoAccount === undefined 
                ? 'all' 
                : localFilters.isDemoAccount 
                  ? 'true' 
                  : 'false'
            }
            onValueChange={(value) => 
              handleChange(
                'isDemoAccount', 
                value === 'all' ? undefined : value === 'true'
              )
            }
          >
            <SelectTrigger id="isDemoAccount">
              <SelectValue placeholder="Semua" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="true">Demo</SelectItem>
              <SelectItem value="false">Produksi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Sort By */}
        <div className="space-y-2">
          <Label htmlFor="sortBy">Urutkan Berdasarkan</Label>
          <Select
            value={localFilters.sortBy || 'name'}
            onValueChange={(value) => handleChange('sortBy', value)}
          >
            <SelectTrigger id="sortBy">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nama</SelectItem>
              <SelectItem value="code">Kode</SelectItem>
              <SelectItem value="createdAt">Tanggal Dibuat</SelectItem>
              <SelectItem value="targetRecipients">Target Penerima</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Order */}
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Urutan</Label>
          <Select
            value={localFilters.sortOrder || 'asc'}
            onValueChange={(value) => handleChange('sortOrder', value)}
          >
            <SelectTrigger id="sortOrder">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">A-Z / Terkecil-Terbesar</SelectItem>
              <SelectItem value="desc">Z-A / Terbesar-Terkecil</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Apply Button */}
        <Button 
          onClick={handleApply} 
          className="w-full"
          disabled={JSON.stringify(filters) === JSON.stringify(localFilters)}
        >
          Terapkan Filter
        </Button>
      </CardContent>
    </Card>
  )
}
