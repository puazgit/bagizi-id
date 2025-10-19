'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Users,
  TrendingUp,
  MapPin,
  RefreshCw,
} from 'lucide-react'
import { useActiveExecutions, useExecutionStatistics } from '../hooks'
import { EXECUTION_STATUS_LABELS, EXECUTION_STATUS_COLORS } from '../types'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface ExecutionMonitorProps {
  autoRefresh?: boolean
  refreshInterval?: number // In milliseconds
}

export function ExecutionMonitor({
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds default
}: ExecutionMonitorProps) {
  // Fetch active executions with auto-refresh
  const { data: activeResponse, isLoading: executionsLoading } = useActiveExecutions()
  const activeExecutions = activeResponse?.executions || []

  // Fetch statistics
  const { data: stats, isLoading: statsLoading } = useExecutionStatistics()

  const isLoading = executionsLoading || statsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Calculate real-time metrics
  const totalActive = activeExecutions.length
  const totalIssues = activeExecutions.reduce((sum: number, exec) => sum + (exec.issuesCount || 0), 0)
  const avgProgress = totalActive > 0
    ? Math.round(
        activeExecutions.reduce((sum: number, exec) => {
          const progress = exec.plannedPortions > 0
            ? (exec.totalPortionsDelivered || 0) / exec.plannedPortions
            : 0
          return sum + progress
        }, 0) / totalActive * 100
      )
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Monitor Eksekusi Real-Time
          </h2>
          <p className="text-muted-foreground mt-1">
            {autoRefresh && (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Auto-refresh setiap {refreshInterval / 1000} detik
              </span>
            )}
          </p>
        </div>
        <Badge variant="outline" className="text-base px-4 py-2">
          <Clock className="h-4 w-4 mr-2" />
          {format(new Date(), 'HH:mm:ss', { locale: id })}
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Eksekusi Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span className="text-3xl font-bold">{totalActive}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Sedang berlangsung
            </p>
          </CardContent>
        </Card>

        {/* Average Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Progress Rata-rata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-3xl font-bold">{avgProgress}%</span>
            </div>
            <Progress value={avgProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>

        {/* Total Issues */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Masalah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${totalIssues > 0 ? 'text-red-600' : 'text-gray-400'}`} />
              <span className="text-3xl font-bold">{totalIssues}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {totalIssues > 0 ? 'Memerlukan perhatian' : 'Tidak ada masalah'}
            </p>
          </CardContent>
        </Card>

        {/* Completed Today */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Selesai Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-3xl font-bold">{stats?.completedToday || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Eksekusi selesai
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Executions List */}
      {totalActive === 0 ? (
        <Alert>
          <AlertDescription>
            Tidak ada eksekusi yang sedang berlangsung saat ini
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Eksekusi Aktif ({totalActive})
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeExecutions.map((execution) => {
              const delivered = execution.totalPortionsDelivered || 0
              const planned = execution.plannedPortions
              const progress = planned > 0 ? Math.round((delivered / planned) * 100) : 0

              const statusVariant = EXECUTION_STATUS_COLORS[execution.status]
              const statusLabel = EXECUTION_STATUS_LABELS[execution.status]

              const hasIssues = (execution.issuesCount || 0) > 0

              return (
                <Card key={execution.id} className={hasIssues ? 'border-red-300' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">
                          {execution.distributionCode}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {execution.scheduleName}
                        </p>
                      </div>
                      <Badge variant={statusVariant}>
                        {statusLabel}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Time */}
                    {execution.actualStartTime && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Dimulai {format(new Date(execution.actualStartTime), 'HH:mm', { locale: id })}
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress 
                        value={progress} 
                        className={`h-2 ${hasIssues ? 'bg-red-100' : ''}`}
                      />
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                      <div className="text-center">
                        <Package className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                        <p className="text-xs font-semibold">
                          {delivered.toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-muted-foreground">Porsi</p>
                      </div>
                      <div className="text-center">
                        <Users className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                        <p className="text-xs font-semibold">
                          {(execution.totalBeneficiariesReached || 0).toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-muted-foreground">Penerima</p>
                      </div>
                      <div className="text-center">
                        <MapPin className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                        <p className="text-xs font-semibold">
                          {execution.completedDeliveryCount}/{execution.deliveryCount}
                        </p>
                        <p className="text-xs text-muted-foreground">Lokasi</p>
                      </div>
                    </div>

                    {/* Issues Alert */}
                    {hasIssues && (
                      <Alert variant="destructive" className="py-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {execution.issuesCount} masalah dilaporkan
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Overall Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistik Keseluruhan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Eksekusi</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Porsi Dikirim</p>
                <p className="text-2xl font-bold">{stats.totalPortionsDelivered.toLocaleString('id-ID')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Penerima</p>
                <p className="text-2xl font-bold">{stats.totalBeneficiariesReached.toLocaleString('id-ID')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Masalah</p>
                <p className="text-2xl font-bold">{stats.issuesReported}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
