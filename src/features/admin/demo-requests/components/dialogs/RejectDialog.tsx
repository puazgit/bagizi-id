/**
 * @fileoverview Reject Demo Request Dialog Component
 * @version Next.js 15.5.4 / shadcn/ui / React Hook Form + Zod
 * @author Bagizi-ID Development Team
 * @see {@link /docs/ADMIN_DEMO_REQUESTS_FRONTEND_FOUNDATION_COMPLETE.md} Foundation Documentation
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useRejectDemoRequest } from '../../hooks/useDemoRequests'
import { AlertTriangle } from 'lucide-react'

// ================================ COMPONENT INTERFACES ================================

interface RejectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: string
  organizationName?: string
}

// ================================ VALIDATION SCHEMA ================================

const rejectSchema = z.object({
  rejectionReason: z
    .string()
    .min(10, 'Alasan penolakan minimal 10 karakter')
    .max(1000, 'Alasan penolakan maksimal 1000 karakter'),
})

type RejectFormData = z.infer<typeof rejectSchema>

// ================================ MAIN COMPONENT ================================

/**
 * Dialog for rejecting demo requests
 * Requires rejection reason (minimum 10 characters)
 * 
 * @param open - Dialog open state
 * @param onOpenChange - Callback when dialog state changes
 * @param requestId - ID of demo request to reject
 * @param organizationName - Organization name for confirmation message
 * 
 * @example
 * ```tsx
 * <RejectDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   requestId="clxx123"
 *   organizationName="Yayasan Maju Bersama"
 * />
 * ```
 */
export function RejectDialog({
  open,
  onOpenChange,
  requestId,
  organizationName,
}: RejectDialogProps) {
  const { mutate: reject, isPending } = useRejectDemoRequest()

  const form = useForm<RejectFormData>({
    resolver: zodResolver(rejectSchema),
    defaultValues: {
      rejectionReason: '',
    },
  })

  const onSubmit = (data: RejectFormData) => {
    reject(
      { id: requestId, data: { rejectionReason: data.rejectionReason } },
      {
        onSuccess: () => {
          toast.success('Demo request berhasil ditolak')
          onOpenChange(false)
          form.reset()
        },
        onError: (error) => {
          toast.error(error.message || 'Gagal menolak demo request')
        },
      }
    )
  }

  const handleClose = () => {
    if (!isPending) {
      form.reset()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Tolak Demo Request
          </DialogTitle>
          <DialogDescription>
            Anda akan menolak demo request dari{' '}
            <span className="font-semibold text-foreground">
              {organizationName || 'organisasi ini'}
            </span>
            . Mohon berikan alasan penolakan yang jelas.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rejectionReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Alasan Penolakan <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Jelaskan alasan penolakan demo request ini..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Minimal 10 karakter. Alasan ini akan dikirim ke pemohon.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isPending}
              >
                {isPending ? 'Memproses...' : 'Tolak Demo Request'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
