/**
 * @fileoverview Distribution Execution Detail Page
 * @version Next.js 15.5.4
 * @description Detail page for viewing and managing a specific execution
 */

import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'
import { ExecutionDetail } from '@/features/sppg/distribution/execution/components'

interface ExecutionDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ExecutionDetailPage({
  params,
}: ExecutionDetailPageProps) {
  const { id } = await params

  if (!id) {
    notFound()
  }

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
            <h1 className="text-3xl font-bold tracking-tight">Detail Eksekusi</h1>
            <p className="text-muted-foreground mt-1">
              Informasi lengkap dan monitoring eksekusi distribusi
            </p>
          </div>
        </div>
      </div>

      {/* Execution Detail */}
      <Suspense fallback={<ExecutionDetailSkeleton />}>
        <ExecutionDetail executionId={id} />
      </Suspense>
    </div>
  )
}

/**
 * Loading skeleton for execution detail
 */
function ExecutionDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-40" />
        </CardContent>
      </Card>
    </div>
  )
}
