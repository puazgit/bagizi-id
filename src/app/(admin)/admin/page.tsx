/**
 * Admin Platform Dashboard (Homepage)
 * Overview of platform statistics and key metrics
 * 
 * @route /admin
 * @access Platform Admin (SUPERADMIN, SUPPORT, ANALYST)
 * 
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Building2, 
  Users, 
  FileText,
  AlertCircle,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { useDashboardStats } from '@/features/admin/dashboard'
import { StatCard, RecentActivities } from '@/features/admin/dashboard/components'

export default function AdminDashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-900 dark:text-red-100">
                Failed to Load Dashboard
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-red-800 dark:text-red-200">
              {error.message || 'An error occurred while fetching dashboard data'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) return null

  const pendingReviews = stats.demoRequests.byStatus.submitted + stats.demoRequests.byStatus.underReview

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Platform Bagizi-ID - Program Makan Bergizi Gratis
          </p>
        </div>
      </div>

      {/* Pending Reviews Alert */}
      {pendingReviews > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-500" />
              <CardTitle className="text-orange-900 dark:text-orange-100">
                Demo Requests Menunggu Review
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-orange-800 dark:text-orange-200">
              {pendingReviews} permintaan demo SPPG menunggu untuk ditinjau
            </p>
            <Button variant="outline" size="sm" className="mt-3" asChild>
              <Link href="/admin/demo-requests?status=SUBMITTED,UNDER_REVIEW">
                Review Sekarang <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Demo Requests"
          value={stats.demoRequests.total}
          description={`${stats.demoRequests.thisMonth} bulan ini`}
          trend={{
            value: stats.demoRequests.growth,
            label: 'vs bulan lalu'
          }}
          icon={FileText}
          href="/admin/demo-requests"
        />

        <StatCard
          title="Conversion Rate"
          value={`${stats.conversion.rate}%`}
          description={`${stats.conversion.thisMonth} konversi bulan ini`}
          icon={CheckCircle2}
          href="/admin/demo-requests?status=CONVERTED"
        />

        <StatCard
          title="Total SPPG"
          value={stats.sppg.total}
          description={`${stats.sppg.active} aktif, ${stats.sppg.trial} trial`}
          icon={Building2}
          href="/admin/sppg"
        />

        <StatCard
          title="Total Users"
          value={stats.users.total}
          description={`${stats.users.platformAdmins} admin, ${stats.users.sppgUsers} SPPG`}
          icon={Users}
          href="/admin/users"
        />
      </div>

      {/* Demo Requests Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Requests Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.demoRequests.byStatus.submitted}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Diajukan</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.demoRequests.byStatus.underReview}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Ditinjau</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.demoRequests.byStatus.approved}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Disetujui</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.demoRequests.byStatus.demoActive}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Demo Aktif</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.demoRequests.byStatus.converted}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Konversi</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.demoRequests.byStatus.rejected}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Ditolak</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <RecentActivities
        demoRequests={stats.recentActivities.demoRequests}
        conversions={stats.recentActivities.conversions}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin/demo-requests">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Demo Requests</CardTitle>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Kelola permintaan demo dari SPPG yang ingin berlangganan platform
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/sppg">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">SPPG Management</CardTitle>
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Kelola SPPG tenants, subscription, dan program MBG mereka
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">User Management</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Kelola platform admins dan SPPG users dengan role-based access
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

