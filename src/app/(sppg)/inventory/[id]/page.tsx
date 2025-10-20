/**
 * @fileoverview Inventory Detail Page - Single Item Detail View
 * @description Displays comprehensive information about a single inventory item
 * including stock levels, movement history, and quick actions.
 * 
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// Components
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { InventoryCard } from '@/features/sppg/inventory/components'

interface InventoryDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Detail Inventori | Bagizi-ID',
    description: 'Detail informasi barang inventori',
  }
}

function InventoryCardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-96 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

export default async function InventoryDetailPage({ params }: InventoryDetailPageProps) {
  const { id } = await params

  // Validate ID format (basic CUID check)
  if (!id || id.length < 20) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/inventory">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Kembali ke Daftar</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Detail Barang
          </h1>
          <p className="text-muted-foreground mt-1">
            Informasi lengkap tentang barang inventori
          </p>
        </div>
      </div>

      {/* Content */}
      <Suspense fallback={<InventoryCardSkeleton />}>
        <InventoryCard itemId={id} />
      </Suspense>
    </div>
  )
}
