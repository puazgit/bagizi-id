/**
 * @fileoverview Menu Planning Approval Workflow Component
 * @version Next.js 15.5.4 / shadcn/ui / Prisma 6.17.1
 * @description Visualizes status transitions and approval history with action buttons
 */

'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { 
  FileText, 
  Send, 
  CheckCircle, 
  Globe, 
  Play, 
  XCircle, 
  User,
  Clock,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import type { MenuPlanWithRelations } from '@/features/sppg/menu-planning/types'
import { MenuPlanStatus } from '@prisma/client'

/**
 * Component Props
 */
interface ApprovalWorkflowProps {
  plan: MenuPlanWithRelations
  onSubmit?: () => void
  onApprove?: (note?: string) => void
  onReject?: (note: string) => void
  onPublish?: () => void
  onActivate?: () => void
  isSubmitting?: boolean
  userRole?: string
}

/**
 * Status flow configuration
 */
const statusFlow = [
  {
    status: MenuPlanStatus.DRAFT,
    label: 'Draf',
    icon: FileText,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    description: 'Rencana menu dalam tahap penyusunan'
  },
  {
    status: MenuPlanStatus.PENDING_REVIEW,
    label: 'Menunggu Review',
    icon: Send,
    color: 'text-yellow-600 dark:text-yellow-500',
    bgColor: 'bg-yellow-100 dark:bg-yellow-950',
    description: 'Menunggu review dan persetujuan'
  },
  {
    status: MenuPlanStatus.APPROVED,
    label: 'Disetujui',
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-500',
    bgColor: 'bg-green-100 dark:bg-green-950',
    description: 'Rencana menu telah disetujui'
  },
  {
    status: MenuPlanStatus.PUBLISHED,
    label: 'Dipublikasikan',
    icon: Globe,
    color: 'text-blue-600 dark:text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
    description: 'Rencana menu telah dipublikasikan'
  },
  {
    status: MenuPlanStatus.ACTIVE,
    label: 'Aktif',
    icon: Play,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    description: 'Rencana menu sedang berjalan'
  }
]

/**
 * Approval Workflow Component
 */
export function ApprovalWorkflow({
  plan,
  onSubmit,
  onApprove,
  onReject,
  onPublish,
  onActivate,
  isSubmitting = false,
  userRole = 'SPPG_USER'
}: ApprovalWorkflowProps) {
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [showApproveForm, setShowApproveForm] = useState(false)
  const [rejectNote, setRejectNote] = useState('')
  const [approveNote, setApproveNote] = useState('')

  /**
   * Get current status index
   */
  const currentStatusIndex = statusFlow.findIndex(s => s.status === plan.status)

  /**
   * Check if user can perform actions
   */
  const canSubmit = plan.status === MenuPlanStatus.DRAFT && 
    ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AHLI_GIZI'].includes(userRole)
  
  const canApprove = plan.status === MenuPlanStatus.PENDING_REVIEW && 
    ['SPPG_KEPALA', 'SPPG_ADMIN'].includes(userRole)
  
  const canPublish = plan.status === MenuPlanStatus.APPROVED && 
    ['SPPG_KEPALA', 'SPPG_ADMIN'].includes(userRole)
  
  const canActivate = plan.status === MenuPlanStatus.PUBLISHED && 
    ['SPPG_KEPALA', 'SPPG_ADMIN'].includes(userRole)

  /**
   * Handle reject with note
   */
  const handleReject = () => {
    if (rejectNote.trim() && onReject) {
      onReject(rejectNote)
      setRejectNote('')
      setShowRejectForm(false)
    }
  }

  /**
   * Handle approve with optional note
   */
  const handleApprove = () => {
    if (onApprove) {
      onApprove(approveNote.trim() || undefined)
      setApproveNote('')
      setShowApproveForm(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Status Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-border" />
            <div 
              className="absolute top-6 left-0 h-0.5 bg-primary transition-all duration-500"
              style={{ width: `${(currentStatusIndex / (statusFlow.length - 1)) * 100}%` }}
            />

            {/* Status Steps */}
            <div className="relative flex justify-between">
              {statusFlow.map((step, index) => {
                const Icon = step.icon
                const isActive = index === currentStatusIndex
                const isPassed = index < currentStatusIndex
                const isCurrent = index === currentStatusIndex

                return (
                  <div key={step.status} className="flex flex-col items-center gap-2">
                    {/* Status Icon */}
                    <div
                      className={cn(
                        'relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300',
                        isCurrent && 'border-primary bg-primary text-primary-foreground shadow-lg scale-110',
                        isPassed && 'border-primary bg-primary text-primary-foreground',
                        !isCurrent && !isPassed && 'border-border bg-background text-muted-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Status Label */}
                    <div className="text-center">
                      <p className={cn(
                        'text-sm font-medium transition-colors',
                        isActive && 'text-foreground',
                        !isActive && 'text-muted-foreground'
                      )}>
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground max-w-[100px]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Status Info */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Status saat ini: <strong>{statusFlow[currentStatusIndex]?.label}</strong> - {statusFlow[currentStatusIndex]?.description}
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      {(canSubmit || canApprove || canPublish || canActivate) && (
        <Card>
          <CardHeader>
            <CardTitle>Aksi yang Tersedia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Submit for Review */}
            {canSubmit && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Kirim rencana menu untuk review dan persetujuan
                </p>
                <Button 
                  onClick={onSubmit}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Kirim untuk Review
                </Button>
              </div>
            )}

            {/* Approve / Reject */}
            {canApprove && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Review rencana menu dan berikan persetujuan atau penolakan
                </p>
                
                {!showApproveForm && !showRejectForm && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setShowApproveForm(true)}
                      disabled={isSubmitting}
                      className="flex-1"
                      variant="default"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Setujui
                    </Button>
                    <Button 
                      onClick={() => setShowRejectForm(true)}
                      disabled={isSubmitting}
                      className="flex-1"
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Tolak
                    </Button>
                  </div>
                )}

                {/* Approve Form */}
                {showApproveForm && (
                  <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                    <Label htmlFor="approve-note">Catatan Persetujuan (Opsional)</Label>
                    <Textarea
                      id="approve-note"
                      placeholder="Tambahkan catatan persetujuan..."
                      value={approveNote}
                      onChange={(e) => setApproveNote(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleApprove}
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        Konfirmasi Persetujuan
                      </Button>
                      <Button 
                        onClick={() => {
                          setShowApproveForm(false)
                          setApproveNote('')
                        }}
                        disabled={isSubmitting}
                        variant="outline"
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                )}

                {/* Reject Form */}
                {showRejectForm && (
                  <div className="space-y-3 p-4 border rounded-lg bg-destructive/5">
                    <Label htmlFor="reject-note">Alasan Penolakan *</Label>
                    <Textarea
                      id="reject-note"
                      placeholder="Jelaskan alasan penolakan..."
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      rows={3}
                      required
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleReject}
                        disabled={isSubmitting || !rejectNote.trim()}
                        className="flex-1"
                        variant="destructive"
                      >
                        Konfirmasi Penolakan
                      </Button>
                      <Button 
                        onClick={() => {
                          setShowRejectForm(false)
                          setRejectNote('')
                        }}
                        disabled={isSubmitting}
                        variant="outline"
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Publish */}
            {canPublish && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Publikasikan rencana menu agar dapat diakses oleh pihak terkait
                </p>
                <Button 
                  onClick={onPublish}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Publikasikan Rencana
                </Button>
              </div>
            )}

            {/* Activate */}
            {canActivate && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Aktifkan rencana menu untuk memulai implementasi
                </p>
                <Button 
                  onClick={onActivate}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Aktifkan Rencana
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Plan Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informasi Rencana
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Creator */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {plan.creator?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Dibuat oleh</p>
              <p className="text-sm text-muted-foreground">
                {plan.creator?.name || 'Unknown'} • {format(new Date(plan.createdAt), 'PPP', { locale: id })}
              </p>
            </div>
          </div>

          <Separator />

          {/* Last Updated */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Terakhir diperbarui</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(plan.updatedAt), 'PPP', { locale: id })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
