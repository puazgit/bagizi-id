'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Edit, Users, AlertCircle } from 'lucide-react'
import { formatDate, calculateProgress } from '@/features/sppg/program/lib/programUtils'
import type { Program } from '@/features/sppg/program/types/program.types'

interface ProgramMonitoringTabProps {
  program: Program
}

export function ProgramMonitoringTab({ program }: ProgramMonitoringTabProps) {
  return (
    <div className="space-y-4 mt-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Menu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">-</p>
            <p className="text-xs text-muted-foreground mt-1">Menu tersedia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Produksi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">-</p>
            <p className="text-xs text-muted-foreground mt-1">Sesi produksi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Distribusi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">-</p>
            <p className="text-xs text-muted-foreground mt-1">Porsi terdistribusi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rata-rata Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">-</p>
            <p className="text-xs text-muted-foreground mt-1">Dari penerima</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Program</CardTitle>
          <CardDescription>
            Riwayat dan status terkini program
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold">Program Dibuat</h4>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(program.createdAt, 'dd MMM yyyy')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Program {program.name} telah didaftarkan dalam sistem
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Edit className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold">Terakhir Diperbarui</h4>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(program.updatedAt, 'dd MMM yyyy HH:mm')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Data program terakhir kali dimodifikasi
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold">Status Penerima</h4>
                  <Badge variant={program.currentRecipients >= program.targetRecipients ? "default" : "secondary"}>
                    {calculateProgress(program.currentRecipients, program.targetRecipients)}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {program.currentRecipients} dari {program.targetRecipients} target penerima terdaftar
                </p>
              </div>
            </div>

            {program.endDate && new Date(program.endDate) < new Date() && (
              <div className="flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-600 dark:text-amber-400">
                    Program Telah Berakhir
                  </h4>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                    Program ini telah melewati tanggal berakhir ({formatDate(program.endDate, 'dd MMM yyyy')}). 
                    Pertimbangkan untuk mengubah status atau memperpanjang program.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrasi Data</CardTitle>
          <CardDescription>
            Data terkait dari modul lain akan ditampilkan di sini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Fitur monitoring lengkap dengan integrasi menu, produksi, dan distribusi akan segera tersedia
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
