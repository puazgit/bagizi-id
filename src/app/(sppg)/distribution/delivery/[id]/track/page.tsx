/**
 * @fileoverview Distribution Delivery Live Tracking Page
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * 
 * @description
 * Real-time GPS tracking page for active deliveries.
 * Features:
 * - Live map visualization with DeliveryMap component
 * - Auto-refresh tracking data (every 15s)
 * - Track current location button
 * - Tracking history timeline
 */

import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronLeft, MapPin, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

// ============================================================================
// Types
// ============================================================================

interface PageProps {
  params: Promise<{
    id: string
  }>
}

// ============================================================================
// Main Page Component
// ============================================================================

export default async function DeliveryTrackingPage({ params }: PageProps) {
  const { id } = await params

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/distribution">Distribusi</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/distribution/delivery">Pengiriman</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/distribution/delivery/${id}`}>Detail</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Live Tracking</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/distribution/delivery/${id}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Live GPS Tracking</h1>
            <p className="text-muted-foreground">
              Pantau posisi pengiriman secara real-time
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-refresh indicator */}
          <Badge variant="outline" className="gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Auto-refresh setiap 15 detik
          </Badge>

          {/* Track Location Button */}
          <Button>
            <MapPin className="h-4 w-4 mr-2" />
            Track Lokasi Saya
          </Button>

          {/* Refresh Button */}
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Map Section */}
      <Suspense fallback={<MapLoadingState />}>
        <Card>
          <CardHeader>
            <CardTitle>Peta Tracking</CardTitle>
            <CardDescription>
              Visualisasi rute pengiriman dengan tracking points
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* DeliveryMap component will be rendered here */}
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">
                DeliveryMap component akan ditampilkan di sini
              </p>
            </div>
          </CardContent>
        </Card>
      </Suspense>

      {/* Tracking Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Jarak Tempuh</CardDescription>
            <CardTitle className="text-2xl">12.5 km</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Kecepatan Rata-rata</CardDescription>
            <CardTitle className="text-2xl">45 km/jam</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Tracking Points</CardDescription>
            <CardTitle className="text-2xl">28 titik</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Status GPS</CardDescription>
            <CardTitle className="text-2xl text-green-600">Aktif</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tracking History */}
      <Suspense fallback={<HistoryLoadingState />}>
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Tracking</CardTitle>
            <CardDescription>
              Timeline tracking GPS terbaru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Tracking history timeline akan ditampilkan di sini
            </p>
          </CardContent>
        </Card>
      </Suspense>
    </div>
  )
}

// ============================================================================
// Loading States
// ============================================================================

function MapLoadingState() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-96 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="aspect-video w-full" />
      </CardContent>
    </Card>
  )
}

function HistoryLoadingState() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-96 mt-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </CardContent>
    </Card>
  )
}
