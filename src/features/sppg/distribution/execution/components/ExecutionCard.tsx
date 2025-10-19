'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Eye,
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Package,
  Users,
  MoreVertical,
  RefreshCw,
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import {
  type ExecutionListItem,
  EXECUTION_STATUS_LABELS,
  EXECUTION_STATUS_COLORS,
} from '../types'

interface ExecutionCardProps {
  execution: ExecutionListItem
  onStartClick?: (id: string) => void
  onUpdateClick?: (id: string) => void
  onCompleteClick?: (id: string) => void
  onCancelClick?: (id: string) => void
  onReportIssueClick?: (id: string) => void
}

export function ExecutionCard({
  execution,
  onStartClick,
  onUpdateClick,
  onCompleteClick,
  onCancelClick,
  onReportIssueClick,
}: ExecutionCardProps) {
  // Calculate progress
  const delivered = execution.totalPortionsDelivered || 0
  const planned = execution.plannedPortions
  const progressPercentage = planned > 0 ? Math.round((delivered / planned) * 100) : 0

  // Status styling
  const statusVariant = EXECUTION_STATUS_COLORS[execution.status]
  const statusLabel = EXECUTION_STATUS_LABELS[execution.status]

  // Check if execution is active
  const isActive = ['PREPARING', 'IN_TRANSIT', 'DISTRIBUTING'].includes(execution.status)
  const isCompleted = execution.status === 'COMPLETED'
  const isCancelled = execution.status === 'CANCELLED'

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">
              <Link
                href={`/distribution/execution/${execution.id}`}
                className="hover:underline"
              >
                {execution.distributionCode}
              </Link>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              <Link
                href={`/distribution/schedule/${execution.scheduleId}`}
                className="hover:underline"
              >
                {execution.scheduleName}
              </Link>
            </p>
          </div>

          {/* Status Badge */}
          <Badge variant={statusVariant}>
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Time Information */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {execution.actualStartTime ? (
            <span>
              Dimulai: {format(new Date(execution.actualStartTime), 'dd MMM yyyy HH:mm', { locale: id })}
            </span>
          ) : (
            <span>Belum dimulai</span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress Porsi</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Portions Delivered */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4" />
              <span className="text-xs">Porsi</span>
            </div>
            <p className="text-sm font-semibold">
              {delivered.toLocaleString('id-ID')} / {planned.toLocaleString('id-ID')}
            </p>
          </div>

          {/* Beneficiaries Reached */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs">Penerima</span>
            </div>
            <p className="text-sm font-semibold">
              {(execution.totalBeneficiariesReached || 0).toLocaleString('id-ID')} /{' '}
              {execution.plannedBeneficiaries.toLocaleString('id-ID')}
            </p>
          </div>

          {/* Delivery Progress */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs">Pengiriman</span>
            </div>
            <p className="text-sm font-semibold">
              {execution.completedDeliveryCount} / {execution.deliveryCount}
            </p>
          </div>

          {/* Issues Count */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs">Masalah</span>
            </div>
            {execution.issuesCount > 0 ? (
              <p className="text-sm font-semibold text-red-600">
                {execution.issuesCount} masalah
              </p>
            ) : (
              <p className="text-sm font-semibold text-green-600">
                Tidak ada
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/distribution/execution/${execution.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              Detail
            </Link>
          </Button>

          {/* Quick Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi Cepat</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {execution.status === 'SCHEDULED' && (
                <DropdownMenuItem onClick={() => onStartClick?.(execution.id)}>
                  <Play className="mr-2 h-4 w-4" />
                  Mulai Eksekusi
                </DropdownMenuItem>
              )}

              {isActive && (
                <>
                  <DropdownMenuItem onClick={() => onUpdateClick?.(execution.id)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Update Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onCompleteClick?.(execution.id)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Selesaikan
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onReportIssueClick?.(execution.id)}>
                    <AlertTriangle className="mr-2 h-4 w-4 text-yellow-600" />
                    Laporkan Masalah
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onCancelClick?.(execution.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Batalkan
                  </DropdownMenuItem>
                </>
              )}

              {(isCompleted || isCancelled) && (
                <DropdownMenuItem disabled>
                  <span className="text-muted-foreground">Tidak ada aksi</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
