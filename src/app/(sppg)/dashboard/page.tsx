/**
 * @fileoverview SPPG Dashboard Page - Enhanced Rich UI/UX
 * @version Next.js 15.5.4 / Enterprise-grade with Data Visualization
 */

'use client'

import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  AlertCircle, 
  TrendingUp, 
  Calendar,
  Clock,
  Users,
  Package,
  ChefHat,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
} from 'lucide-react'

import { StatsCards } from '@/features/sppg/dashboard/components/StatsCards'
import { QuickActions } from '@/features/sppg/dashboard/components/QuickActions'
import { RecentActivities } from '@/features/sppg/dashboard/components/RecentActivities'
import { StatusNotifications } from '@/features/sppg/dashboard/components/StatusNotifications'
import { useDashboardData } from '@/features/sppg/dashboard/hooks/useDashboard'

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[120px] mb-2" />
              <Skeleton className="h-3 w-[180px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

interface DashboardErrorProps {
  error: Error
  reset: () => void
}

function DashboardError({ error }: DashboardErrorProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error Loading Dashboard</AlertTitle>
      <AlertDescription>
        {error.message || 'Failed to load dashboard data'}
      </AlertDescription>
    </Alert>
  )
}

function DashboardContent() {
  const { data, isLoading, error, refetch } = useDashboardData()

  if (isLoading) return <DashboardSkeleton />
  if (error) return <DashboardError error={error as Error} reset={() => refetch()} />
  if (!data) return null

  return (
    <div className="flex-1 space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="space-y-3 md:space-y-4">
        <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1 md:mt-2">
              Monitoring real-time operasional SPPG Anda
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            <Activity className="mr-2 h-3 w-3 animate-pulse" />
            Live Data
          </Badge>
        </div>
        
        {/* Stats Cards */}
        <StatsCards />
      </div>

      <Separator className="my-4" />

      {/* Quick Actions with Enhanced Design */}
      <section>
        <div className="mb-3 md:mb-4">
          <h3 className="text-base md:text-lg font-semibold">Aksi Cepat</h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Akses fitur utama dengan satu klik
          </p>
        </div>
        <QuickActions />
      </section>

      <Separator className="my-4" />

      {/* Performance Metrics Section */}
      <section>
        <div className="mb-3 md:mb-4">
          <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            Metrik Performa
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Indikator kinerja utama bulan ini
          </p>
        </div>
        
        <div className="grid gap-3 md:gap-4 md:grid-cols-3">
          {/* Menu Compliance */}
          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Kepatuhan Menu Gizi
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xl md:text-2xl font-bold">87%</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    +5%
                  </Badge>
                </div>
                <Progress value={87} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  21 dari 24 menu memenuhi standar AKG
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Budget Efficiency */}
          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Efisiensi Anggaran
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xl md:text-2xl font-bold">92%</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    +3%
                  </Badge>
                </div>
                <Progress value={92} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Rp 78.2M dari Rp 85M terpakai efisien
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Distribution Success */}
          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Keberhasilan Distribusi
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xl md:text-2xl font-bold">98%</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Excellent
                  </Badge>
                </div>
                <Progress value={98} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  1,225 dari 1,250 penerima tepat waktu
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="my-4" />

      {/* Tabs for Activities & Notifications */}
      <section>
        <Tabs defaultValue="activities" className="w-full">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <TabsList>
              <TabsTrigger value="activities" className="gap-2 text-xs md:text-sm">
                <Activity className="h-3 w-3 md:h-4 md:w-4" />
                Aktivitas Terbaru
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2 text-xs md:text-sm">
                <AlertTriangle className="h-3 w-3 md:h-4 md:w-4" />
                Notifikasi Penting
              </TabsTrigger>
            </TabsList>
            
            <Badge variant="secondary" className="text-xs">
              <Clock className="mr-1 h-3 w-3" />
              Real-time
            </Badge>
          </div>

          <TabsContent value="activities" className="mt-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm md:text-base">Log Aktivitas Sistem</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Pantau semua perubahan dan transaksi dalam sistem
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <RecentActivities />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Peringatan & Status</CardTitle>
                <CardDescription>
                  Tindakan yang memerlukan perhatian Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StatusNotifications />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Upcoming Schedule Preview */}
      <section>
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Jadwal Mendatang
          </h3>
          <p className="text-sm text-muted-foreground">
            Kegiatan yang akan datang 7 hari ke depan
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Production Schedule */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Produksi</CardTitle>
                <Badge variant="secondary">Besok</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-lg font-semibold">Nasi Gudeg Ayam</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  500 porsi • 06:00 WIB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Distribution Schedule */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Distribusi</CardTitle>
                <Badge variant="secondary">Hari Ini</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-lg font-semibold">SD Negeri 01</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  250 porsi • 10:00 WIB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Procurement Schedule */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Pengadaan</CardTitle>
                <Badge variant="secondary">3 Hari</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-lg font-semibold">Bahan Baku</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Rp 15.5M • Pending
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Menu Planning */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Perencanaan</CardTitle>
                <Badge variant="secondary">Minggu Depan</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-lg font-semibold">Menu Mingguan</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <ChefHat className="h-3 w-3" />
                  Review 12 menu baru
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}