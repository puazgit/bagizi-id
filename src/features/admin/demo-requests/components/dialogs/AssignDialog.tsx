/**
 * @fileoverview Assign Demo Request Dialog Component
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAssignDemoRequest } from '../../hooks/useDemoRequests'
import { UserPlus } from 'lucide-react'

// ================================ COMPONENT INTERFACES ================================

interface AssignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: string
  organizationName?: string
}

// ================================ VALIDATION SCHEMA ================================

const assignSchema = z.object({
  assignedTo: z.string().min(1, 'Pilih anggota tim untuk ditugaskan'),
  notes: z.string().max(500, 'Catatan maksimal 500 karakter').optional(),
})

type AssignFormData = z.infer<typeof assignSchema>

// ================================ MAIN COMPONENT ================================

/**
 * Dialog for assigning demo requests to team members
 * 
 * @param open - Dialog open state
 * @param onOpenChange - Callback when dialog state changes
 * @param requestId - ID of demo request to assign
 * @param organizationName - Organization name for context
 * 
 * @example
 * ```tsx
 * <AssignDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   requestId="clxx123"
 *   organizationName="Yayasan Maju Bersama"
 * />
 * ```
 */
export function AssignDialog({
  open,
  onOpenChange,
  requestId,
  organizationName,
}: AssignDialogProps) {
  const { mutate: assign, isPending } = useAssignDemoRequest()

  const form = useForm<AssignFormData>({
    resolver: zodResolver(assignSchema),
    defaultValues: {
      assignedTo: '',
      notes: '',
    },
  })

  const onSubmit = (data: AssignFormData) => {
    assign(
      { 
        id: requestId, 
        data: { 
          assignedTo: data.assignedTo, 
          notes: data.notes 
        } 
      },
      {
        onSuccess: () => {
          toast.success('Demo request berhasil ditugaskan')
          onOpenChange(false)
          form.reset()
        },
        onError: (error) => {
          toast.error(error.message || 'Gagal menugaskan demo request')
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

  // TODO: Replace with actual team members from API
  const teamMembers = [
    { id: 'user1', name: 'Ahmad Fauzi', role: 'Sales Manager' },
    { id: 'user2', name: 'Siti Nurhaliza', role: 'Sales Executive' },
    { id: 'user3', name: 'Budi Santoso', role: 'Sales Executive' },
    { id: 'user4', name: 'Dewi Kartika', role: 'Customer Success' },
  ]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Tugaskan Demo Request
          </DialogTitle>
          <DialogDescription>
            Tugaskan demo request dari{' '}
            <span className="font-semibold text-foreground">
              {organizationName || 'organisasi ini'}
            </span>{' '}
            ke anggota tim untuk ditindaklanjuti.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tugaskan Kepada <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih anggota tim" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{member.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {member.role}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Pilih anggota tim yang akan menangani demo request ini
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tambahkan catatan atau instruksi khusus..."
                      className="min-h-[80px] resize-none"
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
                {isPending ? 'Memproses...' : 'Tugaskan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
