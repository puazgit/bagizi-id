/**
 * @fileoverview Admin Demo Requests List Page
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/ADMIN_DEMO_REQUESTS_COMPONENTS_IMPLEMENTATION.md} Implementation Documentation
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, BarChart3 } from 'lucide-react'
import { useDemoRequests } from '@/features/admin/demo-requests'
import { DemoRequestTable, DemoRequestFilters, DemoRequestNav } from '@/features/admin/demo-requests/components'
import type { DemoRequestFilters as FilterType } from '@/features/admin/demo-requests/types/demo-request.types'
import { useDemoRequestPermissions, useIsReadOnly } from '@/hooks/usePermissions'

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Demo Requests List Page - Admin dashboard for managing demo requests
 *
 * Features:
 * - Tabbed interface (All, Submitted, In Review, Approved, Rejected)
 * - Filter component with advanced filters
 * - Data table with actions
 * - Quick stats cards
 * - Create new request button
 * - Analytics link
 *
 * @example
 * // Route: /admin/demo-requests
 */
export default function DemoRequestsPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<FilterType>({})
  const [activeTab, setActiveTab] = useState<string>('all')

  // Permission checks
  const permissions = useDemoRequestPermissions()
  const isReadOnly = useIsReadOnly()

  // Fetch data based on active tab
  const tabFilters: FilterType = {
    ...filters,
    ...(activeTab !== 'all' && { status: activeTab.toUpperCase() as FilterType['status'] }),
  }

  const { data, isLoading, error } = useDemoRequests(tabFilters)

  // Quick stats from data
  const stats = {
    total: data?.length || 0,
    submitted: data?.filter((r) => r.status === 'SUBMITTED').length || 0,
    inReview: data?.filter((r) => r.status === 'UNDER_REVIEW').length || 0,
    approved: data?.filter((r) => r.status === 'APPROVED').length || 0,
    rejected: data?.filter((r) => r.status === 'REJECTED').length || 0,
  }

  // Tab labels
  const tabLabels: Record<string, string> = {
    all: 'Semua Demo Requests',
    submitted: 'Submitted Requests',
    under_review: 'Under Review Requests',
    approved: 'Approved Requests',
    rejected: 'Rejected Requests',
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Demo Requests</h1>
          <p className="text-muted-foreground mt-1">
            Kelola permintaan demo dari calon pelanggan
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/demo-requests/analytics')}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
          
          {/* Create button - only for SUPERADMIN & SUPPORT */}
          {!isReadOnly && permissions.canTakeAction && (
            <Button
              onClick={() => router.push('/admin/demo-requests/new')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Permintaan Baru
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Semua permintaan demo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.submitted}</div>
            <p className="text-xs text-muted-foreground">
              Menunggu review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inReview}</div>
            <p className="text-xs text-muted-foreground">
              Sedang direview
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              Telah disetujui
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <DemoRequestFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Navigation Tabs */}
      <DemoRequestNav 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        stats={stats}
      />

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {tabLabels[activeTab]}
          </CardTitle>
          <CardDescription>
            {data?.length || 0} permintaan demo ditemukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center py-8 text-destructive">
              Error loading data: {error.message}
            </div>
          )}
          
          {!error && (
            <DemoRequestTable
              data={data || []}
              onView={(id) => router.push(`/admin/demo-requests/${id}`)}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
