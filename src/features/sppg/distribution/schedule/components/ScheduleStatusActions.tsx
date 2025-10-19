/**
 * @fileoverview ScheduleStatusActions Component - Status transition buttons dengan business logic validation
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @description Component untuk menampilkan action buttons untuk mengubah status schedule
 *              dengan validasi business logic (e.g., can't start without vehicles)
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useUpdateScheduleStatus } from '../hooks'
import { type ScheduleDetail } from '../types'
import { DistributionScheduleStatus } from '@prisma/client'
import { toast } from 'sonner'
import { 
  Play, 
  Truck, 
  CheckCircle, 
  XCircle,
  AlertTriangle
} from 'lucide-react'

interface ScheduleStatusActionsProps {
  schedule: ScheduleDetail
  onSuccess?: () => void
}

type StatusAction = {
  status: DistributionScheduleStatus
  label: string
  icon: React.ReactNode
  variant: 'default' | 'destructive' | 'outline' | 'secondary'
  requiresConfirmation: boolean
  requiresReason?: boolean
  validationMessage?: string
}

export function ScheduleStatusActions({ 
  schedule, 
  onSuccess 
}: ScheduleStatusActionsProps) {
  const [alertOpen, setAlertOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<StatusAction | null>(null)
  const [notes, setNotes] = useState('')
  const [cancellationReason, setCancellationReason] = useState('')

  const { mutate: updateStatus, isPending } = useUpdateScheduleStatus()

  // Define available actions based on current status
  const getAvailableActions = (): StatusAction[] => {
    switch (schedule.status) {
      case 'PLANNED':
        return [
          {
            status: 'PREPARED',
            label: 'Mulai Persiapan',
            icon: <Play className="mr-2 h-4 w-4" />,
            variant: 'default',
            requiresConfirmation: false,
          },
          {
            status: 'CANCELLED',
            label: 'Batalkan Jadwal',
            icon: <XCircle className="mr-2 h-4 w-4" />,
            variant: 'destructive',
            requiresConfirmation: true,
            requiresReason: true,
          },
        ]
      
      case 'PREPARED':
        return [
          {
            status: 'IN_PROGRESS',
            label: 'Mulai Distribusi',
            icon: <Truck className="mr-2 h-4 w-4" />,
            variant: 'default',
            requiresConfirmation: true,
            validationMessage: schedule.vehicleAssignments?.length === 0 
              ? 'Tidak dapat memulai distribusi tanpa kendaraan yang ditugaskan'
              : undefined,
          },
          {
            status: 'CANCELLED',
            label: 'Batalkan Jadwal',
            icon: <XCircle className="mr-2 h-4 w-4" />,
            variant: 'destructive',
            requiresConfirmation: true,
            requiresReason: true,
          },
        ]
      
      case 'IN_PROGRESS':
        return [
          {
            status: 'COMPLETED',
            label: 'Selesaikan Distribusi',
            icon: <CheckCircle className="mr-2 h-4 w-4" />,
            variant: 'default',
            requiresConfirmation: true,
          },
        ]
      
      case 'COMPLETED':
      case 'CANCELLED':
      case 'DELAYED':
        return []
      
      default:
        return []
    }
  }

  const availableActions = getAvailableActions()

  // Handle action button click
  const handleActionClick = (action: StatusAction) => {
    // Check validation
    if (action.validationMessage) {
      toast.error(action.validationMessage)
      return
    }

    setSelectedAction(action)
    
    if (action.requiresConfirmation) {
      setAlertOpen(true)
    } else {
      handleStatusUpdate(action.status)
    }
  }

  // Handle status update
  const handleStatusUpdate = (newStatus: StatusAction['status'], reason?: string) => {
    updateStatus(
      {
        id: schedule.id,
        data: {
          status: newStatus,
          ...(reason && { cancellationReason: reason }),
          ...(notes && { notes }),
        },
      },
      {
        onSuccess: () => {
          toast.success(`Status berhasil diubah menjadi ${getStatusLabel(newStatus)}`)
          setAlertOpen(false)
          setNotes('')
          setCancellationReason('')
          setSelectedAction(null)
          onSuccess?.()
        },
        onError: (error) => {
          toast.error(error.message || 'Gagal mengubah status')
        },
      }
    )
  }

  // Handle confirmation
  const handleConfirm = () => {
    if (!selectedAction) return

    if (selectedAction.requiresReason && !cancellationReason.trim()) {
      toast.error('Alasan pembatalan wajib diisi')
      return
    }

    handleStatusUpdate(
      selectedAction.status, 
      selectedAction.requiresReason ? cancellationReason : undefined
    )
  }

  // Get status label
  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      SCHEDULED: 'Terjadwal',
      PROCESSING: 'Persiapan',
      IN_TRANSIT: 'Dalam Perjalanan',
      COMPLETED: 'Selesai',
      CANCELLED: 'Dibatalkan',
    }
    return labels[status] || status
  }

  // If no actions available
  if (availableActions.length === 0) {
    return null
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {availableActions.map((action) => (
          <Button
            key={action.status}
            variant={action.variant}
            onClick={() => handleActionClick(action)}
            disabled={isPending || !!action.validationMessage}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>

      {/* Confirmation Alert Dialog */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
              Konfirmasi Perubahan Status
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAction?.requiresReason ? (
                <div className="space-y-4 pt-4">
                  <p>
                    Anda yakin ingin mengubah status menjadi{' '}
                    <strong>{selectedAction ? getStatusLabel(selectedAction.status) : ''}</strong>?
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="cancellation-reason">
                      Alasan Pembatalan <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="cancellation-reason"
                      placeholder="Masukkan alasan pembatalan..."
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-4">
                  <p>
                    Anda yakin ingin mengubah status menjadi{' '}
                    <strong>{selectedAction ? getStatusLabel(selectedAction.status) : ''}</strong>?
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan (opsional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Tambahkan catatan jika diperlukan..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isPending}
              className={
                selectedAction?.variant === 'destructive'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              }
            >
              {isPending ? 'Memproses...' : 'Ya, Lanjutkan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
