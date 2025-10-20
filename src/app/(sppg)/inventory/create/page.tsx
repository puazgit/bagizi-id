/**
 * @fileoverview Inventory Create Page - New Item Creation Form
 * @description Form page for adding new inventory items with comprehensive
 * validation and immediate feedback.
 * 
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'

// Components
import { Button } from '@/components/ui/button'
import { InventoryForm } from '@/features/sppg/inventory/components'

export const metadata: Metadata = {
  title: 'Tambah Barang Baru | Bagizi-ID',
  description: 'Tambah barang baru ke inventori SPPG',
}

export default function InventoryCreatePage() {
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
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Plus className="h-7 w-7 text-primary" />
            Tambah Barang Baru
          </h1>
          <p className="text-muted-foreground mt-1">
            Isi informasi barang yang akan ditambahkan ke inventori
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl">
        <InventoryForm />
      </div>
    </div>
  )
}
