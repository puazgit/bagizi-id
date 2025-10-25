/**
 * Admin SPPG List Page
 * Displays list of all SPPG with filters and actions
 * 
 * @route /admin/sppg
 * @access Platform Admin (SUPERADMIN, SUPPORT, ANALYST)
 * 
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SppgList, SppgFilters } from '@/features/admin/sppg-management/components'
import { type SppgFilters as SppgFiltersType } from '@/features/admin/sppg-management/types'
import { Plus, Filter } from 'lucide-react'
import Link from 'next/link'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export default function SppgListPage() {
  const [filters, setFilters] = useState<SppgFiltersType>({
    page: 1,
    limit: 12,
    sortBy: 'name',
    sortOrder: 'asc',
  })
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  const handleFiltersChange = (newFilters: SppgFiltersType) => {
    setFilters(newFilters)
    setFilterSheetOpen(false)
  }

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sortBy: 'name',
      sortOrder: 'asc',
    })
    setFilterSheetOpen(false)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelola SPPG</h1>
          <p className="text-muted-foreground mt-1">
            Manajemen Satuan Pelayanan Pemenuhan Gizi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter SPPG</SheetTitle>
                <SheetDescription>
                  Gunakan filter untuk mencari SPPG tertentu
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <SppgFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onReset={handleResetFilters}
                />
              </div>
            </SheetContent>
          </Sheet>
          <Button asChild>
            <Link href="/admin/sppg/new">
              <Plus className="h-4 w-4 mr-2" />
              Tambah SPPG
            </Link>
          </Button>
        </div>
      </div>

      {/* SPPG List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar SPPG</CardTitle>
          <CardDescription>
            Kelola semua SPPG yang terdaftar di platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SppgList 
            filters={filters} 
            onFiltersChange={setFilters}
          />
        </CardContent>
      </Card>
    </div>
  )
}
