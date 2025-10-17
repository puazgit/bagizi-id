/**
 * @fileoverview Edit Production Page
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * @route /production/[id]/edit
 * 
 * MODULAR ARCHITECTURE:
 * - Thin wrapper page using feature components
 * - ProductionForm handles all logic & UI
 * - Server-side data validation
 * - Edit restrictions (only PLANNED status)
 * - SEO optimization with metadata
 */

import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { canManageProduction } from '@/lib/permissions'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { ProductionForm } from '@/features/sppg/production/components'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const session = await auth()
  if (!session?.user?.sppgId) {
    return { title: 'Edit Produksi | Bagizi-ID' }
  }

  const production = await db.foodProduction.findFirst({
    where: {
      id: params.id,
      sppgId: session.user.sppgId,
    },
    select: {
      batchNumber: true,
    },
  })

  return {
    title: production ? `Edit ${production.batchNumber} | Bagizi-ID` : 'Edit Produksi | Bagizi-ID',
    description: 'Edit jadwal dan detail produksi makanan',
  }
}

/**
 * Edit Production Page
 */
export default async function EditProductionPage({ params }: { params: { id: string } }) {
  // Auth check
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  // Permission check
  if (!session.user.userRole || !canManageProduction(session.user.userRole)) {
    redirect('/dashboard')
  }

  // Multi-tenant check
  if (!session.user.sppgId) {
    redirect('/dashboard')
  }

  // Fetch production with multi-tenant isolation
  const production = await db.foodProduction.findFirst({
    where: {
      id: params.id,
      sppgId: session.user.sppgId,
    },
    include: {
      program: true,
      menu: true,
    },
  })

  if (!production) {
    notFound()
  }

  // Redirect if status is not PLANNED
  if (production.status !== 'PLANNED') {
    redirect(`/production/${production.id}`)
  }

  // Check if production is approaching (within 24 hours)
  const now = new Date()
  const productionTime = new Date(production.plannedStartTime)
  const hoursUntilProduction = (productionTime.getTime() - now.getTime()) / (1000 * 60 * 60)
  const isApproaching = hoursUntilProduction <= 24 && hoursUntilProduction > 0

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
            <BreadcrumbLink asChild>
              <Link href={`/production/${production.id}`}>
                {production.batchNumber}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Produksi</h1>
          <p className="text-muted-foreground mt-1">
            {production.batchNumber} • {production.menu.menuName}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/production/${production.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Link>
        </Button>
      </div>

      {/* Warning if production is approaching */}
      {isApproaching && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <CardTitle className="text-orange-900 dark:text-orange-100">
                Produksi Akan Dimulai Segera
              </CardTitle>
            </div>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              Produksi dijadwalkan dalam {Math.ceil(hoursUntilProduction)} jam. 
              Pastikan perubahan yang Anda buat sudah final dan koordinasi dengan tim produksi.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Form */}
      <ProductionForm production={production} />
    </div>
  )
}
