/**
 * SPPG Detail Header Component
 * Header section with title, status, actions
 * 
 * @component
 * @example
 * <SppgDetailHeader sppg={sppg} onDelete={handleDelete} onEdit={handleEdit} />
 */

'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getSppgStatusConfig, getOrganizationTypeLabel } from '@/features/admin/sppg-management/lib'
import { ArrowLeft, Edit, MoreVertical, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import type { SppgDetail } from '@/features/admin/sppg-management/types'

interface SppgDetailHeaderProps {
  sppg: SppgDetail
  onDelete: () => void
  onEdit: () => void
  onActivate?: () => void
  onSuspend?: () => void
  isDeleting?: boolean
  isActivating?: boolean
  isSuspending?: boolean
}

export function SppgDetailHeader({
  sppg,
  onDelete,
  onEdit,
  onActivate,
  onSuspend,
  isDeleting = false,
  isActivating = false,
  isSuspending = false,
}: SppgDetailHeaderProps) {
  const statusConfig = getSppgStatusConfig(sppg.status)
  
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/sppg">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{sppg.name}</h1>
            <Badge 
              variant={
                statusConfig.variant === 'default' ? 'default' :
                statusConfig.variant === 'secondary' ? 'secondary' :
                statusConfig.variant === 'destructive' ? 'destructive' :
                statusConfig.variant === 'outline' ? 'outline' :
                'default'
              } 
              className={statusConfig.className}
            >
              {statusConfig.label}
            </Badge>
            {sppg.isDemoAccount && (
              <Badge variant="secondary" className="bg-purple-500 hover:bg-purple-600 text-white">
                Demo Account
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="font-mono">{sppg.code}</span>
            <span>•</span>
            <span>{getOrganizationTypeLabel(sppg.organizationType)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button onClick={onEdit} disabled={isDeleting}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" disabled={isDeleting || isActivating || isSuspending}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {sppg.status === 'SUSPENDED' && onActivate && (
              <DropdownMenuItem onClick={onActivate} disabled={isActivating}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {isActivating ? 'Mengaktifkan...' : 'Aktifkan SPPG'}
              </DropdownMenuItem>
            )}
            
            {sppg.status === 'ACTIVE' && onSuspend && (
              <DropdownMenuItem onClick={onSuspend} disabled={isSuspending}>
                <XCircle className="h-4 w-4 mr-2" />
                {isSuspending ? 'Menangguhkan...' : 'Tangguhkan SPPG'}
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={onDelete} 
              disabled={isDeleting}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Menghapus...' : 'Hapus SPPG'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
