/**
 * @fileoverview Create Procurement Plan Page
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * @route /procurement/plans/new
 * 
 * MODULAR ARCHITECTURE:
 * - Thin wrapper page using feature components
 * - ProcurementPlanForm handles all logic & UI
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
import { ProcurementPlanForm } from '@/features/sppg/procurement/components'

export const metadata: Metadata = {
  title: 'Buat Rencana Pengadaan Baru | Bagizi-ID',
  description: 'Buat rencana budget dan target pengadaan bulanan',
}

/**
 * Create Procurement Plan Page
 */
export default async function CreateProcurementPlanPage() {
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
              <Link href="/procurement">Pengadaan</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/procurement/plans">Rencana Pengadaan</Link>
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
          <h1 className="text-3xl font-bold">Buat Rencana Pengadaan Baru</h1>
          <p className="text-muted-foreground mt-1">
            Rencanakan budget dan target pengadaan untuk periode tertentu
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/procurement/plans">
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
            <CardTitle className="text-lg">Panduan Membuat Rencana</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Tentukan periode perencanaan (bulan, tahun, kuartal)</li>
            <li>Alokasikan total budget yang tersedia</li>
            <li>Bagi budget ke kategori (Protein, Karbohidrat, Sayuran, Buah, Lainnya)</li>
            <li>Tetapkan target penerima dan jumlah makanan</li>
            <li>Sistem akan menghitung biaya per porsi secara otomatis</li>
            <li>Simpan sebagai Draft terlebih dahulu sebelum mengajukan</li>
            <li>Rencana yang sudah disetujui dapat digunakan untuk membuat pengadaan</li>
          </ul>
        </CardContent>
      </Card>

      {/* Form */}
      <ProcurementPlanForm />
    </div>
  )
}
