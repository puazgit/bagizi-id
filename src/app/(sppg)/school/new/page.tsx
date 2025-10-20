/**
 * @fileoverview New School Page (Server Component)
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import CreateSchoolClient from './CreateSchoolClient'

export const metadata: Metadata = {
  title: 'Tambah Sekolah Baru | Bagizi-ID',
  description: 'Tambahkan sekolah penerima manfaat baru ke SPPG',
}

export default function NewSchoolPage() {
  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Tambah Sekolah Baru</h1>
          <p className="text-muted-foreground">
            Daftarkan sekolah baru sebagai penerima manfaat SPPG
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/school">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>
      </div>

      {/* Create Form */}
      <Suspense fallback={<CreateSchoolSkeleton />}>
        <CreateSchoolClient />
      </Suspense>
    </div>
  )
}

/**
 * Loading skeleton for create form
 */
function CreateSchoolSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Section navigation skeleton */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-9 w-32" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form sections skeleton */}
      {[1, 2, 3].map((section) => (
        <Card key={section}>
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
            <div className="space-y-4 pt-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Actions skeleton */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
