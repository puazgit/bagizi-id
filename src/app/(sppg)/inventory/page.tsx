/**
 * @fileoverview Inventory List Page - Main Inventory Management Page
 * @description Displays inventory items list with low stock alerts, filtering,
 * and quick actions. Primary entry point for inventory management.
 * 
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { Suspense } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Package } from 'lucide-react'

// Components
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { LowStockAlert, InventoryList } from '@/features/sppg/inventory/components'

export const metadata: Metadata = {
  title: 'Inventori | Bagizi-ID',
  description: 'Manajemen inventori barang dan bahan baku SPPG',
}

function InventoryListSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  )
}

export default function InventoryPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            Inventori
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola stok barang dan bahan baku SPPG
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/inventory/create">
            <Plus className="mr-2 h-5 w-5" />
            Tambah Barang
          </Link>
        </Button>
      </div>

      {/* Content */}
      <Suspense fallback={<InventoryListSkeleton />}>
        <div className="space-y-6">
          {/* Low Stock Alert */}
          <LowStockAlert />

          {/* Inventory List */}
          <InventoryList />
        </div>
      </Suspense>
    </div>
  )
}
