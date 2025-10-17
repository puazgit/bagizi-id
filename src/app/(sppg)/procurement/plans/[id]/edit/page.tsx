/**
 * @fileoverview Edit Procurement Plan Page
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * @route /procurement/plans/[id]/edit
 * 
 * MODULAR ARCHITECTURE:
 * - Thin wrapper page using feature components
 * - Server-side data fetching with auth
 * - Multi-tenant isolation (sppgId filtering)
 * - Edit restriction (only DRAFT/REVISION status)
 * - SEO optimization with dynamic metadata
 */

import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { canManageProcurement } from '@/lib/permissions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { ProcurementPlanForm } from '@/features/sppg/procurement/components'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const session = await auth()
  if (!session?.user?.sppgId) {
    return { title: 'Edit Rencana Pengadaan | Bagizi-ID' }
  }

  const plan = await db.procurementPlan.findFirst({
    where: {
      id: params.id,
      sppgId: session.user.sppgId,
    },
    select: {
      planName: true,
    },
  })

  return {
    title: plan ? `Edit ${plan.planName} | Bagizi-ID` : 'Edit Rencana Pengadaan | Bagizi-ID',
    description: 'Edit rencana pengadaan dan budget planning',
  }
}

/**
 * Edit Procurement Plan Page
 */
export default async function EditProcurementPlanPage({ params }: { params: { id: string } }) {
  // Auth check
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  // Permission check
  const userRole = session.user.userRole
  if (!userRole || !canManageProcurement(userRole)) {
    redirect('/dashboard')
  }

  // Multi-tenant check
  if (!session.user.sppgId) {
    redirect('/dashboard')
  }

  // Fetch plan with multi-tenant isolation
  const plan = await db.procurementPlan.findFirst({
    where: {
      id: params.id,
      sppgId: session.user.sppgId,
    },
    include: {
      program: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!plan) {
    notFound()
  }

  // Check if plan can be edited
  const canEdit = plan.approvalStatus === 'DRAFT' || plan.approvalStatus === 'REVISION'
  if (!canEdit) {
    redirect(`/procurement/plans/${plan.id}`)
  }

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
            <BreadcrumbLink asChild>
              <Link href={`/procurement/plans/${plan.id}`}>{plan.planName}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Rencana Pengadaan</h1>
          <p className="text-muted-foreground mt-1">
            Perbarui rencana budget dan target pengadaan
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/procurement/plans/${plan.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Link>
        </Button>
      </div>

      {/* Revision Alert */}
      {plan.approvalStatus === 'REVISION' && plan.rejectionReason && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Revisi Diperlukan</AlertTitle>
          <AlertDescription>
            <p className="font-medium mt-1">Alasan revisi:</p>
            <p className="mt-1">{plan.rejectionReason}</p>
          </AlertDescription>
        </Alert>
      )}

      {/* Guidelines Card */}
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900/20 dark:bg-yellow-900/10">
        <CardHeader>
          <CardTitle className="text-lg">Panduan Edit Rencana</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Hanya rencana dengan status DRAFT atau REVISION yang dapat diedit</li>
            <li>Perubahan pada budget akan mempengaruhi kalkulasi biaya per porsi</li>
            <li>Pastikan total budget kategori tidak melebihi total budget</li>
            <li>Setelah mengajukan, rencana tidak dapat diedit sampai disetujui atau dikembalikan</li>
            {plan.approvalStatus === 'REVISION' && (
              <li className="font-medium text-yellow-800 dark:text-yellow-400">
                Perhatikan alasan revisi di atas dan perbaiki sesuai catatan
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Form */}
      <ProcurementPlanForm plan={plan} />
    </div>
  )
}
