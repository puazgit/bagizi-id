/**
 * SPPG Card Component
 * Displays SPPG information in card format
 * 
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import Link from 'next/link'
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
import { type SppgListItem } from '../types'
import {
  Building2,
  MapPin,
  Users,
  BookOpen,
  Users2,
  MoreVertical,
  Eye,
  Edit,
  Power,
  Ban,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SppgCardProps {
  sppg: SppgListItem
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onActivate?: (id: string) => void
  onSuspend?: (id: string) => void
  onDelete?: (id: string) => void
}

export function SppgCard({
  sppg,
  onView,
  onEdit,
  onActivate,
  onSuspend,
  onDelete,
}: SppgCardProps) {
  const statusConfig = {
    ACTIVE: {
      label: 'Aktif',
      variant: 'default' as const,
      className: 'bg-green-500 hover:bg-green-600',
    },
    INACTIVE: {
      label: 'Tidak Aktif',
      variant: 'secondary' as const,
      className: 'bg-gray-500 hover:bg-gray-600',
    },
    SUSPENDED: {
      label: 'Suspended',
      variant: 'destructive' as const,
      className: 'bg-red-500 hover:bg-red-600',
    },
    PENDING_APPROVAL: {
      label: 'Menunggu Persetujuan',
      variant: 'outline' as const,
      className: 'bg-yellow-500 hover:bg-yellow-600',
    },
    REJECTED: {
      label: 'Ditolak',
      variant: 'destructive' as const,
      className: 'bg-orange-500 hover:bg-orange-600',
    },
    TERMINATED: {
      label: 'Dihentikan',
      variant: 'destructive' as const,
      className: 'bg-black hover:bg-gray-900',
    },
  }

  const status = statusConfig[sppg.status] || statusConfig.INACTIVE

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold line-clamp-1">{sppg.name}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {sppg.code}
              </Badge>
              {sppg.isDemoAccount && (
                <Badge variant="secondary" className="text-xs">
                  Demo
                </Badge>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Menu aksi</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {onView && (
                <DropdownMenuItem onClick={() => onView(sppg.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(sppg.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {sppg.status !== 'ACTIVE' && onActivate && (
                <DropdownMenuItem onClick={() => onActivate(sppg.id)}>
                  <Power className="mr-2 h-4 w-4" />
                  Aktifkan
                </DropdownMenuItem>
              )}
              {sppg.status === 'ACTIVE' && onSuspend && (
                <DropdownMenuItem onClick={() => onSuspend(sppg.id)}>
                  <Ban className="mr-2 h-4 w-4" />
                  Suspend
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(sppg.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <Badge 
            variant={status.variant}
            className={cn('text-xs', status.className)}
          >
            {status.label}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {sppg.organizationType}
          </Badge>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div className="space-y-0.5">
            <p className="line-clamp-1">{sppg.province.name}</p>
            <p className="text-xs line-clamp-1">
              {sppg.regency.name}, {sppg.district.name}
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div className="flex flex-col items-center text-center">
            <Users className="h-4 w-4 text-muted-foreground mb-1" />
            <span className="text-lg font-semibold">{sppg._count.users}</span>
            <span className="text-xs text-muted-foreground">Users</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <BookOpen className="h-4 w-4 text-muted-foreground mb-1" />
            <span className="text-lg font-semibold">{sppg._count.nutritionPrograms}</span>
            <span className="text-xs text-muted-foreground">Program</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <Users2 className="h-4 w-4 text-muted-foreground mb-1" />
            <span className="text-lg font-semibold">{sppg._count.schoolBeneficiaries}</span>
            <span className="text-xs text-muted-foreground">Penerima</span>
          </div>
        </div>

        {/* Target Recipients */}
        <div className="text-sm">
          <span className="text-muted-foreground">Target: </span>
          <span className="font-medium">{sppg.targetRecipients.toLocaleString('id-ID')} penerima</span>
        </div>

        {/* Demo Info */}
        {sppg.isDemoAccount && sppg.demoExpiresAt && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            Demo berakhir: {new Date(sppg.demoExpiresAt).toLocaleDateString('id-ID')}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button asChild className="w-full" size="sm">
          <Link href={`/admin/sppg/${sppg.id}`}>
            Lihat Detail
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
