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
import { headers } from 'next/headers'
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
import { programsApi, usersApi } from '@/features/sppg/production/api'
import type { NutritionProgram, NutritionMenu, User } from '@prisma/client'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.sppgId) {
    return { title: 'Edit Produksi | Bagizi-ID' }
  }

  const production = await db.foodProduction.findFirst({
    where: {
      id,
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
export default async function EditProductionPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  // 1. Authentication check
  const session = await auth()
  if (!session?.user?.sppgId) {
    redirect('/login')
  }

  // 2. Permission check
  if (!session.user.userRole || !canManageProduction(session.user.userRole)) {
    redirect('/production')
  }

  // 3. Get request headers for API authentication forwarding
  const headersList = await headers()
  const cookieHeader = headersList.get('cookie')
  const requestHeaders: HeadersInit = cookieHeader ? { Cookie: cookieHeader } : {}

  // 4. Fetch production, programs, and users in parallel via API (Enterprise pattern)
  const [production, programsResponse, usersResponse] = await Promise.all([
    // Fetch production details (direct DB query - OK for single record)
    db.foodProduction.findFirst({
      where: {
        id,
        sppgId: session.user.sppgId,
      },
      include: {
        program: true,
        menu: true,
      },
    }),

    // Fetch programs via API (reusable endpoint)
    programsApi.getAll(requestHeaders),

    // Fetch kitchen staff via API (reusable endpoint)
    usersApi.getKitchenStaff(requestHeaders),
  ])

  const programs = programsResponse.data || []
  const users = usersResponse.data || []

  // 5. Validate production exists
  if (!production) {
    notFound()
  }

  // 5. Only PLANNED production can be edited
  if (production.status !== 'PLANNED') {
    redirect(`/production/${production.id}`)
  }

  // 6. Calculate if production is approaching (within 24 hours)
  const now = new Date()
  const productionDate = new Date(production.productionDate)
  const hoursUntilProduction = (productionDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  const isApproaching = hoursUntilProduction > 0 && hoursUntilProduction <= 24

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/production">Produksi</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit {production.batchNumber}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/production">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Edit Produksi</h1>
          </div>
          <p className="text-muted-foreground">
            Ubah jadwal dan detail produksi {production.batchNumber}
          </p>
        </div>
      </div>

      {/* Warning: Approaching Production */}
      {isApproaching && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-900 dark:text-orange-100">
                Produksi Akan Dimulai Segera
              </CardTitle>
            </div>
            <CardDescription className="text-orange-700 dark:text-orange-200">
              Produksi dijadwalkan dalam {Math.ceil(hoursUntilProduction)} jam. 
              Pastikan semua perubahan sudah tepat sebelum waktu produksi.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Form with users prop */}
      <ProductionForm 
        production={production}
        programs={programs as unknown as Array<NutritionProgram & { menus?: NutritionMenu[] }>}
        users={users as unknown as User[]}
      />
    </div>
  )
}