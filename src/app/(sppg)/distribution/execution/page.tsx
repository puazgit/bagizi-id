/**
 * @fileoverview Distribution Execution List Page
 * @version Next.js 15.5.4
 * @description Main page for viewing and managing distribution executions
 */

import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Activity } from 'lucide-react'
import { ExecutionList } from '@/features/sppg/distribution/execution/components'

export default async function ExecutionPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Eksekusi Distribusi</h1>
          <p className="text-muted-foreground mt-2">
            Kelola dan monitor eksekusi distribusi makanan secara real-time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/distribution/execution/monitor">
              <Activity className="h-4 w-4 mr-2" />
              Monitor Real-Time
            </Link>
          </Button>
          <Button asChild>
            <Link href="/distribution/schedule">
              <Plus className="h-4 w-4 mr-2" />
              Mulai dari Jadwal
            </Link>
          </Button>
        </div>
      </div>

      {/* Execution List */}
      <Suspense fallback={<ExecutionListSkeleton />}>
        <ExecutionList />
      </Suspense>
    </div>
  )
}

/**
 * Loading skeleton for execution list
 */
function ExecutionListSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}
