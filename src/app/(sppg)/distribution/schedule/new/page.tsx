/**
 * @fileoverview Distribution Schedule Create Page
 * @version Next.js 15.5.4 / App Router
 * @description Page untuk membuat jadwal distribusi baru
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { Metadata } from 'next'
import Link from 'next/link'
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

export const metadata: Metadata = {
  title: 'Buat Jadwal Distribusi Baru | Bagizi-ID',
  description: 'Buat jadwal distribusi makanan baru untuk penerima manfaat',
}

export default function CreateSchedulePage() {
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
            <BreadcrumbPage>Buat Baru</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            Buat Jadwal Distribusi Baru
          </h1>
          <p className="text-muted-foreground">
            Isi form di bawah untuk membuat jadwal distribusi baru
          </p>
        </div>
        <Button asChild variant="outline" size="lg">
          <Link href="/distribution/schedule">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Kembali
          </Link>
        </Button>
      </div>

      {/* Schedule Form */}
      <Card>
        <CardHeader>
          <CardTitle>Form Jadwal Distribusi</CardTitle>
          <CardDescription>
            Lengkapi informasi jadwal distribusi dengan detail yang akurat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScheduleForm />
        </CardContent>
      </Card>
    </div>
  )
}
