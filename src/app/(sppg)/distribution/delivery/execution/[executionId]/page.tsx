/**
 * @fileoverview Distribution Delivery List Page
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * 
 * @description
 * List page for all deliveries in a distribution execution.
 * Features:
 * - Filter controls (status, quality check, issues, driver, search)
 * - Toggle between table and grid view
 * - Export functionality
 * - Real-time statistics
 */

import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronLeft, Download, List, LayoutGrid } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

import { DeliveryList } from '@/features/sppg/distribution/delivery/components'

// ============================================================================
// Types
// ============================================================================

interface PageProps {
  params: Promise<{
    executionId: string
  }>
  searchParams: Promise<{
    view?: 'table' | 'grid'
    status?: string
    search?: string
  }>
}

// ============================================================================
// Main Page Component
// ============================================================================

export default async function DeliveryListPage({ params, searchParams }: PageProps) {
  const { executionId } = await params
  const { view = 'table', status, search } = await searchParams

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
            <BreadcrumbPage>Pengiriman</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/distribution/execution">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Daftar Pengiriman</h1>
            <p className="text-muted-foreground">
              Pantau status pengiriman real-time dengan GPS tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={view === 'table' ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link href={`?view=table${status ? `&status=${status}` : ''}${search ? `&search=${search}` : ''}`}>
                <List className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant={view === 'grid' ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link href={`?view=grid${status ? `&status=${status}` : ''}${search ? `&search=${search}` : ''}`}>
                <LayoutGrid className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Export Button */}
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Content */}
      <Suspense fallback={<LoadingState />}>
        {view === 'table' ? (
          <DeliveryList
            executionId={executionId}
            onViewDetail={(id) => console.log('View detail:', id)}
          />
        ) : (
          <DeliveryGridView />
        )}
      </Suspense>
    </div>
  )
}

// ============================================================================
// Grid View Component
// ============================================================================

function DeliveryGridView() {
  // This would use the same hook as DeliveryList but render cards in grid
  return (
    <Card>
      <CardHeader>
        <CardTitle>Grid View</CardTitle>
        <CardDescription>
          Grid view akan menggunakan DeliveryCard component
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* TODO: Implement grid using DeliveryCard */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <p className="text-muted-foreground col-span-full text-center py-8">
            Grid view implementation - use DeliveryCard component dengan useDeliveries hook
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Loading State
// ============================================================================

function LoadingState() {
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
