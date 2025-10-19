/**
 * @fileoverview Distribution Schedule Detail Page
 * @version Next.js 15.5.4 / App Router
 * @description Page untuk melihat detail jadwal distribusi dengan actions
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  ScheduleDetail,
} from '@/features/sppg/distribution/schedule/components'
import { Calendar, ArrowLeft, Edit } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  
  return {
    title: `Detail Jadwal Distribusi #${id.slice(0, 8)} | Bagizi-ID`,
    description: 'Detail lengkap jadwal distribusi makanan',
  }
}

export default async function ScheduleDetailPage({ params }: PageProps) {
  const { id } = await params

  // Validate ID format (basic check)
  if (!id || id.length < 20) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/distribution">Distribusi</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/distribution/schedule">Jadwal</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Detail</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            Detail Jadwal Distribusi
          </h1>
          <p className="text-muted-foreground">
            Informasi lengkap tentang jadwal distribusi ini
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="lg">
            <Link href="/distribution/schedule">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Kembali
            </Link>
          </Button>
          <Button asChild size="lg">
            <Link href={`/distribution/schedule/${id}/edit`}>
              <Edit className="mr-2 h-5 w-5" />
              Edit Jadwal
            </Link>
          </Button>
        </div>
      </div>

      {/* Schedule Detail */}
      <ScheduleDetail scheduleId={id} />

      <Separator />

      {/* Status Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Aksi Status</h3>
              <p className="text-sm text-muted-foreground">
                Ubah status jadwal distribusi sesuai dengan progres
              </p>
            </div>
            {/* 
              Note: ScheduleStatusActions will be rendered after ScheduleDetail loads
              and provides the schedule data via React Query
            */}
            <div id="schedule-actions">
              {/* Actions will be rendered by ScheduleDetail component */}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
