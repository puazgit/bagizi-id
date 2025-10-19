/**
 * @fileoverview Execution Issues Card Component
 * @version shadcn/ui + React 19
 * @see {@link /docs/copilot-instructions.md} Component Guidelines
 */

'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Filter,
} from 'lucide-react'
import type {
  ExecutionIssueData,
  IssuesSummary,
} from '@/features/sppg/distribution/execution/api/executionIssuesApi'
import type { IssueType, IssueSeverity } from '@prisma/client'

/**
 * Issue type configuration with icons and labels
 */
const ISSUE_TYPE_CONFIG: Record<
  IssueType,
  { label: string; icon: string; color: string }
> = {
  VEHICLE_BREAKDOWN: { label: 'Kerusakan Kendaraan', icon: '🚗', color: 'red' },
  WEATHER_DELAY: { label: 'Cuaca Buruk', icon: '🌧️', color: 'blue' },
  TRAFFIC_JAM: { label: 'Kemacetan', icon: '🚦', color: 'yellow' },
  ACCESS_DENIED: { label: 'Akses Ditolak', icon: '🚫', color: 'orange' },
  RECIPIENT_UNAVAILABLE: { label: 'Penerima Tidak Ada', icon: '👤', color: 'purple' },
  FOOD_QUALITY: { label: 'Kualitas Makanan', icon: '🍱', color: 'red' },
  SHORTAGE: { label: 'Kekurangan', icon: '📦', color: 'orange' },
  OTHER: { label: 'Lainnya', icon: '📋', color: 'gray' },
}

/**
 * Severity configuration with colors and labels
 */
const SEVERITY_CONFIG: Record<
  IssueSeverity,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }
> = {
  CRITICAL: {
    label: 'Kritis',
    variant: 'destructive',
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  HIGH: {
    label: 'Tinggi',
    variant: 'destructive',
    icon: <AlertCircle className="h-4 w-4" />,
  },
  MEDIUM: {
    label: 'Sedang',
    variant: 'default',
    icon: <AlertCircle className="h-4 w-4" />,
  },
  LOW: {
    label: 'Rendah',
    variant: 'secondary',
    icon: <AlertCircle className="h-4 w-4" />,
  },
}

interface ExecutionIssuesCardProps {
  issues: ExecutionIssueData[]
  summary: IssuesSummary
  isLoading?: boolean
  error?: string | null
}

/**
 * Execution Issues Card Component
 * 
 * Displays distribution issues with:
 * - Severity badges and filtering
 * - Issue type categorization
 * - Resolution status tracking
 * - Timeline view
 * - Summary statistics
 * 
 * @param props - Component props
 */
export function ExecutionIssuesCard({
  issues,
  summary,
  isLoading = false,
  error = null,
}: ExecutionIssuesCardProps) {
  const [filterSeverity, setFilterSeverity] = useState<IssueSeverity | 'ALL'>('ALL')
  const [filterType, setFilterType] = useState<IssueType | 'ALL'>('ALL')
  const [filterResolved, setFilterResolved] = useState<'ALL' | 'RESOLVED' | 'UNRESOLVED'>('ALL')

  // Apply filters
  const filteredIssues = issues.filter((issue) => {
    if (filterSeverity !== 'ALL' && issue.severity !== filterSeverity) return false
    if (filterType !== 'ALL' && issue.issueType !== filterType) return false
    if (filterResolved === 'RESOLVED' && !issue.resolvedAt) return false
    if (filterResolved === 'UNRESOLVED' && issue.resolvedAt) return false
    return true
  })

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Masalah & Kendala
          </CardTitle>
          <CardDescription>Pelacakan masalah distribusi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Masalah & Kendala
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Gagal Memuat Data</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Masalah & Kendala
            </CardTitle>
            <CardDescription>
              Pelacakan dan resolusi masalah distribusi
            </CardDescription>
          </div>
          
          {/* Summary badges */}
          <div className="flex gap-2">
            <Badge variant="outline" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {summary.unresolved} Belum Selesai
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {summary.resolved} Selesai
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* By Severity */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Berdasarkan Tingkat</p>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Kritis
                </span>
                <span className="font-semibold">{summary.bySeverity.CRITICAL}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                  Tinggi
                </span>
                <span className="font-semibold">{summary.bySeverity.HIGH}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  Sedang
                </span>
                <span className="font-semibold">{summary.bySeverity.MEDIUM}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Rendah
                </span>
                <span className="font-semibold">{summary.bySeverity.LOW}</span>
              </div>
            </div>
          </div>

          {/* Top Issues */}
          <div className="space-y-2 md:col-span-3">
            <p className="text-sm font-medium text-muted-foreground">Masalah Terbanyak</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(summary.byType)
                .filter(([, count]) => count > 0)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([type, count]) => {
                  const config = ISSUE_TYPE_CONFIG[type as IssueType]
                  return (
                    <div
                      key={type}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                      <span className="text-sm flex items-center gap-1">
                        <span>{config.icon}</span>
                        {config.label}
                      </span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>

        <Separator />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter:</span>
          </div>

          {/* Severity Filter */}
          <Select
            value={filterSeverity}
            onValueChange={(value) => setFilterSeverity(value as IssueSeverity | 'ALL')}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tingkat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Tingkat</SelectItem>
              <SelectItem value="CRITICAL">🔴 Kritis</SelectItem>
              <SelectItem value="HIGH">🟠 Tinggi</SelectItem>
              <SelectItem value="MEDIUM">🟡 Sedang</SelectItem>
              <SelectItem value="LOW">🔵 Rendah</SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select
            value={filterType}
            onValueChange={(value) => setFilterType(value as IssueType | 'ALL')}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Jenis Masalah" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Jenis</SelectItem>
              {Object.entries(ISSUE_TYPE_CONFIG).map(([type, config]) => (
                <SelectItem key={type} value={type}>
                  {config.icon} {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Resolution Status Filter */}
          <Select
            value={filterResolved}
            onValueChange={(value) => setFilterResolved(value as 'ALL' | 'RESOLVED' | 'UNRESOLVED')}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="UNRESOLVED">⏳ Belum Selesai</SelectItem>
              <SelectItem value="RESOLVED">✅ Selesai</SelectItem>
            </SelectContent>
          </Select>

          {/* Results count */}
          <Badge variant="outline" className="ml-auto">
            {filteredIssues.length} dari {issues.length}
          </Badge>
        </div>

        {/* Issues List */}
        {filteredIssues.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">
              {issues.length === 0 ? 'Tidak Ada Masalah' : 'Tidak Ada Hasil dengan Filter Ini'}
            </p>
            <p className="text-sm text-muted-foreground">
              {issues.length === 0
                ? 'Distribusi berjalan lancar tanpa kendala'
                : 'Coba ubah filter untuk melihat masalah lainnya'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map((issue) => {
              const typeConfig = ISSUE_TYPE_CONFIG[issue.issueType]
              const severityConfig = SEVERITY_CONFIG[issue.severity]

              return (
                <div
                  key={issue.id}
                  className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Issue Type Icon */}
                      <div className="text-2xl mt-1">{typeConfig.icon}</div>

                      <div className="flex-1 space-y-1">
                        {/* Type and Severity */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold">{typeConfig.label}</h4>
                          <Badge variant={severityConfig.variant} className="gap-1">
                            {severityConfig.icon}
                            {severityConfig.label}
                          </Badge>
                          {issue.resolvedAt && (
                            <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                              <CheckCircle2 className="h-3 w-3" />
                              Selesai
                            </Badge>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-sm text-foreground">{issue.description}</p>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Dilaporkan {format(issue.reportedAt, "dd MMM yyyy 'pukul' HH:mm", { locale: localeId })}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {issue.reportedBy}
                          </span>
                          {issue.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {issue.location}
                            </span>
                          )}
                          {issue.affectedDeliveries.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {issue.affectedDeliveries.length} pengiriman terpengaruh
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resolution Details */}
                  {issue.resolvedAt && (
                    <>
                      <Separator className="my-3" />
                      <div className="flex items-start gap-3 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        <div className="flex-1 space-y-1">
                          <p className="font-medium text-green-600">Resolusi</p>
                          {issue.resolutionNotes && (
                            <p className="text-foreground">{issue.resolutionNotes}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Diselesaikan {format(issue.resolvedAt, "dd MMM yyyy 'pukul' HH:mm", { locale: localeId })}
                            </span>
                            {issue.resolvedBy && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {issue.resolvedBy}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
