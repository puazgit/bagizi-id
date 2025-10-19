/**
 * @fileoverview Distribution Execution Monitor Page
 * @version Next.js 15.5.4
 * @description Real-time monitoring dashboard for all active executions
 */

import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Maximize2 } from 'lucide-react'
import { ExecutionMonitor } from '@/features/sppg/distribution/execution/components'

export default async function ExecutionMonitorPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link href="/distribution/execution">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Monitor Real-Time</h1>
            <p className="text-muted-foreground mt-1">
              Dashboard monitoring eksekusi distribusi secara langsung
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Maximize2 className="h-4 w-4 mr-2" />
          Layar Penuh
        </Button>
      </div>

      {/* Monitor Dashboard */}
      <Suspense fallback={<MonitorSkeleton />}>
        <ExecutionMonitor autoRefresh={true} refreshInterval={30000} />
      </Suspense>
    </div>
  )
}

/**
 * Loading skeleton for monitor dashboard
 */
function MonitorSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Active Executions */}
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
