/**
 * @fileoverview Create Production Page
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * @route /production/new
 * 
 * MODULAR ARCHITECTURE:
 * - Thin wrapper page using feature components
 * - ProductionForm handles all logic & UI
 * - Server Component for optimal performance
 * - SEO optimization with metadata
 */

import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ArrowLeft, Lightbulb } from 'lucide-react'
import { ProductionForm } from '@/features/sppg/production/components'

export const metadata: Metadata = {
  title: 'Buat Produksi Baru | Bagizi-ID',
  description: 'Jadwalkan produksi makanan untuk program gizi',
}

/**
 * Create Production Page
 */
export default async function CreateProductionPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/production">Produksi</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Buat Baru</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Buat Produksi Baru</h1>
          <p className="text-muted-foreground mt-1">
            Jadwalkan produksi makanan dan tentukan detail pelaksanaan
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/production">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Link>
        </Button>
      </div>

      {/* Guidelines Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Panduan Membuat Produksi</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Pilih program nutrisi dan menu yang akan diproduksi</li>
            <li>Tentukan tanggal produksi dan jadwal waktu pelaksanaan</li>
            <li>Alokasikan jumlah porsi yang akan diproduksi</li>
            <li>Tentukan kepala koki dan tim produksi</li>
            <li>Sistem akan menghitung estimasi biaya berdasarkan menu</li>
            <li>Batch number akan digenerate otomatis dari tanggal</li>
            <li>Tetapkan target suhu untuk kontrol kualitas</li>
            <li>Produksi hanya dapat diedit ketika status masih PLANNED</li>
            <li>Lakukan quality check setelah memasak selesai</li>
          </ul>
        </CardContent>
      </Card>

      {/* Form */}
      <ProductionForm />
    </div>
  )
}
