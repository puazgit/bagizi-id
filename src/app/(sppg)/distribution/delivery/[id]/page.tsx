/**
 * @fileoverview Distribution Delivery Detail Page
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * 
 * @description
 * Detailed delivery view with action buttons based on status.
 * Features:
 * - Full delivery information with tabs
 * - Status-based action buttons
 * - Upload photo functionality
 * - Report issue functionality
 * - Edit capability for ASSIGNED status
 */

import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronLeft, Camera, AlertCircle, Edit, Play, MapPin, CheckCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

import { DeliveryDetail } from '@/features/sppg/distribution/delivery/components'

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

export default async function DeliveryDetailPage({ params }: PageProps) {
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
            <BreadcrumbLink href="/distribution/execution">Eksekusi</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/distribution/delivery">Pengiriman</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Detail</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/distribution/delivery">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Detail Pengiriman</h1>
            <p className="text-muted-foreground">
              Informasi lengkap dan tracking pengiriman
            </p>
          </div>
        </div>

        <Suspense fallback={null}>
          <DeliveryActions deliveryId={id} />
        </Suspense>
      </div>

      {/* Content */}
      <Suspense fallback={<LoadingState />}>
        <DeliveryDetail deliveryId={id} />
      </Suspense>
    </div>
  )
}

// ============================================================================
// Delivery Actions Component
// ============================================================================

function DeliveryActions({ deliveryId }: { deliveryId: string }) {
  // In real implementation, this would fetch delivery status and show appropriate actions
  // For now, showing all possible actions
  
  return (
    <div className="flex items-center gap-2">
      {/* Start Delivery - Show if status is ASSIGNED */}
      <Button asChild>
        <Link href={`/distribution/delivery/${deliveryId}/start`}>
          <Play className="h-4 w-4 mr-2" />
          Mulai Pengiriman
        </Link>
      </Button>

      {/* Track Location - Show if status is DEPARTED */}
      <Button variant="outline" asChild>
        <Link href={`/distribution/delivery/${deliveryId}/track`}>
          <MapPin className="h-4 w-4 mr-2" />
          Track GPS
        </Link>
      </Button>

      {/* Complete Delivery - Show if status is DEPARTED */}
      <Button variant="outline" asChild>
        <Link href={`/distribution/delivery/${deliveryId}/complete`}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Selesaikan
        </Link>
      </Button>

      {/* Upload Photo */}
      <Button variant="outline">
        <Camera className="h-4 w-4 mr-2" />
        Upload Foto
      </Button>

      {/* Report Issue */}
      <Button variant="outline">
        <AlertCircle className="h-4 w-4 mr-2" />
        Laporkan Masalah
      </Button>

      {/* Edit - Show if status is ASSIGNED */}
      <Button variant="outline">
        <Edit className="h-4 w-4 mr-2" />
        Edit
      </Button>
    </div>
  )
}

// ============================================================================
// Loading State
// ============================================================================

function LoadingState() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>

      <Skeleton className="h-96 w-full" />
    </div>
  )
}
