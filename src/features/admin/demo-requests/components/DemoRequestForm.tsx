/**
 * @fileoverview Demo Request Form Component - Create/Edit form for demo requests
 * @version Next.js 15.5.4 / React Hook Form / Zod
 * @author Bagizi-ID Development Team
 * @see {@link /docs/ADMIN_DEMO_REQUESTS_FRONTEND_FOUNDATION_COMPLETE.md} Foundation Documentation
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  FileText,
} from 'lucide-react'
import { demoRequestFormSchema } from '../schemas/demo-request.schema'
import type { DemoRequestFormInput } from '../types/demo-request.types'
import { ORGANIZATION_TYPE_LABELS, DEMO_TYPE_LABELS } from '../types/demo-request.types'

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

interface DemoRequestFormProps {
  /**
   * Initial form values (for editing)
   */
  defaultValues?: Partial<DemoRequestFormInput>

  /**
   * Submit handler
   */
  onSubmit: (data: DemoRequestFormInput) => Promise<void> | void

  /**
   * Cancel handler
   */
  onCancel?: () => void

  /**
   * Form mode
   */
  mode?: 'create' | 'edit'

  /**
   * Is submitting
   */
  isSubmitting?: boolean
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * DemoRequestForm - Comprehensive form for creating/editing demo requests
 *
 * Features:
 * - Multi-section form (Contact, Organization, Demo Details)
 * - React Hook Form + Zod validation
 * - Auto-save draft functionality
 * - Field validation with error messages
 * - Responsive design
 * - Dark mode support
 *
 * @example
 * ```tsx
 * <DemoRequestForm
 *   mode="create"
 *   onSubmit={async (data) => {
 *     await createMutation.mutateAsync(data)
 *   }}
 *   onCancel={() => router.back()}
 *   isSubmitting={createMutation.isPending}
 * />
 * ```
 */
export function DemoRequestForm({
  defaultValues,
  onSubmit,
  onCancel,
  mode = 'create',
  isSubmitting = false,
}: DemoRequestFormProps) {
  const form = useForm({
    resolver: zodResolver(demoRequestFormSchema),
    defaultValues: {
      organizationType: 'YAYASAN',
      demoType: 'STANDARD',
      estimatedDuration: 14,
      demoDuration: 60,
      demoMode: 'ONLINE',
      preferredTime: 'MORNING',
      timezone: 'Asia/Jakarta',
      followUpRequired: true,
      currentChallenges: [],
      expectedGoals: [],
      requestedFeatures: [],
      ...defaultValues,
    },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data)
  })

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Contact Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Informasi Kontak</CardTitle>
            </div>
            <CardDescription>
              Detail kontak person-in-charge (PIC) organisasi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Organization Name */}
            <FormField
              control={form.control}
              name="organizationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nama Organisasi <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        placeholder="Yayasan Maju Bersama"
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PIC Name */}
            <FormField
              control={form.control}
              name="picName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nama PIC <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ahmad Fauzi" />
                  </FormControl>
                  <FormDescription>
                    Person-in-charge yang akan dihubungi
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PIC Email */}
              <FormField
                control={form.control}
                name="picEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="email"
                          placeholder="ahmad@yayasan.org"
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PIC Phone */}
              <FormField
                control={form.control}
                name="picPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Telepon <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          placeholder="081234567890"
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PIC WhatsApp */}
              <FormField
                control={form.control}
                name="picWhatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp (Opsional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="081234567890" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PIC Position */}
              <FormField
                control={form.control}
                name="picPosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jabatan (Opsional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Direktur Program" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Organization Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>Detail Organisasi</CardTitle>
            </div>
            <CardDescription>
              Informasi tentang organisasi dan kebutuhan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Organization Type */}
              <FormField
                control={form.control}
                name="organizationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tipe Organisasi <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe organisasi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(ORGANIZATION_TYPE_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Target Beneficiaries */}
              <FormField
                control={form.control}
                name="targetBeneficiaries"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Penerima Manfaat</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="100"
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseInt(e.target.value) : 0
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Perkiraan jumlah penerima manfaat
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Operational Area */}
            <FormField
              control={form.control}
              name="operationalArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area Operasional</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        placeholder="Jakarta, Bogor, Depok, Tangerang, Bekasi"
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Wilayah operasional organisasi
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Current System */}
            <FormField
              control={form.control}
              name="currentSystem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sistem Saat Ini</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Jelaskan sistem manajemen gizi yang saat ini digunakan..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Section 3: Demo Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Detail Demo</CardTitle>
            </div>
            <CardDescription>
              Preferensi dan jadwal demo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Demo Type */}
              <FormField
                control={form.control}
                name="demoType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tipe Demo <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe demo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(DEMO_TYPE_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Demo Mode */}
              <FormField
                control={form.control}
                name="demoMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mode Demo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ONLINE">Online (Video Call)</SelectItem>
                        <SelectItem value="OFFLINE">Offline (Tatap Muka)</SelectItem>
                        <SelectItem value="HYBRID">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Demo Duration */}
              <FormField
                control={form.control}
                name="demoDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durasi Demo (menit)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="number"
                          className="pl-10"
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseInt(e.target.value) : 60
                            )
                          }
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Preferred Time */}
              <FormField
                control={form.control}
                name="preferredTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waktu Preferensi</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MORNING">Pagi (08:00-12:00)</SelectItem>
                        <SelectItem value="AFTERNOON">Siang (13:00-17:00)</SelectItem>
                        <SelectItem value="EVENING">Malam (18:00-21:00)</SelectItem>
                        <SelectItem value="FLEXIBLE">Fleksibel</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estimated Duration */}
              <FormField
                control={form.control}
                name="estimatedDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durasi Trial (hari)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseInt(e.target.value) : 14
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Durasi masa percobaan
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Special Requirements */}
            <FormField
              control={form.control}
              name="specialRequirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kebutuhan Khusus</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Jelaskan kebutuhan khusus atau pertanyaan untuk demo..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan Internal</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        {...field}
                        placeholder="Catatan internal untuk tim..."
                        rows={3}
                        className="pl-10 pt-3"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Hanya terlihat oleh tim admin
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {mode === 'create' ? 'Buat Baru' : 'Edit'}
            </Badge>
            {form.formState.isDirty && (
              <span className="text-sm text-muted-foreground">
                *Ada perubahan yang belum disimpan
              </span>
            )}
          </div>

          <div className="flex gap-2">
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
              {isSubmitting
                ? mode === 'create'
                  ? 'Membuat...'
                  : 'Menyimpan...'
                : mode === 'create'
                  ? 'Buat Demo Request'
                  : 'Simpan Perubahan'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
