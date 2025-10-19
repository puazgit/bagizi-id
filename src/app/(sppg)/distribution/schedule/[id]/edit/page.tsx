/**
 * @fileoverview Distribution Schedule Edit Page
 * @version Next.js 15.5.4 / App Router
 * @description Page untuk mengedit jadwal distribusi yang sudah ada
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScheduleForm } from '@/features/sppg/distribution/schedule/components'
import { Calendar, ArrowLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  
  return {
    title: `Edit Jadwal Distribusi #${id.slice(0, 8)} | Bagizi-ID`,
    description: 'Edit jadwal distribusi makanan yang sudah ada',
  }
}

export default async function EditSchedulePage({ params }: PageProps) {
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
            <BreadcrumbLink href={`/distribution/schedule/${id}`}>
              Detail
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            Edit Jadwal Distribusi
          </h1>
          <p className="text-muted-foreground">
            Update informasi jadwal distribusi
          </p>
        </div>
        <Button asChild variant="outline" size="lg">
          <Link href={`/distribution/schedule/${id}`}>
            <ArrowLeft className="mr-2 h-5 w-5" />
            Kembali ke Detail
          </Link>
        </Button>
      </div>

      {/* Schedule Form (Edit Mode) */}
      <Card>
        <CardHeader>
          <CardTitle>Form Edit Jadwal Distribusi</CardTitle>
          <CardDescription>
            Update informasi jadwal distribusi dengan data yang akurat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScheduleForm scheduleId={id} />
        </CardContent>
      </Card>
    </div>
  )
}
