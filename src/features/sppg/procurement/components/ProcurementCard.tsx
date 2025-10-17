/**
 * @fileoverview Procurement Card Component - Modular & Robust
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 */

'use client'

import { type FC } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { 
  ShoppingCart, 
  Calendar, 
  Package, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  MoreVertical
} from 'lucide-react'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Procurement } from '../types'

// ================================ TYPES ================================

interface ProcurementCardProps {
  procurement: Procurement
  variant?: 'default' | 'compact' | 'detailed'
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onReceive?: (id: string) => void
  className?: string
}

// ================================ STATUS UTILITIES ================================

const getStatusConfig = (status: string) => {
  const configs = {
    DRAFT: {
      label: 'Draft',
      icon: AlertCircle,
      variant: 'secondary' as const,
      color: 'text-muted-foreground',
    },
    PENDING: {
      label: 'Menunggu',
      icon: Clock,
      variant: 'default' as const,
      color: 'text-blue-600 dark:text-blue-400',
    },
    APPROVED: {
      label: 'Disetujui',
      icon: CheckCircle,
      variant: 'default' as const,
      color: 'text-green-600 dark:text-green-400',
    },
    ORDERED: {
      label: 'Dipesan',
      icon: ShoppingCart,
      variant: 'default' as const,
      color: 'text-purple-600 dark:text-purple-400',
    },
    RECEIVED: {
      label: 'Diterima',
      icon: Package,
      variant: 'default' as const,
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    COMPLETED: {
      label: 'Selesai',
      icon: CheckCircle,
      variant: 'default' as const,
      color: 'text-green-600 dark:text-green-400',
    },
    CANCELLED: {
      label: 'Dibatalkan',
      icon: XCircle,
      variant: 'destructive' as const,
      color: 'text-destructive',
    },
  }

  return configs[status as keyof typeof configs] || configs.DRAFT
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

// ================================ COMPONENT ================================

export const ProcurementCard: FC<ProcurementCardProps> = ({
  procurement,
  variant = 'default',
  onView,
  onEdit,
  onDelete,
  onReceive,
  className,
}) => {
  const statusConfig = getStatusConfig(procurement.status)
  const StatusIcon = statusConfig.icon

  const canReceive = procurement.status === 'ORDERED'
  const canEdit = procurement.status === 'PENDING_APPROVAL' || procurement.status === 'APPROVED'
  const canDelete = procurement.status === 'PENDING_APPROVAL'

  return (
    <Card className={cn(
      'group hover:shadow-lg transition-all duration-200',
      'dark:hover:shadow-xl dark:hover:shadow-primary/5',
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-foreground line-clamp-1">
                {procurement.procurementCode}
              </h3>
              <Badge variant={statusConfig.variant} className="shrink-0">
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
            
            {procurement.supplierName && (
              <p className="text-sm text-muted-foreground">
                {procurement.supplierName}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Menu aksi</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {onView && (
                <DropdownMenuItem onClick={() => onView(procurement.id)}>
                  Lihat Detail
                </DropdownMenuItem>
              )}
              
              {canEdit && onEdit && (
                <DropdownMenuItem onClick={() => onEdit(procurement.id)}>
                  Edit
                </DropdownMenuItem>
              )}
              
              {canReceive && onReceive && (
                <DropdownMenuItem onClick={() => onReceive(procurement.id)}>
                  Terima Barang
                </DropdownMenuItem>
              )}
              
              {canDelete && onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(procurement.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    Hapus
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Compact variant - minimal info */}
        {variant === 'compact' && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold text-foreground">
              {formatCurrency(procurement.totalAmount)}
            </span>
          </div>
        )}

        {/* Default variant - standard info */}
        {variant === 'default' && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Tanggal</span>
              </div>
              <p className="font-medium text-foreground">
                {new Date(procurement.procurementDate).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5" />
                <span>Total</span>
              </div>
              <p className="font-medium text-foreground">
                {formatCurrency(procurement.totalAmount)}
              </p>
            </div>

            {procurement.expectedDelivery && (
              <div className="col-span-2 space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Package className="h-3.5 w-3.5" />
                  <span>Estimasi Pengiriman</span>
                </div>
                <p className="font-medium text-foreground">
                  {formatDistanceToNow(new Date(procurement.expectedDelivery), {
                    addSuffix: true,
                    locale: localeId
                  })}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Detailed variant - full info */}
        {variant === 'detailed' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Tanggal Order</span>
                </div>
                <p className="font-medium text-foreground">
                  {new Date(procurement.procurementDate).toLocaleDateString('id-ID')}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Package className="h-3.5 w-3.5" />
                  <span>Status Pembayaran</span>
                </div>
                <p className="font-medium text-foreground">
                  {procurement.paymentStatus}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>Subtotal</span>
                </div>
                <p className="font-medium text-foreground">
                  {formatCurrency(procurement.subtotalAmount)}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>Total</span>
                </div>
                <p className="font-semibold text-lg text-foreground">
                  {formatCurrency(procurement.totalAmount)}
                </p>
              </div>
            </div>

            {procurement.qualityNotes && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  {procurement.qualityNotes}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <span>
            Dibuat {formatDistanceToNow(new Date(procurement.createdAt), {
              addSuffix: true,
              locale: localeId
            })}
          </span>
          {procurement.planId && (
            <Badge variant="outline" className="text-xs">
              ID Plan: {procurement.planId.substring(0, 8)}
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
