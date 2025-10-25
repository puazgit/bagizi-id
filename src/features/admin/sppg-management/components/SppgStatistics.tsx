/**
 * SPPG Statistics Component
 * Displays comprehensive statistics for admin dashboard
 * 
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useSppgStatistics } from '../hooks'
import { 
  Building2, 
  Users, 
  BookOpen, 
  Users2,
  TrendingUp,
  MapPin,
  AlertCircle
} from 'lucide-react'

/**
 * Statistics card component
 */
interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

function StatCard({ title, value, icon, description, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString('id-ID')}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp className={`h-4 w-4 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-xs ml-1 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Main statistics component
 */
export function SppgStatistics() {
  const { data: stats, isLoading, error } = useSppgStatistics()

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Gagal memuat statistik. Silakan refresh halaman.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const { totals, aggregates, byOrganizationType, byProvince, recent } = stats

  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total SPPG"
          value={totals.totalSppg}
          icon={<Building2 className="h-4 w-4" />}
          description={`${totals.activeSppg} aktif, ${totals.suspendedSppg} suspended`}
        />
        <StatCard
          title="Total Users"
          value={aggregates.totalUsers}
          icon={<Users className="h-4 w-4" />}
          description={`Rata-rata ${aggregates.averageUsersPerSppg.toFixed(1)} per SPPG`}
        />
        <StatCard
          title="Total Program"
          value={aggregates.totalPrograms}
          icon={<BookOpen className="h-4 w-4" />}
          description={`Rata-rata ${aggregates.averageProgramsPerSppg.toFixed(1)} per SPPG`}
        />
        <StatCard
          title="Total Penerima"
          value={aggregates.totalBeneficiaries}
          icon={<Users2 className="h-4 w-4" />}
          description={`Rata-rata ${aggregates.averageBeneficiariesPerSppg.toFixed(0)} per SPPG`}
        />
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status SPPG</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-green-600">
                {totals.activeSppg}
              </span>
              <span className="text-xs text-muted-foreground">Aktif</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-600">
                {totals.inactiveSppg}
              </span>
              <span className="text-xs text-muted-foreground">Tidak Aktif</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-orange-600">
                {totals.suspendedSppg}
              </span>
              <span className="text-xs text-muted-foreground">Suspended</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-blue-600">
                {totals.demoSppg}
              </span>
              <span className="text-xs text-muted-foreground">Demo</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* By Organization Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Berdasarkan Jenis Organisasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {byOrganizationType.map((stat) => (
                <div key={stat.organizationType} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{stat.organizationType}</Badge>
                  </div>
                  <span className="font-semibold">{stat.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* By Province (Top 10) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Top 10 Provinsi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {byProvince.slice(0, 10).map((stat, index) => (
                <div key={stat.provinceId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4">
                      {index + 1}.
                    </span>
                    <span className="text-sm">{stat.provinceName}</span>
                  </div>
                  <Badge variant="secondary">{stat.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent SPPG */}
      {recent && recent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">SPPG Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recent.map((sppg) => (
                <div key={sppg.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                  <div className="space-y-1">
                    <p className="font-medium">{sppg.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {sppg.code}
                      </Badge>
                      <span>•</span>
                      <span>{sppg.province?.name}</span>
                      <span>•</span>
                      <span>{sppg.organizationType}</span>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      sppg.status === 'ACTIVE' ? 'default' :
                      sppg.status === 'SUSPENDED' ? 'destructive' :
                      'secondary'
                    }
                  >
                    {sppg.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated timestamp */}
      <p className="text-xs text-muted-foreground text-center">
        Statistik diperbarui: {new Date(stats.generatedAt).toLocaleString('id-ID')}
      </p>
    </div>
  )
}
