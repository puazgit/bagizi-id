/**
 * @fileoverview Approve Demo Request Dialog Component
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
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useApproveDemoRequest } from '../../hooks/useDemoRequests'

// ================================ COMPONENT INTERFACES ================================

interface ApproveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: string
  organizationName?: string
}

// ================================ VALIDATION SCHEMA ================================

const approveSchema = z.object({
  notes: z.string().max(500, 'Catatan maksimal 500 karakter').optional(),
})

type ApproveFormData = z.infer<typeof approveSchema>

// ================================ MAIN COMPONENT ================================

/**
 * Dialog for approving demo requests
 * 
 * @param open - Dialog open state
 * @param onOpenChange - Callback when dialog state changes
 * @param requestId - ID of demo request to approve
 * @param organizationName - Organization name for confirmation message
 * 
 * @example
 * ```tsx
 * <ApproveDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   requestId="clxx123"
 *   organizationName="Yayasan Maju Bersama"
 * />
 * ```
 */
export function ApproveDialog({
  open,
  onOpenChange,
  requestId,
  organizationName,
}: ApproveDialogProps) {
  const { mutate: approve, isPending } = useApproveDemoRequest()

  const form = useForm<ApproveFormData>({
    resolver: zodResolver(approveSchema),
    defaultValues: {
      notes: '',
    },
  })

  const onSubmit = (data: ApproveFormData) => {
    approve(
      { id: requestId, data: { notes: data.notes } },
      {
        onSuccess: () => {
          toast.success('Demo request berhasil disetujui')
          onOpenChange(false)
          form.reset()
        },
        onError: (error) => {
          toast.error(error.message || 'Gagal menyetujui demo request')
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
          <DialogTitle>Setujui Demo Request</DialogTitle>
          <DialogDescription>
            Anda akan menyetujui demo request dari{' '}
            <span className="font-semibold text-foreground">
              {organizationName || 'organisasi ini'}
            </span>
            . Tim akan diberitahu dan dapat melanjutkan proses demo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tambahkan catatan untuk tim internal..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
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
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Memproses...' : 'Setujui Demo Request'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
