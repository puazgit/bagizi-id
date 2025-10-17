/**
 * @fileoverview Production List Page
 * @version Next.js 15.5.4 / App Router
 * @author Bagizi-ID Development Team
 * @route /production
 * 
 * MODULAR ARCHITECTURE:
 * - Server Component with SSR for optimal performance
 * - Authentication & Authorization (RBAC)
 * - Multi-tenant data isolation (sppgId filtering)
 * - Breadcrumb navigation
 * - Page header with actions
 * - Integration with ProductionList component
 * - SEO optimization with metadata
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { db } from '@/lib/prisma'
import { checkSppgAccess, canManageProduction } from '@/lib/permissions'
import { ProductionList } from '@/features/sppg/production/components'
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
  ChefHat,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Produksi Makanan | Bagizi-ID',
  description: 'Kelola produksi makanan dan quality control di SPPG',
}

/**
 * Get production statistics for SPPG
 * 
 * @param {string} sppgId - SPPG ID for multi-tenant filtering
 * @returns {Promise<Object>} Production statistics
 */
async function getProductionStatistics(sppgId: string) {
  try {
    const [
      totalProductions,
      activeProductions,
      completedProductions,
      todayProductions,
    ] = await Promise.all([
      // Total productions
      db.foodProduction.count({
        where: { sppgId }
      }),
      
      // Active productions (PREPARING or COOKING)
      db.foodProduction.count({
        where: {
          sppgId,
          status: {
            in: ['PREPARING', 'COOKING']
          }
        }
      }),
      
      // Completed productions
      db.foodProduction.count({
        where: {
          sppgId,
          status: 'COMPLETED'
        }
      }),
      
      // Today's productions
      db.foodProduction.count({
        where: {
          sppgId,
          productionDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }),
    ])

    return {
      totalProductions,
      activeProductions,
      completedProductions,
      todayProductions,
    }
  } catch (error) {
    console.error('Error fetching production statistics:', error)
    return {
      totalProductions: 0,
      activeProductions: 0,
      completedProductions: 0,
      todayProductions: 0,
    }
  }
}

/**
 * Production List Page Component
 * 
 * Features:
 * - Server-side authentication & authorization
 * - Multi-tenant data isolation
 * - Real-time statistics
 * - Quick actions (Create production)
 * - Breadcrumb navigation
 * 
 * @returns {Promise<JSX.Element>} Production list page
 */
export default async function ProductionPage() {
  // ============================================================================
  // AUTHENTICATION & AUTHORIZATION
  // ============================================================================

  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  // Check SPPG access (multi-tenant security)
  const sppg = await checkSppgAccess(session.user.sppgId || null)
  
  if (!sppg) {
    redirect('/access-denied')
  }

  // Check production management permission
  if (!session.user.userRole || !canManageProduction(session.user.userRole)) {
    redirect('/dashboard')
  }

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const statistics = await getProductionStatistics(sppg.id)

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Produksi</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produksi Makanan</h1>
          <p className="text-muted-foreground mt-2">
            Kelola produksi makanan dan quality control untuk program gizi
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/production/new">
            <Plus className="h-5 w-5 mr-2" />
            Buat Produksi Baru
          </Link>
        </Button>
      </div>

      <Separator />

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Productions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produksi</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalProductions}</div>
            <p className="text-xs text-muted-foreground">
              Semua produksi terdaftar
            </p>
          </CardContent>
        </Card>

        {/* Active Productions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sedang Berlangsung</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statistics.activeProductions}
            </div>
            <p className="text-xs text-muted-foreground">
              Preparing atau Cooking
            </p>
          </CardContent>
        </Card>

        {/* Completed Productions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statistics.completedProductions}
            </div>
            <p className="text-xs text-muted-foreground">
              Produksi selesai
            </p>
          </CardContent>
        </Card>

        {/* Today's Productions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hari Ini</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {statistics.todayProductions}
            </div>
            <p className="text-xs text-muted-foreground">
              Jadwal produksi hari ini
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Production List Component (Client-side with filters) */}
      <ProductionList />

      {/* Help Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">💡 Tips Produksi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Pastikan semua bahan tersedia sebelum memulai produksi</p>
          <p>• Monitor suhu makanan secara berkala untuk keamanan pangan</p>
          <p>• Lakukan quality check setelah memasak selesai</p>
          <p>• Dokumentasikan setiap tahap produksi untuk audit</p>
          <p>• Catat limbah untuk evaluasi efisiensi produksi</p>
        </CardContent>
      </Card>
    </div>
  )
}
