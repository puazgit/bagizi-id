/**
 * @fileoverview Distribution Schedule List Page
 * @version Next.js 15.5.4 / App Router
 * @description Main list page untuk jadwal distribusi dengan filtering dan actions
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
import { ScheduleList } from '@/features/sppg/distribution/schedule/components'
import { Calendar, Plus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Jadwal Distribusi | Bagizi-ID',
  description: 'Kelola jadwal distribusi makanan untuk penerima manfaat',
}

export default function ScheduleListPage() {
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
            <BreadcrumbPage>Jadwal</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            Jadwal Distribusi
          </h1>
          <p className="text-muted-foreground">
            Kelola jadwal distribusi makanan untuk penerima manfaat
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/distribution/schedule/new">
            <Plus className="mr-2 h-5 w-5" />
            Buat Jadwal Baru
          </Link>
        </Button>
      </div>

      {/* Schedule List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Jadwal Distribusi</CardTitle>
          <CardDescription>
            Lihat dan kelola semua jadwal distribusi yang telah dibuat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScheduleList />
        </CardContent>
      </Card>
    </div>
  )
}
