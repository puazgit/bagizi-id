/**
 * @fileoverview Procurement Form Component - Comprehensive & Robust
 * @version Next.js 15.5.4 / React Hook Form + Zod / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

'use client'

import { type FC, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ShoppingCart, Truck, FileText, DollarSign, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

import type { Procurement, CreateProcurementInput } from '../types'

// ================================ VALIDATION SCHEMA ================================

const procurementFormSchema = z.object({
  planId: z.string().cuid('ID rencana pengadaan tidak valid').optional(),
  
  // Supplier (simplified - actual supplier relation handled separately)
  supplierId: z.string().cuid('ID supplier tidak valid'),
  
  // Procurement Details (matching Prisma model)
  procurementCode: z.string().min(1, 'Kode pengadaan harus diisi'),
  procurementDate: z.date(),
  expectedDelivery: z.date().optional(),
  actualDelivery: z.date().optional().nullable(),
  
  // Purchase Information
  purchaseMethod: z.enum(['DIRECT', 'TENDER', 'CONTRACT', 'EMERGENCY', 'BULK']),
  paymentTerms: z.string().optional(),
  
  // Financial (matching Prisma model)
  subtotalAmount: z.number().min(0, 'Subtotal tidak boleh negatif'),
  taxAmount: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  shippingCost: z.number().min(0).optional(),
  totalAmount: z.number().min(0, 'Total tidak boleh negatif'),
  paidAmount: z.number().min(0).optional(),
  
  // Logistics
  deliveryMethod: z.string().optional(),
  transportCost: z.number().min(0).optional(),
  
  // Quality
  qualityGrade: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'REJECTED']).optional(),
  qualityNotes: z.string().optional(),
  
  // Documents
  invoiceNumber: z.string().optional(),
  receiptNumber: z.string().optional(),
}).refine(
  (data) => {
    // Expected delivery must be after procurement date if set
    if (data.expectedDelivery) {
      return data.expectedDelivery >= data.procurementDate
    }
    return true
  },
  {
    message: 'Tanggal pengiriman harus setelah tanggal pengadaan',
    path: ['expectedDelivery'],
  }
)

type ProcurementFormData = z.infer<typeof procurementFormSchema>

// ================================ COMPONENT PROPS ================================

interface ProcurementFormProps {
  procurement?: Procurement
  onSubmit: (data: CreateProcurementInput) => void
  onCancel?: () => void
  isSubmitting?: boolean
}

// ================================ COMPONENT ================================

export const ProcurementForm: FC<ProcurementFormProps> = ({
  procurement,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const isEditing = !!procurement

  const form = useForm<ProcurementFormData>({
    resolver: zodResolver(procurementFormSchema),
    defaultValues: {
      planId: procurement?.planId || undefined,
      supplierId: procurement?.supplierId || '',
      procurementCode: procurement?.procurementCode || '',
      procurementDate: procurement?.procurementDate ? new Date(procurement.procurementDate) : new Date(),
      expectedDelivery: procurement?.expectedDelivery ? new Date(procurement.expectedDelivery) : undefined,
      actualDelivery: procurement?.actualDelivery ? new Date(procurement.actualDelivery) : null,
      purchaseMethod: (procurement?.purchaseMethod as 'DIRECT' | 'TENDER' | 'CONTRACT' | 'EMERGENCY' | 'BULK') || 'DIRECT',
      paymentTerms: procurement?.paymentTerms || '',
      subtotalAmount: procurement?.subtotalAmount || 0,
      taxAmount: procurement?.taxAmount || 0,
      discountAmount: procurement?.discountAmount || 0,
      shippingCost: procurement?.shippingCost || 0,
      totalAmount: procurement?.totalAmount || 0,
      paidAmount: procurement?.paidAmount || 0,
      deliveryMethod: procurement?.deliveryMethod || '',
      transportCost: procurement?.transportCost || undefined,
      qualityGrade: procurement?.qualityGrade || undefined,
      qualityNotes: procurement?.qualityNotes || '',
      invoiceNumber: procurement?.invoiceNumber || '',
      receiptNumber: procurement?.receiptNumber || '',
    },
  })

  // Reset form when procurement changes
  useEffect(() => {
    if (procurement) {
      form.reset({
        planId: procurement.planId || undefined,
        supplierId: procurement.supplierId,
        procurementCode: procurement.procurementCode,
        procurementDate: new Date(procurement.procurementDate),
        expectedDelivery: procurement.expectedDelivery ? new Date(procurement.expectedDelivery) : undefined,
        actualDelivery: procurement.actualDelivery ? new Date(procurement.actualDelivery) : undefined,
        purchaseMethod: procurement.purchaseMethod as 'DIRECT' | 'TENDER' | 'CONTRACT' | 'EMERGENCY' | 'BULK',
        paymentTerms: procurement.paymentTerms || '',
        subtotalAmount: procurement.subtotalAmount,
        taxAmount: procurement.taxAmount,
        discountAmount: procurement.discountAmount,
        shippingCost: procurement.shippingCost,
        totalAmount: procurement.totalAmount,
        paidAmount: procurement.paidAmount,
        deliveryMethod: procurement.deliveryMethod || '',
        transportCost: procurement.transportCost || undefined,
        qualityGrade: procurement.qualityGrade || undefined,
        qualityNotes: procurement.qualityNotes || '',
        invoiceNumber: procurement.invoiceNumber || '',
        receiptNumber: procurement.receiptNumber || '',
      })
    }
  }, [procurement, form])

  // Auto-calculate total amount
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (
        name === 'subtotalAmount' ||
        name === 'taxAmount' ||
        name === 'discountAmount' ||
        name === 'shippingCost'
      ) {
        const subtotal = value.subtotalAmount || 0
        const tax = value.taxAmount || 0
        const discount = value.discountAmount || 0
        const shipping = value.shippingCost || 0
        
        const total = subtotal + tax - discount + shipping
        form.setValue('totalAmount', total)
      }
    })
    
    return () => subscription.unsubscribe()
  }, [form])

  const handleSubmit = (data: ProcurementFormData) => {
    // Transform to CreateProcurementInput by adding items array
    // Note: Items management will be added in a separate component/feature
    const createInput: CreateProcurementInput = {
      ...data,
      items: [] // TODO: Add procurement items management
    }
    onSubmit(createInput)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <CardTitle>
                {isEditing ? 'Edit Pengadaan' : 'Buat Pengadaan Baru'}
              </CardTitle>
            </div>
            <CardDescription>
              {isEditing 
                ? 'Perbarui informasi pengadaan yang sudah ada'
                : 'Lengkapi informasi pengadaan untuk order baru'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Supplier Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Informasi Supplier</Badge>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier *</FormLabel>
                      <FormControl>
                        <Input placeholder="Pilih atau masukkan ID supplier" {...field} />
                      </FormControl>
                      <FormDescription>
                        ID supplier dari database - gunakan SupplierSelect untuk memilih
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Order Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <Badge variant="outline">Detail Pengadaan</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="procurementCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kode Pengadaan *</FormLabel>
                      <FormControl>
                        <Input placeholder="PROC-2024-001" {...field} />
                      </FormControl>
                      <FormDescription>
                        Kode unik pengadaan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchaseMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metode Pembelian *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih metode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DIRECT">Pembelian Langsung</SelectItem>
                          <SelectItem value="TENDER">Tender</SelectItem>
                          <SelectItem value="CONTRACT">Kontrak</SelectItem>
                          <SelectItem value="EMERGENCY">Darurat</SelectItem>
                          <SelectItem value="BULK">Pembelian Massal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="procurementDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Tanggal Pengadaan *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pilih tanggal</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expectedDelivery"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Tanggal Pengiriman</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pilih tanggal</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < form.getValues('procurementDate')
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Tanggal perkiraan pengiriman
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Cost Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <Badge variant="outline">Rincian Biaya</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="subtotalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtotal *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1000000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Total harga barang
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pajak (PPN)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="110000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        11% dari subtotal
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diskon</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="50000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shippingCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biaya Pengiriman</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="50000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-lg font-semibold">Total Pembayaran</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="text-lg font-bold"
                          readOnly
                        />
                      </FormControl>
                      <FormDescription>
                        Dihitung otomatis: Subtotal + Pajak - Diskon + Ongkir
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Shipping & Logistics */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                <Badge variant="outline">Pengiriman & Logistik</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="deliveryMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metode Pengiriman</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Truk, Motor, Kargo, dll"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Metode atau kendaraan pengiriman
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transportCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biaya Transport</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Biaya transportasi barang (Rp)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="receiptNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Resi</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="RECEIPT-2024-001" 
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Nomor tanda terima/receipt
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Payment & Quality */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <Badge variant="outline">Pembayaran & Kualitas</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ketentuan Pembayaran</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Net 30, COD, dll"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Syarat pembayaran
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paidAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jumlah Dibayar *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Total yang sudah dibayar (Rp)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Invoice</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="INV-2024-001" 
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Nomor invoice supplier
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="qualityGrade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade Kualitas</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih grade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EXCELLENT">Excellent (Sangat Baik)</SelectItem>
                          <SelectItem value="GOOD">Good (Baik)</SelectItem>
                          <SelectItem value="FAIR">Fair (Cukup)</SelectItem>
                          <SelectItem value="POOR">Poor (Kurang)</SelectItem>
                          <SelectItem value="REJECTED">Rejected (Ditolak)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Penilaian kualitas barang
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="qualityNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catatan Kualitas</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Kondisi barang, catatan QC, dll"
                          rows={3}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2 border-t pt-6">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Batal
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : isEditing ? 'Perbarui Pengadaan' : 'Simpan Pengadaan'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
