/**
 * @fileoverview Distribution Delivery Completion Form Page
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * 
 * @description
 * Form page for completing delivery with recipient confirmation.
 * Features:
 * - Portions delivered input
 * - Recipient information (name, title)
 * - Food quality check (temperature, notes)
 * - Photo upload (delivery proof)
 * - Delivery notes
 * - Form validation with Zod
 */

import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

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

export default async function DeliveryCompletionPage({ params }: PageProps) {
  const { id } = await params

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
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
            <BreadcrumbPage>Selesaikan Pengiriman</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/distribution/delivery/${id}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Selesaikan Pengiriman</h1>
          <p className="text-muted-foreground">
            Lengkapi informasi penerimaan dan konfirmasi pengiriman
          </p>
        </div>
      </div>

      {/* Completion Form */}
      <Suspense fallback={<FormLoadingState />}>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center py-8">
              DeliveryCompletionForm component akan dibuat nanti
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Form untuk menyelesaikan pengiriman: portions delivered, recipient info, quality check, photo upload
            </p>
          </CardContent>
        </Card>
      </Suspense>
    </div>
  )
}

// ============================================================================
// Loading State
// ============================================================================

function FormLoadingState() {
  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 w-full" />
        </div>

        <div className="flex justify-end gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  )
}
