/**
 * @fileoverview Procurement Plans List Page
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * @route /procurement/plans
 * 
 * MODULAR ARCHITECTURE:
 * - Server Component with SSR for optimal performance
 * - Authentication & Authorization (RBAC)
 * - Multi-tenant data isolation (sppgId filtering)
 * - Breadcrumb navigation
 * - Page header with actions
 * - Integration with ProcurementPlanList component
 * - SEO optimization with metadata
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { checkSppgAccess, canManageProcurement } from '@/lib/permissions'
import { ProcurementPlanList } from '@/features/sppg/procurement/components'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { 
  Plus,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Rencana Pengadaan | Bagizi-ID',
  description: 'Kelola rencana budget dan target pengadaan bulanan di SPPG',
}

/**
 * Get procurement plan statistics for SPPG
 * 
 * @param {string} sppgId - SPPG ID for multi-tenant filtering
 * @returns {Promise<Object>} Procurement plan statistics
 */
async function getPlanStatistics(sppgId: string) {
  try {
    const [
      totalPlans,
      approvedPlans,
      draftPlans,
      submittedPlans,
    ] = await Promise.all([
      // Total plans
      db.procurementPlan.count({
        where: { sppgId }
      }),
      
      // Approved plans
      db.procurementPlan.count({
        where: {
          sppgId,
          approvalStatus: 'APPROVED'
        }
      }),
      
      // Draft plans
      db.procurementPlan.count({
        where: {
          sppgId,
          approvalStatus: 'DRAFT'
        }
      }),
      
      // Submitted plans (pending approval)
      db.procurementPlan.count({
        where: {
          sppgId,
          approvalStatus: 'SUBMITTED'
        }
      }),
    ])

    // Calculate percentages
    const approvedPercentage = totalPlans > 0 
      ? Math.round((approvedPlans / totalPlans) * 100) 
      : 0
    
    const draftPercentage = totalPlans > 0 
      ? Math.round((draftPlans / totalPlans) * 100) 
      : 0

    return {
      total: totalPlans,
      approved: approvedPlans,
      draft: draftPlans,
      submitted: submittedPlans,
      approvedPercentage,
      draftPercentage,
    }
  } catch (error) {
    console.error('Error fetching plan statistics:', error)
    return {
      total: 0,
      approved: 0,
      draft: 0,
      submitted: 0,
      approvedPercentage: 0,
      draftPercentage: 0,
    }
  }
}

/**
 * Procurement Plans List Page
 */
export default async function ProcurementPlansPage() {
  // ============================================
  // AUTHENTICATION & AUTHORIZATION
  // ============================================
  
  const session = await auth()
  
  // Check if user is authenticated
  if (!session?.user) {
    redirect('/login?callbackUrl=/procurement/plans')
  }

  // Check if user has sppgId (multi-tenant requirement)
  const sppgId = session.user.sppgId
  if (!sppgId) {
    redirect('/access-denied?reason=no-sppg')
  }

  // Verify SPPG exists and is active
  const sppg = await checkSppgAccess(sppgId)
  if (!sppg) {
    redirect('/access-denied?reason=invalid-sppg')
  }

  // Check if user has permission to manage procurement
  const userRole = session.user.userRole
  if (!userRole || !canManageProcurement(userRole)) {
    redirect('/access-denied?reason=insufficient-permissions')
  }

  // ============================================
  // DATA FETCHING
  // ============================================

  const statistics = await getPlanStatistics(sppgId)

  // ============================================
  // RENDER PAGE
  // ============================================

  return (
    <div className="space-y-6">
      {/* ================================ HEADER ================================ */}
      
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Rencana Pengadaan</h1>
          <p className="text-muted-foreground">
            Kelola rencana budget dan target pengadaan bulanan di <span className="font-medium">{sppg.name}</span>
          </p>
        </div>
        <Button asChild>
          <Link href="/procurement/plans/new">
            <Plus className="mr-2 h-4 w-4" />
            Buat Rencana Baru
          </Link>
        </Button>
      </div>

      {/* ================================ BREADCRUMB ================================ */}
      
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
            <BreadcrumbPage>Rencana Pengadaan</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Separator />

      {/* ================================ STATISTICS CARDS ================================ */}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Plans Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Rencana
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Semua rencana pengadaan
            </p>
          </CardContent>
        </Card>

        {/* Approved Plans Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rencana Disetujui
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statistics.approved}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-medium text-green-600">
                {statistics.approvedPercentage}%
              </span>{' '}
              dari total rencana
            </p>
          </CardContent>
        </Card>

        {/* Draft Plans Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Draft Rencana
            </CardTitle>
            <XCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {statistics.draft}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-medium text-orange-600">
                {statistics.draftPercentage}%
              </span>{' '}
              dari total rencana
            </p>
          </CardContent>
        </Card>

        {/* Submitted Plans Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Menunggu Persetujuan
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statistics.submitted}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Perlu ditinjau
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ================================ CONTENT ================================ */}
      
      <ProcurementPlanList />
    </div>
  )
}
