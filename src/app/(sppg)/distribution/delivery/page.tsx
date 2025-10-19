/**
 * @fileoverview Distribution Delivery Management Page - Cross-Schedule View
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/DISTRIBUTION_WORKFLOW_COMPLETE.md} Complete Workflow
 * 
 * @description
 * Displays ALL deliveries across all schedules for SPPG.
 * This is the main monitoring page for tracking all deliveries in real-time.
 * 
 * Workflow Position: PLANNING PHASE & EXECUTION PHASE
 * - View all planned deliveries (ASSIGNED status)
 * - Track ongoing deliveries (DEPARTED status)
 * - Review completed deliveries (DELIVERED/FAILED status)
 */

import { Suspense } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { Truck, ArrowLeft, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AllDeliveriesList } from '@/features/sppg/distribution/delivery/components'

export const metadata: Metadata = {
  title: 'Semua Pengiriman | Bagizi-ID',
  description: 'Pantau dan kelola semua pengiriman distribusi makanan',
}

/**
 * Delivery Page Component
 * 
 * Shows comprehensive view of all deliveries across:
 * - All distribution schedules
 * - All statuses (ASSIGNED → DEPARTED → DELIVERED/FAILED)
 * - Real-time tracking and GPS monitoring
 */
export default function DeliveryIndexPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link 
              href="/distribution" 
              className="hover:text-foreground transition-colors"
            >
              Distribusi
            </Link>
            <span>/</span>
            <span className="text-foreground">Semua Pengiriman</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Semua Pengiriman
              </h1>
              <p className="text-muted-foreground">
                Pantau semua pengiriman dari semua jadwal distribusi
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/distribution">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
          <Button asChild>
            <Link href="/distribution/schedule/create">
              <Plus className="mr-2 h-4 w-4" />
              Buat Jadwal Baru
            </Link>
          </Button>
        </div>
      </div>

      <Separator />

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">Pantauan Pengiriman Real-time</h3>
              <p className="text-sm text-muted-foreground">
                Halaman ini menampilkan <strong>semua pengiriman</strong> dari semua jadwal distribusi.
                Anda dapat memfilter berdasarkan status, driver, atau mencari tujuan pengiriman tertentu.
              </p>
              <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <span>Ditugaskan: Belum berangkat</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>Dalam Perjalanan: Dapat dilacak GPS</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Terkirim: Selesai</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deliveries List */}
      <Suspense fallback={<DeliveriesListSkeleton />}>
        <AllDeliveriesList />
      </Suspense>
    </div>
  )
}

/**
 * Loading skeleton for deliveries list
 */
function DeliveriesListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Statistics Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-4 w-20 bg-muted animate-pulse rounded mb-2" />
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters Skeleton */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                <div className="h-10 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table Skeleton */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
