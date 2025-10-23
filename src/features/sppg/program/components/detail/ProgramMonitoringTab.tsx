'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Edit, Users, AlertCircle, UtensilsCrossed, Factory, Truck, TrendingUp } from 'lucide-react'
import { formatDate, calculateProgress } from '@/features/sppg/program/lib/programUtils'
import type { Program, ProgramWithStats } from '@/features/sppg/program/types/program.types'
import Link from 'next/link'

interface ProgramMonitoringTabProps {
  program: Program
  programStats?: ProgramWithStats
  programId: string
}

export function ProgramMonitoringTab({ program, programStats, programId }: ProgramMonitoringTabProps) {
  const stats = programStats?._count || {
    menus: 0,
    menuPlans: 0,
    productions: 0,
    distributions: 0,
    schools: 0,
    feedback: 0,
  }

  return (
    <div className="space-y-4 mt-4">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-primary" />
              Total Menu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.menus}</p>
            <p className="text-xs text-muted-foreground mt-1">Menu tersedia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Factory className="h-4 w-4 text-primary" />
              Total Produksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.productions}</p>
            <p className="text-xs text-muted-foreground mt-1">Sesi produksi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              Total Distribusi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.distributions}</p>
            <p className="text-xs text-muted-foreground mt-1">Porsi terdistribusi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Total Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.feedback}</p>
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
            Data terkait dari modul lain
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.menus > 0 || stats.productions > 0 || stats.distributions > 0 ? (
            <div className="space-y-4">
              {/* Menu Integration */}
              {stats.menus > 0 && (
                <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                    <UtensilsCrossed className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold">Menu Tersedia</h4>
                      <Badge variant="secondary">{stats.menus} menu</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Program ini memiliki {stats.menus} menu yang sudah dikonfigurasi dengan informasi nutrisi lengkap
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/menu?programId=${programId}`}>
                        Lihat Daftar Menu
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* Production Integration */}
              {stats.productions > 0 && (
                <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Factory className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold">Sesi Produksi</h4>
                      <Badge variant="secondary">{stats.productions} sesi</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Terdapat {stats.productions} sesi produksi makanan yang telah dilakukan untuk program ini
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/production?programId=${programId}`}>
                        Lihat Data Produksi
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* Distribution Integration */}
              {stats.distributions > 0 && (
                <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold">Distribusi Makanan</h4>
                      <Badge variant="secondary">{stats.distributions} distribusi</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Program telah melakukan {stats.distributions} distribusi makanan ke sekolah mitra
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/distribution?programId=${programId}`}>
                        Lihat Data Distribusi
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* Summary Card */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-primary mb-1">
                      Integrasi Aktif
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Program ini telah terintegrasi dengan {
                        [
                          stats.menus > 0 && 'Menu',
                          stats.productions > 0 && 'Produksi',
                          stats.distributions > 0 && 'Distribusi'
                        ].filter(Boolean).join(', ')
                      }. Data akan otomatis tersinkronisasi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Belum Ada Data Integrasi</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Program ini belum memiliki data terkait dari modul lain
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/menu/create?programId=${programId}`}>
                    <UtensilsCrossed className="h-4 w-4 mr-2" />
                    Tambah Menu
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/production/create?programId=${programId}`}>
                    <Factory className="h-4 w-4 mr-2" />
                    Mulai Produksi
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/distribution/create?programId=${programId}`}>
                    <Truck className="h-4 w-4 mr-2" />
                    Atur Distribusi
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
