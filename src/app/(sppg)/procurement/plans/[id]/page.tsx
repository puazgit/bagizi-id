/**
 * @fileoverview Procurement Plan Detail Page
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * @route /procurement/plans/[id]
 * 
 * MODULAR ARCHITECTURE:
 * - Thin wrapper page using feature components
 * - Server-side data fetching with auth
 * - Multi-tenant isolation (sppgId filtering)
 * - SEO optimization with dynamic metadata
 */

import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { canManageProcurement } from '@/lib/permissions'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ArrowLeft, Edit } from 'lucide-react'
import { 
  BudgetBreakdown, 
  ApprovalWorkflow,
} from '@/features/sppg/procurement/components'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.sppgId) {
    return { title: 'Rencana Pengadaan | Bagizi-ID' }
  }

  const plan = await db.procurementPlan.findFirst({
    where: {
      id,
      sppgId: session.user.sppgId,
    },
    select: {
      planName: true,
    },
  })

  return {
    title: plan ? `${plan.planName} | Bagizi-ID` : 'Rencana Pengadaan | Bagizi-ID',
    description: 'Detail rencana pengadaan dan budget planning',
  }
}

/**
 * Procurement Plan Detail Page
 */
export default async function ProcurementPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // Auth check
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  // Permission check
  if (!session.user.userRole || !canManageProcurement(session.user.userRole)) {
    redirect('/dashboard')
  }

  // Multi-tenant check
  if (!session.user.sppgId) {
    redirect('/dashboard')
  }

  // Fetch plan with multi-tenant isolation
  const plan = await db.procurementPlan.findFirst({
    where: {
      id,
      sppgId: session.user.sppgId,
    },
    include: {
      sppg: {
        select: {
          name: true,
        },
      },
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

  const canEdit = plan.approvalStatus === 'DRAFT' || plan.approvalStatus === 'REVISION'

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
            <BreadcrumbPage>{plan.planName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{plan.planName}</h1>
          <p className="text-muted-foreground mt-1">
            Detail rencana pengadaan dan budget planning
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/procurement/plans">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Link>
          </Button>
          {canEdit && (
            <Button asChild>
              <Link href={`/procurement/plans/${plan.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Approval Workflow */}
      <ApprovalWorkflow plan={plan} />

      {/* Budget Breakdown */}
      <BudgetBreakdown plan={plan} showChart />
    </div>
  )
}
