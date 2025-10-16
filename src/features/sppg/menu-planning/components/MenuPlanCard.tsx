/**
 * @fileoverview Menu Plan Card Component
 * @version Next.js 15.5.4 / shadcn/ui / Dark Mode Support
 * @see {@link /docs/copilot-instructions.md} Component patterns
 */

'use client'

import { type FC } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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
import { 
  Calendar, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Send,
  FileCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MenuPlanStatus } from '@prisma/client'
import { formatDate, formatCurrency } from '@/features/sppg/menu-planning/lib'

interface MenuPlanCardProps {
  plan: {
    id: string
    name: string
    description?: string | null
    status: MenuPlanStatus
    startDate: Date | string
    endDate: Date | string
    totalDays: number
    totalMenus: number
    averageCostPerDay: number
    totalEstimatedCost: number
    isDraft: boolean
    isActive: boolean
    program: {
      name: string
      programCode: string
    }
    creator: {
      name: string | null
    }
    _count?: {
      assignments: number
    }
  }
  onEdit?: (id: string) => void
  onDelete?: (id: string, name: string) => void
  onSubmit?: (id: string) => void
  onPublish?: (id: string) => void
  variant?: 'default' | 'compact'
}

export const MenuPlanCard: FC<MenuPlanCardProps> = ({ 
  plan, 
  onEdit,
  onDelete,
  onSubmit,
  onPublish,
  variant = 'default' 
}) => {
  const statusConfig = getStatusConfig(plan.status)

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-lg',
      'dark:hover:shadow-xl dark:hover:shadow-primary/5',
      variant === 'compact' && 'p-2'
    )}>
      <CardHeader className={cn(variant === 'compact' && 'p-4')}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant={statusConfig.variant}
                className={cn(statusConfig.className)}
              >
                {statusConfig.icon}
                {statusConfig.label}
              </Badge>
              {plan.isActive && (
                <Badge variant="default" className="bg-green-600 dark:bg-green-600">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Aktif
                </Badge>
              )}
              {plan.isDraft && (
                <Badge variant="outline">
                  <Edit className="mr-1 h-3 w-3" />
                  Draf
                </Badge>
              )}
            </div>
            
            <CardTitle className={cn(
              'text-foreground',
              variant === 'compact' ? 'text-lg' : 'text-xl'
            )}>
              {plan.name}
            </CardTitle>
            
            <CardDescription className="mt-1">
              {plan.program.name} • {plan.program.programCode}
            </CardDescription>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/menu-planning/${plan.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail
                </Link>
              </DropdownMenuItem>
              
              {plan.isDraft && onEdit && (
                <DropdownMenuItem onClick={() => onEdit(plan.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Rencana
                </DropdownMenuItem>
              )}

              {plan.status === 'DRAFT' && onSubmit && (
                <DropdownMenuItem onClick={() => onSubmit(plan.id)}>
                  <Send className="mr-2 h-4 w-4" />
                  Kirim untuk Review
                </DropdownMenuItem>
              )}

              {plan.status === 'APPROVED' && onPublish && (
                <DropdownMenuItem onClick={() => onPublish(plan.id)}>
                  <FileCheck className="mr-2 h-4 w-4" />
                  Publikasikan Rencana
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(plan.id, plan.name)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Rencana
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {plan.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {plan.description}
          </p>
        )}
      </CardHeader>

      <CardContent className={cn(variant === 'compact' && 'p-4 pt-0')}>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* Date Range */}
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Rentang Tanggal</p>
              <p className="text-muted-foreground">
                {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {plan.totalDays} hari
              </p>
            </div>
          </div>

          {/* Assignments */}
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Penugasan</p>
              <p className="text-muted-foreground">
                {plan._count?.assignments || 0} menu direncanakan
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {plan.totalMenus} menu unik
              </p>
            </div>
          </div>

          {/* Cost Information */}
          <div className="flex items-start gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Estimasi Biaya</p>
              <p className="text-muted-foreground">
                {formatCurrency(plan.totalEstimatedCost)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatCurrency(plan.averageCostPerDay)}/hari
              </p>
            </div>
          </div>

          {/* Creator */}
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Dibuat Oleh</p>
              <p className="text-muted-foreground">
                {plan.creator.name || 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className={cn(
        'flex justify-between gap-2',
        variant === 'compact' && 'p-4 pt-0'
      )}>
        <Button asChild variant="outline" size="sm">
          <Link href={`/menu-planning/${plan.id}`}>
            Lihat Detail
          </Link>
        </Button>
        
        {plan.status === 'DRAFT' && onEdit && (
          <Button onClick={() => onEdit(plan.id)} size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit Rencana
          </Button>
        )}

        {plan.status === 'APPROVED' && onPublish && (
          <Button onClick={() => onPublish(plan.id)} size="sm">
            <FileCheck className="mr-2 h-4 w-4" />
            Publikasikan
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

/**
 * Get status configuration for badges
 */
function getStatusConfig(status: MenuPlanStatus) {
  const configs = {
    DRAFT: {
      label: 'Draf',
      variant: 'outline' as const,
      className: 'border-gray-300 dark:border-gray-600',
      icon: <Edit className="mr-1 h-3 w-3" />
    },
    PENDING_REVIEW: {
      label: 'Menunggu Review',
      variant: 'secondary' as const,
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      icon: <Clock className="mr-1 h-3 w-3" />
    },
    REVIEWED: {
      label: 'Telah Direview',
      variant: 'secondary' as const,
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      icon: <CheckCircle2 className="mr-1 h-3 w-3" />
    },
    PENDING_APPROVAL: {
      label: 'Menunggu Persetujuan',
      variant: 'secondary' as const,
      className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      icon: <Clock className="mr-1 h-3 w-3" />
    },
    APPROVED: {
      label: 'Disetujui',
      variant: 'default' as const,
      className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      icon: <CheckCircle2 className="mr-1 h-3 w-3" />
    },
    PUBLISHED: {
      label: 'Dipublikasikan',
      variant: 'default' as const,
      className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      icon: <FileCheck className="mr-1 h-3 w-3" />
    },
    ACTIVE: {
      label: 'Aktif',
      variant: 'default' as const,
      className: 'bg-green-500 dark:bg-green-600',
      icon: <CheckCircle2 className="mr-1 h-3 w-3" />
    },
    COMPLETED: {
      label: 'Selesai',
      variant: 'secondary' as const,
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      icon: <CheckCircle2 className="mr-1 h-3 w-3" />
    },
    ARCHIVED: {
      label: 'Diarsipkan',
      variant: 'outline' as const,
      className: 'border-gray-300 dark:border-gray-600 opacity-60',
      icon: null
    },
    CANCELLED: {
      label: 'Dibatalkan',
      variant: 'destructive' as const,
      className: '',
      icon: null
    }
  }

  return configs[status] || configs.DRAFT
}
