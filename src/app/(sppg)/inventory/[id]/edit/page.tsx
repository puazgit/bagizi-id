/**
 * @fileoverview Inventory Edit Page - Item Edit Form
 * @description Form page for editing existing inventory items with
 * pre-populated data and validation.
 * 
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit } from 'lucide-react'

// Components
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { InventoryForm } from '@/features/sppg/inventory/components'

interface InventoryEditPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Edit Barang | Bagizi-ID',
    description: 'Edit informasi barang inventori',
  }
}

function InventoryFormSkeleton() {
  return (
    <div className="space-y-4 max-w-4xl">
      <Skeleton className="h-96 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}

export default async function InventoryEditPage({ params }: InventoryEditPageProps) {
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
          <Link href={`/inventory/${id}`}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Kembali ke Detail</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Edit className="h-7 w-7 text-primary" />
            Edit Barang
          </h1>
          <p className="text-muted-foreground mt-1">
            Perbarui informasi barang inventori
          </p>
        </div>
      </div>

      {/* Form */}
      <Suspense fallback={<InventoryFormSkeleton />}>
        <div className="max-w-4xl">
          <InventoryForm itemId={id} />
        </div>
      </Suspense>
    </div>
  )
}
