'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FileText,
  User,
  Clock,
  Edit,
  Plus,
  Trash2,
  CheckCircle,
  Eye,
  AlertCircle,
  Download,
  Upload,
  Calendar,
  Shield,
  Loader2,
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { AuditAction } from '@prisma/client'

/**
 * Audit log entry structure
 */
export interface AuditLogEntry {
  id: string
  action: AuditAction
  description?: string | null
  userName?: string | null
  userEmail?: string | null
  oldValues?: Record<string, unknown> | null
  newValues?: Record<string, unknown> | null
  ipAddress?: string | null
  createdAt: Date
  metadata?: Record<string, unknown> | null
}

/**
 * Audit trail data for execution
 */
export interface ExecutionAuditData {
  executionId: string
  logs: AuditLogEntry[]
  isLoading?: boolean
  error?: string | null
}

interface ExecutionAuditTrailProps {
  data: ExecutionAuditData
  compact?: boolean
  maxItems?: number
}

/**
 * Get action label in Indonesian
 */
function getActionLabel(action: AuditAction): string {
  const labels: Record<AuditAction, string> = {
    CREATE: 'Dibuat',
    READ: 'Dilihat',
    UPDATE: 'Diperbarui',
    DELETE: 'Dihapus',
    LOGIN: 'Login',
    LOGOUT: 'Logout',
    EXPORT: 'Diekspor',
    IMPORT: 'Diimpor',
    NOTIFICATION_SEND: 'Notifikasi Dikirim',
    NOTIFICATION_TEMPLATE_CREATE: 'Template Notifikasi Dibuat',
    BULK_NOTIFICATION_PROCESS: 'Notifikasi Bulk Diproses',
    NOTIFICATION_PREFERENCES_UPDATE: 'Preferensi Notifikasi Diperbarui',
    SUBMIT_FOR_REVIEW: 'Diajukan untuk Review',
    APPROVE_PLAN: 'Rencana Disetujui',
    REJECT_PLAN: 'Rencana Ditolak',
    PUBLISH_PLAN: 'Rencana Dipublikasikan',
    CREATE_USER: 'Pengguna Dibuat',
    UPDATE_USER: 'Pengguna Diperbarui',
    DELETE_USER: 'Pengguna Dihapus',
    CHANGE_PASSWORD: 'Password Diubah',
    RESET_PASSWORD: 'Password Direset',
    ACTIVATE_USER: 'Pengguna Diaktifkan',
    DEACTIVATE_USER: 'Pengguna Dinonaktifkan',
  }
  return labels[action] || action
}

/**
 * Get action icon and color
 */
function getActionStyle(action: AuditAction) {
  const styles = {
    CREATE: {
      icon: Plus,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      borderColor: 'border-green-200 dark:border-green-800',
      variant: 'default' as const,
    },
    UPDATE: {
      icon: Edit,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
      variant: 'secondary' as const,
    },
    DELETE: {
      icon: Trash2,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      borderColor: 'border-red-200 dark:border-red-800',
      variant: 'destructive' as const,
    },
    READ: {
      icon: Eye,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-950/30',
      borderColor: 'border-gray-200 dark:border-gray-800',
      variant: 'outline' as const,
    },
    EXPORT: {
      icon: Download,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      borderColor: 'border-purple-200 dark:border-purple-800',
      variant: 'outline' as const,
    },
    IMPORT: {
      icon: Upload,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      borderColor: 'border-purple-200 dark:border-purple-800',
      variant: 'outline' as const,
    },
    APPROVE_PLAN: {
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      borderColor: 'border-green-200 dark:border-green-800',
      variant: 'default' as const,
    },
    REJECT_PLAN: {
      icon: AlertCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      borderColor: 'border-red-200 dark:border-red-800',
      variant: 'destructive' as const,
    },
    PUBLISH_PLAN: {
      icon: Calendar,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
      variant: 'secondary' as const,
    },
    SUBMIT_FOR_REVIEW: {
      icon: FileText,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      borderColor: 'border-orange-200 dark:border-orange-800',
      variant: 'secondary' as const,
    },
  }

  // Return matching style or default
  return (
    styles[action as keyof typeof styles] || {
      icon: FileText,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-950/30',
      borderColor: 'border-gray-200 dark:border-gray-800',
      variant: 'outline' as const,
    }
  )
}

/**
 * Format changed values for display
 */
function formatChanges(
  oldValues?: Record<string, unknown> | null,
  newValues?: Record<string, unknown> | null
): { field: string; from: string; to: string }[] {
  if (!oldValues && !newValues) return []

  const changes: { field: string; from: string; to: string }[] = []
  const allKeys = new Set([
    ...Object.keys(oldValues || {}),
    ...Object.keys(newValues || {}),
  ])

  allKeys.forEach((key) => {
    const oldVal = oldValues?.[key]
    const newVal = newValues?.[key]

    // Skip if values are the same
    if (JSON.stringify(oldVal) === JSON.stringify(newVal)) return

    // Format field name (convert camelCase to readable)
    const fieldName = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim()

    changes.push({
      field: fieldName,
      from: oldVal !== undefined ? String(oldVal) : '-',
      to: newVal !== undefined ? String(newVal) : '-',
    })
  })

  return changes
}

/**
 * Audit Log Entry Component
 */
function AuditLogItem({ log, isLast }: { log: AuditLogEntry; isLast: boolean }) {
  const style = getActionStyle(log.action)
  const Icon = style.icon
  const changes = formatChanges(log.oldValues, log.newValues)

  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-4 top-10 bottom-0 w-0.5 -ml-px bg-border" />
      )}

      {/* Icon */}
      <div className="relative flex-shrink-0">
        <div className={cn('flex items-center justify-center w-8 h-8 rounded-full border-2', style.bgColor, style.borderColor)}>
          <Icon className={cn('w-4 h-4', style.color)} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={style.variant} className="font-medium">
              {getActionLabel(log.action)}
            </Badge>
            {log.userName && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <User className="w-3 h-3" />
                <span>{log.userName}</span>
              </div>
            )}
          </div>
          <time className="text-xs text-muted-foreground whitespace-nowrap">
            {format(log.createdAt, 'dd MMM HH:mm', { locale: id })}
          </time>
        </div>

        {log.description && (
          <p className="text-sm text-foreground mb-2">{log.description}</p>
        )}

        {/* Changed Fields */}
        {changes.length > 0 && (
          <div className="mt-2 space-y-1">
            {changes.map((change, index) => (
              <div
                key={index}
                className="text-xs p-2 rounded bg-muted/50 border border-border"
              >
                <span className="font-medium">{change.field}:</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-muted-foreground line-through">
                    {change.from}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-foreground font-medium">{change.to}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Additional Info */}
        {(log.userEmail || log.ipAddress) && (
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {log.userEmail && (
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {log.userEmail}
              </span>
            )}
            {log.ipAddress && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                IP: {log.ipAddress}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Compact Audit Trail View
 */
function CompactAuditTrail({ logs, maxItems = 5 }: { logs: AuditLogEntry[]; maxItems?: number }) {
  const displayLogs = logs.slice(0, maxItems)
  const hiddenCount = logs.length - displayLogs.length

  if (logs.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        Belum ada riwayat perubahan
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {displayLogs.map((log) => {
        const style = getActionStyle(log.action)
        const Icon = style.icon

        return (
          <div
            key={log.id}
            className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className={cn('p-1.5 rounded-full', style.bgColor)}>
              <Icon className={cn('w-3 h-3', style.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {getActionLabel(log.action)}
                {log.userName && (
                  <span className="text-muted-foreground font-normal ml-2">
                    oleh {log.userName}
                  </span>
                )}
              </p>
            </div>
            <time className="text-xs text-muted-foreground whitespace-nowrap">
              {format(log.createdAt, 'HH:mm', { locale: id })}
            </time>
          </div>
        )
      })}

      {hiddenCount > 0 && (
        <div className="text-center text-xs text-muted-foreground pt-2">
          +{hiddenCount} riwayat lainnya
        </div>
      )}
    </div>
  )
}

/**
 * Main Execution Audit Trail Component
 */
export function ExecutionAuditTrail({
  data,
  compact = false,
  maxItems = 10,
}: ExecutionAuditTrailProps) {
  const { logs, isLoading, error } = data

  // Loading State
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Riwayat Audit
            </CardTitle>
            <Skeleton className="h-6 w-20" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Memuat riwayat audit...
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error State
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Riwayat Audit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold">Gagal memuat riwayat audit</p>
              <p className="text-sm mt-1">{error}</p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Group logs by date
  const logsByDate = logs.reduce((acc, log) => {
    const dateKey = format(log.createdAt, 'yyyy-MM-dd')
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(log)
    return acc
  }, {} as Record<string, AuditLogEntry[]>)

  const sortedDates = Object.keys(logsByDate).sort((a, b) => b.localeCompare(a))

  if (compact) {
    return <CompactAuditTrail logs={logs} maxItems={maxItems} />
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Belum Ada Riwayat Audit</p>
            <p className="text-sm mt-1">
              Semua perubahan pada eksekusi distribusi akan tercatat di sini
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Riwayat Audit
          </CardTitle>
          <Badge variant="outline">{logs.length} aktivitas</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Compliance Notice */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Semua perubahan tercatat untuk kepatuhan dan audit. Log bersifat{' '}
            <span className="font-semibold">immutable</span> dan tidak dapat diubah.
          </AlertDescription>
        </Alert>

        <Separator />

        {/* Logs by Date */}
        {sortedDates.map((dateKey, dateIndex) => {
          const dateLogs = logsByDate[dateKey]
          const dateObj = new Date(dateKey)

          return (
            <div key={dateKey} className="space-y-4">
              {/* Date Header */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">
                  {format(dateObj, 'EEEE, dd MMMM yyyy', { locale: id })}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {dateLogs.length}
                </Badge>
              </div>

              {/* Date Logs */}
              <div className="space-y-0 ml-6">
                {dateLogs.map((log, index) => (
                  <AuditLogItem
                    key={log.id}
                    log={log}
                    isLast={index === dateLogs.length - 1 && dateIndex === sortedDates.length - 1}
                  />
                ))}
              </div>

              {/* Separator between dates */}
              {dateIndex < sortedDates.length - 1 && <Separator className="my-4" />}
            </div>
          )
        })}

        {/* Footer */}
        <div className="pt-4 border-t text-xs text-muted-foreground text-center">
          Total {logs.length} aktivitas tercatat • Compliance-ready audit trail
        </div>
      </CardContent>
    </Card>
  )
}
