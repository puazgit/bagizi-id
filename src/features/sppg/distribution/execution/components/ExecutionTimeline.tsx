'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  Clock,
  TruckIcon,
  MapPin,
  CheckCircle2,
  Circle,
  PlayCircle,
  PauseCircle,
  AlertCircle,
  Flag,
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { DistributionStatus } from '@prisma/client'

/**
 * Timeline event data structure
 */
export interface TimelineEvent {
  id: string
  title: string
  description?: string
  timestamp?: Date | null
  status: 'completed' | 'current' | 'pending' | 'skipped'
  icon?: 'calendar' | 'play' | 'truck' | 'mappin' | 'check' | 'flag' | 'pause' | 'alert'
  metadata?: {
    duration?: string
    location?: string
    details?: string
  }
}

/**
 * Timeline data for distribution execution
 */
export interface ExecutionTimelineData {
  // Status
  status: DistributionStatus
  
  // Key timestamps
  createdAt: Date
  scheduledDate?: Date | null
  actualStartTime?: Date | null
  departureTime?: Date | null
  arrivalTime?: Date | null
  completionTime?: Date | null
  actualEndTime?: Date | null
  
  // Delivery tracking
  totalDeliveries?: number
  completedDeliveries?: number
  firstDeliveryTime?: Date | null
  lastDeliveryTime?: Date | null
}

interface ExecutionTimelineProps {
  data: ExecutionTimelineData
  compact?: boolean
}

/**
 * Get icon component by type
 */
function getIconComponent(iconType: TimelineEvent['icon']) {
  const icons = {
    calendar: Calendar,
    play: PlayCircle,
    truck: TruckIcon,
    mappin: MapPin,
    check: CheckCircle2,
    flag: Flag,
    pause: PauseCircle,
    alert: AlertCircle,
  }
  
  if (!iconType) return Circle
  return icons[iconType] || Circle
}

/**
 * Get status color classes
 */
function getStatusColor(status: TimelineEvent['status']) {
  const colors = {
    completed: {
      icon: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-950/30',
      border: 'border-green-300 dark:border-green-700',
      line: 'bg-green-300 dark:bg-green-700',
    },
    current: {
      icon: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-950/30',
      border: 'border-blue-300 dark:border-blue-700',
      line: 'bg-gradient-to-b from-green-300 to-blue-300 dark:from-green-700 dark:to-blue-700',
    },
    pending: {
      icon: 'text-gray-400 dark:text-gray-600',
      bg: 'bg-gray-100 dark:bg-gray-900/30',
      border: 'border-gray-300 dark:border-gray-700',
      line: 'bg-gray-200 dark:bg-gray-800',
    },
    skipped: {
      icon: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-950/30',
      border: 'border-orange-300 dark:border-orange-700',
      line: 'bg-orange-200 dark:bg-orange-800',
    },
  }
  return colors[status]
}

/**
 * Calculate duration between two dates
 */
function calculateDuration(start?: Date | null, end?: Date | null): string | undefined {
  if (!start || !end) return undefined
  
  // Ensure both are Date objects
  const startDate = start instanceof Date ? start : new Date(start)
  const endDate = end instanceof Date ? end : new Date(end)
  
  // Check if dates are valid
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return undefined
  
  const diffMs = endDate.getTime() - startDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 60) {
    return `${diffMins} menit`
  } else {
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return mins > 0 ? `${hours} jam ${mins} menit` : `${hours} jam`
  }
}

/**
 * Build timeline events from execution data
 */
function buildTimelineEvents(data: ExecutionTimelineData): TimelineEvent[] {
  const events: TimelineEvent[] = []
  
  // Check if execution is in progress (any active status)
  const isInProgress = ['PREPARING', 'IN_TRANSIT', 'DISTRIBUTING'].includes(data.status)

  // 1. Scheduled
  events.push({
    id: 'scheduled',
    title: 'Dijadwalkan',
    description: data.scheduledDate
      ? format(data.scheduledDate, 'EEEE, dd MMMM yyyy', { locale: id })
      : 'Belum ada jadwal',
    timestamp: data.scheduledDate || data.createdAt,
    status: 'completed',
    icon: 'calendar',
  })

  // 2. Started/Departed
  const hasStarted = data.actualStartTime || data.departureTime
  
  events.push({
    id: 'started',
    title: 'Dimulai',
    description: hasStarted
      ? `Berangkat pada ${format(hasStarted, 'HH:mm', { locale: id })}`
      : 'Belum dimulai',
    timestamp: hasStarted,
    status: hasStarted
      ? 'completed'
      : isInProgress
      ? 'current'
      : 'pending',
    icon: 'play',
    metadata: {
      duration: calculateDuration(data.scheduledDate, hasStarted),
    },
  })

  // 3. In Transit (if departure time available)
  if (data.departureTime) {
    events.push({
      id: 'transit',
      title: 'Dalam Perjalanan',
      description: `Berangkat ${format(data.departureTime, 'HH:mm', { locale: id })}`,
      timestamp: data.departureTime,
      status: data.arrivalTime
        ? 'completed'
        : (data.status === 'IN_TRANSIT' || data.status === 'DISTRIBUTING')
        ? 'current'
        : 'pending',
      icon: 'truck',
      metadata: {
        duration: calculateDuration(data.departureTime, data.arrivalTime),
      },
    })
  }

  // 4. First Delivery (if available)
  if (data.firstDeliveryTime) {
    events.push({
      id: 'first-delivery',
      title: 'Pengiriman Pertama',
      description: `Tiba ${format(data.firstDeliveryTime, 'HH:mm', { locale: id })}`,
      timestamp: data.firstDeliveryTime,
      status: 'completed',
      icon: 'mappin',
      metadata: {
        duration: calculateDuration(data.departureTime, data.firstDeliveryTime),
      },
    })
  }

  // 5. Deliveries Progress (if multiple deliveries)
  if (data.totalDeliveries && data.totalDeliveries > 0) {
    const completedCount = data.completedDeliveries || 0
    const isAllCompleted = completedCount === data.totalDeliveries
    const hasStartedDeliveries = completedCount > 0

    events.push({
      id: 'deliveries',
      title: 'Pengiriman',
      description: `${completedCount} dari ${data.totalDeliveries} sekolah`,
      timestamp: data.firstDeliveryTime || data.arrivalTime,
      status: isAllCompleted
        ? 'completed'
        : hasStartedDeliveries
        ? 'current'
        : 'pending',
      icon: 'mappin',
      metadata: {
        details: `${Math.round((completedCount / data.totalDeliveries) * 100)}% selesai`,
      },
    })
  }

  // 6. Last Delivery (if available)
  if (data.lastDeliveryTime && data.completedDeliveries === data.totalDeliveries) {
    events.push({
      id: 'last-delivery',
      title: 'Pengiriman Terakhir',
      description: `Selesai ${format(data.lastDeliveryTime, 'HH:mm', { locale: id })}`,
      timestamp: data.lastDeliveryTime,
      status: 'completed',
      icon: 'check',
      metadata: {
        duration: calculateDuration(data.firstDeliveryTime, data.lastDeliveryTime),
      },
    })
  }

  // 7. Completed
  const completionTimestamp = data.completionTime || data.actualEndTime
  events.push({
    id: 'completed',
    title: 'Selesai',
    description: completionTimestamp
      ? `Diselesaikan pada ${format(completionTimestamp, 'HH:mm', { locale: id })}`
      : data.status === 'COMPLETED'
      ? 'Distribusi selesai'
      : 'Belum selesai',
    timestamp: completionTimestamp,
    status:
      data.status === 'COMPLETED'
        ? 'completed'
        : data.status === 'CANCELLED'
        ? 'skipped'
        : isInProgress
        ? 'pending'
        : 'pending',
    icon: data.status === 'COMPLETED' ? 'flag' : data.status === 'CANCELLED' ? 'alert' : 'flag',
    metadata: {
      duration: calculateDuration(hasStarted, completionTimestamp),
      details:
        data.status === 'COMPLETED'
          ? 'Semua pengiriman selesai'
          : data.status === 'CANCELLED'
          ? 'Dibatalkan'
          : undefined,
    },
  })

  return events
}

/**
 * Timeline Event Item Component
 */
function TimelineEventItem({
  event,
  isLast,
  showLine,
}: {
  event: TimelineEvent
  isLast: boolean
  showLine: boolean
}) {
  const Icon = getIconComponent(event.icon)
  const colors = getStatusColor(event.status)

  return (
    <div className="relative flex gap-4 pb-8 last:pb-0">
      {/* Timeline line */}
      {!isLast && showLine && (
        <div className="absolute left-4 top-10 bottom-0 w-0.5 -ml-px">
          <div className={cn('h-full w-full', colors.line)} />
        </div>
      )}

      {/* Icon */}
      <div className="relative flex-shrink-0">
        <div
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-full border-2',
            colors.bg,
            colors.border
          )}
        >
          <Icon className={cn('w-4 h-4', colors.icon)} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-semibold text-sm">{event.title}</h4>
          {event.timestamp && (
            <time className="text-xs text-muted-foreground whitespace-nowrap">
              {format(event.timestamp, 'HH:mm', { locale: id })}
            </time>
          )}
        </div>

        {event.description && (
          <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
        )}

        {/* Metadata */}
        {event.metadata && (
          <div className="flex flex-wrap gap-2 text-xs">
            {event.metadata.duration && (
              <Badge variant="outline" className="font-normal">
                <Clock className="w-3 h-3 mr-1" />
                {event.metadata.duration}
              </Badge>
            )}
            {event.metadata.location && (
              <Badge variant="outline" className="font-normal">
                <MapPin className="w-3 h-3 mr-1" />
                {event.metadata.location}
              </Badge>
            )}
            {event.metadata.details && (
              <span className="text-muted-foreground">{event.metadata.details}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Compact Timeline View
 */
function CompactTimeline({ events }: { events: TimelineEvent[] }) {
  const completedEvents = events.filter((e) => e.status === 'completed').length
  const totalEvents = events.length
  const progress = (completedEvents / totalEvents) * 100

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Progress Timeline</span>
        <span className="text-muted-foreground">
          {completedEvents}/{totalEvents} tahap
        </span>
      </div>

      <div className="flex items-center gap-1">
        {events.map((event) => {
          const colors = getStatusColor(event.status)
          const Icon = getIconComponent(event.icon)

          return (
            <div
              key={event.id}
              className="flex-1 flex flex-col items-center gap-1"
              title={`${event.title}${event.timestamp ? ` - ${format(event.timestamp, 'HH:mm')}` : ''}`}
            >
              <div className={cn('w-full h-1 rounded', colors.line)} />
              <Icon className={cn('w-4 h-4', colors.icon)} />
            </div>
          )
        })}
      </div>

      <div className="text-xs text-muted-foreground text-center">{progress.toFixed(0)}% selesai</div>
    </div>
  )
}

/**
 * Main Execution Timeline Component
 */
export function ExecutionTimeline({ data, compact = false }: ExecutionTimelineProps) {
  const events = buildTimelineEvents(data)
  const currentEvent = events.find((e) => e.status === 'current')
  const completedCount = events.filter((e) => e.status === 'completed').length
  const totalEvents = events.length

  if (compact) {
    return <CompactTimeline events={events} />
  }

  // Calculate total execution time
  const executionStart = data.actualStartTime || data.departureTime
  const executionEnd = data.completionTime || data.actualEndTime
  const totalDuration = calculateDuration(executionStart, executionEnd)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timeline Eksekusi
          </CardTitle>
          <Badge variant="outline">
            {completedCount}/{totalEvents} tahap
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="font-semibold capitalize">
              {data.status === 'SCHEDULED'
                ? 'Terjadwal'
                : data.status === 'PREPARING'
                ? 'Persiapan'
                : data.status === 'IN_TRANSIT'
                ? 'Dalam Perjalanan'
                : data.status === 'DISTRIBUTING'
                ? 'Distribusi'
                : data.status === 'COMPLETED'
                ? 'Selesai'
                : data.status === 'CANCELLED'
                ? 'Dibatalkan'
                : data.status}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Mulai</p>
            <p className="font-semibold">
              {executionStart ? format(executionStart, 'HH:mm') : '-'}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Selesai</p>
            <p className="font-semibold">
              {executionEnd ? format(executionEnd, 'HH:mm') : '-'}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Durasi Total</p>
            <p className="font-semibold">{totalDuration || '-'}</p>
          </div>
        </div>

        {/* Current Status Highlight */}
        {currentEvent && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-medium mb-1">
              <PlayCircle className="h-4 w-4" />
              <span>Sedang Berlangsung</span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400">{currentEvent.title}</p>
            {currentEvent.description && (
              <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">
                {currentEvent.description}
              </p>
            )}
          </div>
        )}

        <Separator />

        {/* Timeline Events */}
        <div className="space-y-0">
          {events.map((event, index) => (
            <TimelineEventItem
              key={event.id}
              event={event}
              isLast={index === events.length - 1}
              showLine={true}
            />
          ))}
        </div>

        {/* Footer Note */}
        {['PREPARING', 'IN_TRANSIT', 'DISTRIBUTING'].includes(data.status) && (
          <div className="pt-4 border-t text-xs text-muted-foreground text-center">
            Timeline akan terus diperbarui seiring berjalannya distribusi
          </div>
        )}
      </CardContent>
    </Card>
  )
}
