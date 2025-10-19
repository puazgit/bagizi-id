/**
 * @fileoverview Distribution Main Page - Overview of all distributions
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * 
 * @description
 * Main distribution page showing overview of schedules, executions, and deliveries.
 * Features:
 * - Distribution list with filters
 * - Quick statistics
 * - Navigation to sub-modules (Schedule, Execution, Delivery)
 * - Create new distribution
 */

import { Suspense } from 'react'
import Link from 'next/link'
import { Plus, Calendar, Truck, MapPin, TrendingUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'

import {
  DistributionList,
  ScheduleStats,
  ExecutionStats,
  DeliveryStats,
  PerformanceMetrics,
} from '@/features/sppg/distribution/components'

// ============================================================================
// Main Page Component
// ============================================================================

export default function DistributionPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>Distribusi</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Distribusi</h1>
          <p className="text-muted-foreground">
            Kelola jadwal, eksekusi, dan pengiriman distribusi makanan
          </p>
        </div>

        <Button size="lg" asChild>
          <Link href="/distribution/schedule/create">
            <Plus className="h-4 w-4 mr-2" />
            Buat Jadwal Baru
          </Link>
        </Button>
      </div>

      {/* Quick Access Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/distribution/schedule">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Jadwal Distribusi</CardTitle>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>
                Atur jadwal distribusi harian, mingguan, dan bulanan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Suspense fallback={<Skeleton className="h-8 w-16" />}>
                  <ScheduleStats />
                </Suspense>
              </div>
              <p className="text-xs text-muted-foreground">jadwal aktif</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/distribution/execution">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Eksekusi Distribusi</CardTitle>
                <Truck className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>
                Pantau pelaksanaan distribusi makanan real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Suspense fallback={<Skeleton className="h-8 w-16" />}>
                  <ExecutionStats />
                </Suspense>
              </div>
              <p className="text-xs text-muted-foreground">eksekusi hari ini</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/distribution/delivery">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Tracking Pengiriman</CardTitle>
                <MapPin className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>
                Lacak pengiriman dengan GPS real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Suspense fallback={<Skeleton className="h-8 w-16" />}>
                  <DeliveryStats />
                </Suspense>
              </div>
              <p className="text-xs text-muted-foreground">dalam perjalanan</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Distribution List */}
      <Suspense fallback={<ListLoadingState />}>
        <DistributionList />
      </Suspense>

      {/* Performance Metrics (Optional) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Performa Distribusi</CardTitle>
              <CardDescription>
                Metrik kinerja distribusi bulan ini
              </CardDescription>
            </div>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<MetricsLoadingState />}>
            <PerformanceMetrics />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// Loading States
// ============================================================================

function ListLoadingState() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </CardContent>
    </Card>
  )
}

function MetricsLoadingState() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
    </div>
  )
}
