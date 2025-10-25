/**
 * @fileoverview Convert Demo Request to SPPG Dialog Component
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
import { useConvertDemoRequest } from '../../hooks/useDemoRequests'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

// ================================ COMPONENT INTERFACES ================================

interface ConvertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: string
  organizationName?: string
}

// ================================ VALIDATION SCHEMA ================================

const convertSchema = z.object({
  convertedSppgId: z.string().min(1, 'Pilih SPPG untuk konversi'),
  notes: z.string().max(500, 'Catatan maksimal 500 karakter').optional(),
})

type ConvertFormData = z.infer<typeof convertSchema>

// ================================ MAIN COMPONENT ================================

/**
 * Dialog for converting demo requests to production SPPG
 * SUPERADMIN only action
 * 
 * @param open - Dialog open state
 * @param onOpenChange - Callback when dialog state changes
 * @param requestId - ID of demo request to convert
 * @param organizationName - Organization name for confirmation
 * 
 * @example
 * ```tsx
 * <ConvertDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   requestId="clxx123"
 *   organizationName="Yayasan Maju Bersama"
 * />
 * ```
 */
export function ConvertDialog({
  open,
  onOpenChange,
  requestId,
  organizationName,
}: ConvertDialogProps) {
  const { mutate: convert, isPending } = useConvertDemoRequest()

  const form = useForm<ConvertFormData>({
    resolver: zodResolver(convertSchema),
    defaultValues: {
      convertedSppgId: '',
      notes: '',
    },
  })

  const onSubmit = (data: ConvertFormData) => {
    convert(
      { 
        id: requestId, 
        data: { 
          convertedSppgId: data.convertedSppgId, 
          notes: data.notes 
        } 
      },
      {
        onSuccess: () => {
          toast.success('Demo request berhasil dikonversi ke SPPG')
          onOpenChange(false)
          form.reset()
        },
        onError: (error) => {
          toast.error(error.message || 'Gagal konversi demo request')
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

  // TODO: Replace with actual SPPG list from API
  const sppgList = [
    { id: 'sppg1', name: 'SPPG Jakarta Pusat', code: 'JKT-001' },
    { id: 'sppg2', name: 'SPPG Jakarta Selatan', code: 'JKT-002' },
    { id: 'sppg3', name: 'SPPG Bandung', code: 'BDG-001' },
    { id: 'sppg4', name: 'SPPG Surabaya', code: 'SBY-001' },
  ]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Konversi ke SPPG Produksi
          </DialogTitle>
          <DialogDescription>
            Konversi demo request dari{' '}
            <span className="font-semibold text-foreground">
              {organizationName || 'organisasi ini'}
            </span>{' '}
            menjadi SPPG produksi aktif.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Tindakan ini akan membuat akun SPPG baru dan memberikan akses penuh
            ke sistem. Pastikan semua data sudah diverifikasi.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="convertedSppgId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Pilih SPPG <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih SPPG untuk konversi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sppgList.map((sppg) => (
                        <SelectItem key={sppg.id} value={sppg.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{sppg.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {sppg.code}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    SPPG yang akan diasosiasikan dengan organisasi ini
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
                  <FormLabel>Catatan Konversi (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tambahkan catatan tentang proses konversi..."
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
                {isPending ? 'Memproses...' : 'Konversi ke SPPG'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
