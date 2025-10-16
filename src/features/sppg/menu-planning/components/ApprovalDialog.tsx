/**
 * @fileoverview Approval Dialog Component for Menu Plan Workflow
 * @version Next.js 15.5.4 / shadcn/ui Dialog / React Hook Form + Zod
 * @see {@link /docs/copilot-instructions.md} Form patterns with shadcn/ui
 */

'use client'

import { type FC } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Send, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import {
  submitForReviewSchema,
  approveActionSchema,
  rejectActionSchema,
  publishActionSchema,
  type SubmitForReviewInput,
  type ApproveActionInput,
  type RejectActionInput,
  type PublishActionInput,
} from '../schemas'
import type { MenuPlanDetail } from '../types'

type WorkflowMode = 'submit' | 'approve' | 'reject' | 'publish'

interface ApprovalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: WorkflowMode
  plan: MenuPlanDetail
  onSubmit: (data: SubmitForReviewInput) => void
  onApprove: (data: ApproveActionInput) => void
  onReject: (data: RejectActionInput) => void
  onPublish: (data: PublishActionInput) => void
  isPending?: boolean
}

const WORKFLOW_CONFIG = {
  submit: {
    title: 'Submit untuk Review',
    description: 'Ajukan rencana menu ini untuk direview oleh atasan',
    icon: Send,
    iconColor: 'text-blue-500',
    confirmText: 'Submit untuk Review',
    confirmVariant: 'default' as const,
    fieldLabel: 'Catatan Submit (Opsional)',
    fieldPlaceholder: 'Tambahkan catatan jika diperlukan...',
    fieldDescription: 'Maksimal 500 karakter',
    schema: submitForReviewSchema,
  },
  approve: {
    title: 'Setujui Rencana Menu',
    description: 'Menyetujui rencana menu ini akan mengubah status menjadi Approved',
    icon: CheckCircle,
    iconColor: 'text-green-500',
    confirmText: 'Setujui Rencana Menu',
    confirmVariant: 'default' as const,
    fieldLabel: 'Catatan Persetujuan (Opsional)',
    fieldPlaceholder: 'Tambahkan catatan persetujuan jika diperlukan...',
    fieldDescription: 'Maksimal 500 karakter',
    schema: approveActionSchema,
  },
  reject: {
    title: 'Tolak Rencana Menu',
    description: 'Menolak rencana menu ini akan mengembalikan status ke Draft untuk direvisi',
    icon: XCircle,
    iconColor: 'text-red-500',
    confirmText: 'Tolak Rencana Menu',
    confirmVariant: 'destructive' as const,
    fieldLabel: 'Alasan Penolakan (Wajib)',
    fieldPlaceholder: 'Jelaskan alasan penolakan dengan detail...',
    fieldDescription: 'Minimal 10 karakter, maksimal 500 karakter',
    schema: rejectActionSchema,
  },
  publish: {
    title: 'Publikasi Rencana Menu',
    description: 'Mempublikasi rencana menu ini akan mengaktifkan dan siap untuk produksi',
    icon: CheckCircle,
    iconColor: 'text-primary',
    confirmText: 'Publikasi Rencana Menu',
    confirmVariant: 'default' as const,
    fieldLabel: 'Catatan Publikasi (Opsional)',
    fieldPlaceholder: 'Tambahkan catatan publikasi jika diperlukan...',
    fieldDescription: 'Maksimal 500 karakter',
    schema: publishActionSchema,
  },
}

export const ApprovalDialog: FC<ApprovalDialogProps> = ({
  open,
  onOpenChange,
  mode,
  plan,
  onSubmit,
  onApprove,
  onReject,
  onPublish,
  isPending = false,
}) => {
  const config = WORKFLOW_CONFIG[mode]
  const Icon = config.icon

  // Dynamic form based on mode
  const form = useForm({
    resolver: zodResolver(config.schema),
    defaultValues:
      mode === 'submit'
        ? { submitNotes: '' }
        : mode === 'approve'
        ? { approvalNotes: '' }
        : mode === 'reject'
        ? { rejectionReason: '' }
        : { publishNotes: '' },
  })

  const handleSubmit = (data: SubmitForReviewInput | ApproveActionInput | RejectActionInput | PublishActionInput) => {
    switch (mode) {
      case 'submit':
        onSubmit(data as SubmitForReviewInput)
        break
      case 'approve':
        onApprove(data as ApproveActionInput)
        break
      case 'reject':
        onReject(data as RejectActionInput)
        break
      case 'publish':
        onPublish(data as PublishActionInput)
        break
    }
    form.reset()
    onOpenChange(false)
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Icon className={`h-6 w-6 ${config.iconColor}`} />
            <DialogTitle>{config.title}</DialogTitle>
          </div>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        {/* Plan Summary */}
        <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold">{plan.name}</h4>
              <p className="text-sm text-muted-foreground">
                {plan.program.name}
              </p>
            </div>
            <Badge variant="secondary">{plan.status}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Periode:</span>
              <p className="font-medium">
                {format(new Date(plan.startDate), 'd MMM yyyy', { locale: localeId })} -{' '}
                {format(new Date(plan.endDate), 'd MMM yyyy', { locale: localeId })}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Jumlah Assignment:</span>
              <p className="font-medium">{plan._count?.assignments || 0} menu</p>
            </div>
          </div>

          {plan.description && (
            <div>
              <span className="text-sm text-muted-foreground">Deskripsi:</span>
              <p className="text-sm">{plan.description}</p>
            </div>
          )}
        </div>

        {/* Warning for Reject Mode */}
        {mode === 'reject' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Rencana menu akan dikembalikan ke status Draft. Pembuat rencana perlu melakukan
              revisi berdasarkan alasan penolakan yang Anda berikan.
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name={
                mode === 'submit'
                  ? 'submitNotes'
                  : mode === 'approve'
                  ? 'approvalNotes'
                  : mode === 'reject'
                  ? 'rejectionReason'
                  : 'publishNotes'
              }
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{config.fieldLabel}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={config.fieldPlaceholder}
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{config.fieldDescription}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant={config.confirmVariant}
                disabled={isPending}
              >
                {isPending ? 'Memproses...' : config.confirmText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
