/**
 * @fileoverview Stock Movements Page - Stock Movement History
 * @description Displays comprehensive stock movement history with filtering,
 * approval actions, and export functionality.
 * 
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { Suspense } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Activity } from 'lucide-react'

// Components
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StockMovementHistory } from '@/features/sppg/inventory/components'

export const metadata: Metadata = {
  title: 'Riwayat Pergerakan Stok | Bagizi-ID',
  description: 'Riwayat pergerakan stok barang inventori SPPG',
}

function StockMovementHistorySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  )
}

export default function StockMovementsPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            Riwayat Pergerakan Stok
          </h1>
          <p className="text-muted-foreground mt-1">
            Lacak semua pergerakan stok barang inventori
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/inventory">
            <Plus className="mr-2 h-5 w-5" />
            Catat Pergerakan
          </Link>
        </Button>
      </div>

      {/* Content */}
      <Suspense fallback={<StockMovementHistorySkeleton />}>
        <StockMovementHistory />
      </Suspense>
    </div>
  )
}
