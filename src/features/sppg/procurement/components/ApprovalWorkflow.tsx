/**
 * @fileoverview Approval Workflow Component for Procurement Plans
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Send,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Calendar,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApprovalAction } from '../hooks/useProcurementPlans'
import type { ProcurementPlan } from '@prisma/client'

// ============================================================================
// Types
// ============================================================================

interface ApprovalWorkflowProps {
  plan: ProcurementPlan & {
    submittedByUser?: { name: string | null }
    approvedByUser?: { name: string | null }
  }
  className?: string
  onSuccess?: () => void
}

type ApprovalAction = 'submit' | 'approve' | 'reject' | 'revise'

interface StatusInfo {
  status: string
  label: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
}

// ============================================================================
// Helper Functions
// ============================================================================

function getStatusInfo(status: string): StatusInfo {
  const statusMap: Record<string, StatusInfo> = {
    DRAFT: {
      status: 'DRAFT',
      label: 'Draft',
      description: 'Rencana masih dalam tahap penyusunan',
      icon: AlertCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100 dark:bg-gray-900/20',
    },
    SUBMITTED: {
      status: 'SUBMITTED',
      label: 'Menunggu Persetujuan',
      description: 'Rencana telah diajukan dan menunggu persetujuan',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    APPROVED: {
      status: 'APPROVED',
      label: 'Disetujui',
      description: 'Rencana telah disetujui dan dapat dilaksanakan',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    REJECTED: {
      status: 'REJECTED',
      label: 'Ditolak',
      description: 'Rencana ditolak dan perlu diperbaiki',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
    REVISION: {
      status: 'REVISION',
      label: 'Perlu Revisi',
      description: 'Rencana dikembalikan untuk dilakukan revisi',
      icon: RotateCcw,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  }

  return statusMap[status] || statusMap['DRAFT']
}

function formatDate(date: Date | string | null): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

// ============================================================================
// Components
// ============================================================================

/**
 * Main Component: Approval Workflow
 */
export function ApprovalWorkflow({ plan, className, onSuccess }: ApprovalWorkflowProps) {
  const [action, setAction] = useState<ApprovalAction | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showDialog, setShowDialog] = useState(false)

  const { mutate: performAction, isPending } = useApprovalAction()

  const statusInfo = getStatusInfo(plan.approvalStatus)

  // Handle action click
  const handleActionClick = (actionType: ApprovalAction) => {
    setAction(actionType)
    setShowDialog(true)
    if (actionType !== 'reject' && actionType !== 'revise') {
      setRejectionReason('')
    }
  }

  // Handle action confirm
  const handleConfirm = () => {
    if (!action) return

    // Validate rejection reason for reject/revise actions
    if ((action === 'reject' || action === 'revise') && !rejectionReason.trim()) {
      return
    }

    performAction(
      {
        id: plan.id,
        input: {
          action,
          rejectionReason: rejectionReason.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setShowDialog(false)
          setAction(null)
          setRejectionReason('')
          onSuccess?.()
        },
      }
    )
  }

  // Determine available actions based on current status
  const availableActions = {
    canSubmit: plan.approvalStatus === 'DRAFT' || plan.approvalStatus === 'REVISION',
    canApprove: plan.approvalStatus === 'SUBMITTED',
    canReject: plan.approvalStatus === 'SUBMITTED',
    canRevise: plan.approvalStatus === 'SUBMITTED',
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Status Persetujuan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center gap-3">
            <div className={cn('rounded-lg p-3', statusInfo.bgColor)}>
              <statusInfo.icon className={cn('h-6 w-6', statusInfo.color)} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{statusInfo.label}</h3>
                <Badge variant="outline">{plan.approvalStatus}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{statusInfo.description}</p>
            </div>
          </div>

          <Separator />

          {/* Timeline Information */}
          <div className="space-y-3">
            {/* Submitted Info */}
            {plan.submittedAt && (
              <div className="flex items-start gap-3 text-sm">
                <Send className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Diajukan</p>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(plan.submittedAt)}</span>
                  </div>
                  {plan.submittedByUser?.name && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{plan.submittedByUser.name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Approved Info */}
            {plan.approvedAt && (
              <div className="flex items-start gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Disetujui</p>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(plan.approvedAt)}</span>
                  </div>
                  {plan.approvedByUser?.name && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{plan.approvedByUser.name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Rejection Reason */}
            {plan.rejectionReason && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20">
                <p className="text-sm font-medium text-red-900 dark:text-red-400 mb-1">
                  Alasan Penolakan:
                </p>
                <p className="text-sm text-red-800 dark:text-red-300">{plan.rejectionReason}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Tindakan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {/* Submit Button */}
            {availableActions.canSubmit && (
              <Button onClick={() => handleActionClick('submit')} disabled={isPending}>
                <Send className="h-4 w-4 mr-2" />
                Ajukan Persetujuan
              </Button>
            )}

            {/* Approve Button */}
            {availableActions.canApprove && (
              <Button
                onClick={() => handleActionClick('approve')}
                disabled={isPending}
                variant="default"
                className="bg-green-600 hover:bg-green-700"
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Setujui
              </Button>
            )}

            {/* Reject Button */}
            {availableActions.canReject && (
              <Button
                onClick={() => handleActionClick('reject')}
                disabled={isPending}
                variant="destructive"
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                Tolak
              </Button>
            )}

            {/* Revise Button */}
            {availableActions.canRevise && (
              <Button
                onClick={() => handleActionClick('revise')}
                disabled={isPending}
                variant="outline"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Minta Revisi
              </Button>
            )}
          </div>

          {/* No actions available */}
          {!Object.values(availableActions).some((v) => v) && (
            <p className="text-sm text-muted-foreground">
              Tidak ada tindakan yang tersedia untuk status ini.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === 'submit' && 'Ajukan Rencana untuk Persetujuan?'}
              {action === 'approve' && 'Setujui Rencana Pengadaan?'}
              {action === 'reject' && 'Tolak Rencana Pengadaan?'}
              {action === 'revise' && 'Minta Revisi Rencana?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === 'submit' &&
                'Rencana akan dikirim untuk ditinjau dan disetujui. Anda tidak akan dapat mengedit rencana setelah diajukan.'}
              {action === 'approve' &&
                'Rencana akan disetujui dan dapat digunakan untuk membuat pengadaan. Pastikan semua informasi sudah benar.'}
              {action === 'reject' &&
                'Rencana akan ditolak dan perlu dibuat ulang. Silakan berikan alasan penolakan.'}
              {action === 'revise' &&
                'Rencana akan dikembalikan untuk direvisi. Silakan berikan catatan revisi yang diperlukan.'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Rejection/Revision Reason */}
          {(action === 'reject' || action === 'revise') && (
            <div className="space-y-2 my-4">
              <Label htmlFor="reason">
                Alasan {action === 'reject' ? 'Penolakan' : 'Revisi'} *
              </Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={`Jelaskan alasan ${action === 'reject' ? 'penolakan' : 'revisi'}...`}
                rows={4}
                className="resize-none"
              />
              {rejectionReason.trim().length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {rejectionReason.trim().length} karakter
                </p>
              )}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={
                isPending ||
                ((action === 'reject' || action === 'revise') && !rejectionReason.trim())
              }
              className={cn(
                action === 'approve' && 'bg-green-600 hover:bg-green-700',
                action === 'reject' && 'bg-red-600 hover:bg-red-700'
              )}
            >
              {isPending ? 'Memproses...' : 'Ya, Lanjutkan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
