/**
 * @fileoverview Demo Request Detail Sheet Component
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/ADMIN_DEMO_REQUESTS_FRONTEND_FOUNDATION_COMPLETE.md} Foundation Documentation
 */

'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Users,
  Target,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
  MessageSquare,
  Activity,
  ArrowRight,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import type { DemoRequestWithRelations } from '../types/demo-request.types'
import { DemoRequestStatusBadge } from './DemoRequestStatusBadge'
import { DemoRequestActions, type DemoRequestAction } from './DemoRequestActions'

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

interface DemoRequestDetailSheetProps {
  /**
   * Demo request data
   */
  data: DemoRequestWithRelations | null

  /**
   * Open state
   */
  open: boolean

  /**
   * Close handler
   */
  onOpenChange: (open: boolean) => void

  /**
   * Action handler
   */
  onAction?: (action: DemoRequestAction, requestId: string, organizationName?: string) => void

  /**
   * Edit handler
   */
  onEdit?: (requestId: string) => void

  /**
   * Loading state
   */
  isLoading?: boolean
}

interface InfoItemProps {
  icon: React.ElementType
  label: string
  value: string | number | null | undefined
  valueClassName?: string
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format organization type label
 */
function getOrgTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    PEMERINTAH: 'Pemerintah',
    SWASTA: 'Swasta',
    YAYASAN: 'Yayasan',
    KOMUNITAS: 'Komunitas',
    LAINNYA: 'Lainnya',
  }
  return labels[type] || type
}

/**
 * Format demo type label
 */
function getDemoTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    STANDARD: 'Standard (14 hari)',
    EXTENDED: 'Extended (30 hari)',
    GUIDED: 'Guided',
    SELF_SERVICE: 'Self Service',
  }
  return labels[type] || type
}

/**
 * Get status icon
 */
function getStatusIcon(status: string) {
  switch (status) {
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
      return AlertCircle
    case 'APPROVED':
    case 'DEMO_ACTIVE':
    case 'CONVERTED':
      return CheckCircle2
    case 'REJECTED':
    case 'EXPIRED':
    case 'CANCELLED':
      return XCircle
    default:
      return AlertCircle
  }
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Info item component
 */
function InfoItem({ icon: Icon, label, value, valueClassName }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
      <div className="flex-1 space-y-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`text-sm font-medium ${valueClassName || ''}`}>
          {value || '-'}
        </p>
      </div>
    </div>
  )
}

/**
 * Status timeline component
 */
function StatusTimeline({ data }: { data: DemoRequestWithRelations }) {
  const StatusIcon = getStatusIcon(data.status)
  
  const timeline = [
    {
      status: 'SUBMITTED',
      label: 'Dikirim',
      date: data.createdAt,
      active: true,
    },
    {
      status: 'UNDER_REVIEW',
      label: 'Dalam Review',
      date: data.reviewedAt,
      active: ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DEMO_ACTIVE', 'CONVERTED'].includes(data.status),
    },
    {
      status: 'APPROVED',
      label: 'Disetujui',
      date: data.approvedAt,
      active: ['APPROVED', 'DEMO_ACTIVE', 'CONVERTED'].includes(data.status),
    },
    {
      status: 'DEMO_ACTIVE',
      label: 'Demo Aktif',
      date: data.demoCreatedAt,
      active: ['DEMO_ACTIVE', 'CONVERTED'].includes(data.status),
    },
    {
      status: 'CONVERTED',
      label: 'Terkonversi',
      date: data.convertedAt,
      active: data.status === 'CONVERTED',
    },
  ]

  return (
    <div className="space-y-4">
      {timeline.map((item, index) => (
        <div key={item.status} className="flex gap-4">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                item.active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-muted bg-background text-muted-foreground'
              }`}
            >
              {item.active && index === timeline.filter((t) => t.active).length - 1 ? (
                <StatusIcon className="h-4 w-4" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-current" />
              )}
            </div>
            {index < timeline.length - 1 && (
              <div
                className={`w-0.5 h-12 ${
                  item.active ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>

          {/* Timeline content */}
          <div className="flex-1 pb-8">
            <p className={`text-sm font-medium ${item.active ? 'text-foreground' : 'text-muted-foreground'}`}>
              {item.label}
            </p>
            {item.date && (
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(item.date), 'dd MMM yyyy, HH:mm', { locale: idLocale })}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * DemoRequestDetailSheet - Detail view using Sheet component
 *
 * Features:
 * - Tabbed interface (Details, Contact, Activity, Notes)
 * - Full request information display
 * - Status timeline
 * - Action buttons (approve/reject/assign/convert)
 * - Edit button
 * - Responsive design
 * - Dark mode support
 *
 * @example
 * ```tsx
 * <DemoRequestDetailSheet
 *   data={demoRequest}
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onAction={(action, id) => handleAction(action, id)}
 *   onEdit={(id) => router.push(`/admin/demo-requests/${id}/edit`)}
 * />
 * ```
 */
export function DemoRequestDetailSheet({
  data,
  open,
  onOpenChange,
  onAction,
  onEdit,
  isLoading = false,
}: DemoRequestDetailSheetProps) {
  const [activeTab, setActiveTab] = useState('details')

  if (!data && !isLoading) {
    return null
  }

  const handleAction = (action: DemoRequestAction) => {
    if (data && onAction) {
      onAction(action, data.id, data.organizationName)
    }
  }

  const handleEdit = () => {
    if (data && onEdit) {
      onEdit(data.id)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Memuat data...</p>
            </div>
          </div>
        ) : data ? (
          <>
            {/* Header */}
            <SheetHeader className="space-y-4 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <SheetTitle className="text-2xl">
                    {data.organizationName}
                  </SheetTitle>
                  <SheetDescription className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {getOrgTypeLabel(data.organizationType)}
                  </SheetDescription>
                </div>
                <DemoRequestStatusBadge status={data.status} size="lg" />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                {onEdit && (
                  <Button onClick={handleEdit} variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                <DemoRequestActions
                  requestId={data.id}
                  status={data.status}
                  organizationName={data.organizationName}
                  onAction={handleAction}
                  showTrigger={true}
                  triggerVariant="outline"
                />
              </div>
            </SheetHeader>

            <Separator className="my-4" />

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">
                  <FileText className="h-4 w-4 mr-2" />
                  Detail
                </TabsTrigger>
                <TabsTrigger value="contact">
                  <User className="h-4 w-4 mr-2" />
                  Kontak
                </TabsTrigger>
                <TabsTrigger value="activity">
                  <Activity className="h-4 w-4 mr-2" />
                  Aktivitas
                </TabsTrigger>
                <TabsTrigger value="notes">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Catatan
                </TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4">
                {/* Organization Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Informasi Organisasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <InfoItem
                      icon={Building2}
                      label="Nama Organisasi"
                      value={data.organizationName}
                    />
                    <InfoItem
                      icon={Target}
                      label="Tipe Organisasi"
                      value={getOrgTypeLabel(data.organizationType)}
                    />
                    <InfoItem
                      icon={Users}
                      label="Target Penerima Manfaat"
                      value={data.targetBeneficiaries ? data.targetBeneficiaries.toLocaleString('id-ID') : '-'}
                    />
                    <InfoItem
                      icon={MapPin}
                      label="Area Operasional"
                      value={data.operationalArea}
                    />
                  </CardContent>
                </Card>

                {/* Demo Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Detail Demo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <InfoItem
                      icon={FileText}
                      label="Tipe Demo"
                      value={getDemoTypeLabel(data.demoType)}
                    />
                    <InfoItem
                      icon={Calendar}
                      label="Tanggal Mulai Demo"
                      value={data.preferredStartDate ? format(new Date(data.preferredStartDate), 'dd MMMM yyyy', { locale: idLocale }) : '-'}
                    />
                    <InfoItem
                      icon={Clock}
                      label="Durasi Demo"
                      value={data.estimatedDuration ? `${data.estimatedDuration} hari` : '-'}
                    />
                    {data.specialRequirements && (
                      <InfoItem
                        icon={AlertCircle}
                        label="Kebutuhan Khusus"
                        value={data.specialRequirements}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Conversion Info */}
                {data.status === 'CONVERTED' && data.productionSppg && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Informasi Konversi
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <InfoItem
                        icon={Building2}
                        label="SPPG"
                        value={data.productionSppg.name}
                        valueClassName="text-green-600 font-semibold"
                      />
                      <InfoItem
                        icon={Calendar}
                        label="Tanggal Konversi"
                        value={data.convertedAt ? format(new Date(data.convertedAt), 'dd MMMM yyyy', { locale: idLocale }) : '-'}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Status Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Timeline Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StatusTimeline data={data} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contact Tab */}
              <TabsContent value="contact" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Person In Charge (PIC)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <InfoItem
                      icon={User}
                      label="Nama PIC"
                      value={data.picName}
                    />
                    {data.picPosition && (
                      <InfoItem
                        icon={Building2}
                        label="Jabatan"
                        value={data.picPosition}
                      />
                    )}
                    <InfoItem
                      icon={Mail}
                      label="Email"
                      value={data.picEmail}
                      valueClassName="text-blue-600 dark:text-blue-400"
                    />
                    <InfoItem
                      icon={Phone}
                      label="Telepon"
                      value={data.picPhone}
                    />
                    {data.picWhatsapp && (
                      <InfoItem
                        icon={Phone}
                        label="WhatsApp"
                        value={data.picWhatsapp}
                        valueClassName="text-green-600 dark:text-green-400"
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Assigned To */}
                {data.assignedTo && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Ditugaskan Kepada
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <InfoItem
                        icon={User}
                        label="Staff"
                        value={data.assignedTo}
                      />
                      {data.assignedAt && (
                        <InfoItem
                          icon={Calendar}
                          label="Tanggal Penugasan"
                          value={format(new Date(data.assignedAt), 'dd MMMM yyyy, HH:mm', { locale: idLocale })}
                        />
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Riwayat Aktivitas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Created */}
                      <div className="flex gap-3 pb-4 border-b last:border-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <ArrowRight className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">Demo request dibuat</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(data.createdAt), 'dd MMMM yyyy, HH:mm', { locale: idLocale })}
                          </p>
                        </div>
                      </div>

                      {/* Updated */}
                      {data.updatedAt && new Date(data.updatedAt).getTime() !== new Date(data.createdAt).getTime() && (
                        <div className="flex gap-3 pb-4 border-b last:border-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                            <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">Data diperbarui</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(data.updatedAt), 'dd MMMM yyyy, HH:mm', { locale: idLocale })}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Approved */}
                      {data.approvedAt && (
                        <div className="flex gap-3 pb-4 border-b last:border-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">Demo request disetujui</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(data.approvedAt), 'dd MMMM yyyy, HH:mm', { locale: idLocale })}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Rejected */}
                      {data.rejectedAt && (
                        <div className="flex gap-3 pb-4 border-b last:border-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">Demo request ditolak</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(data.rejectedAt), 'dd MMMM yyyy, HH:mm', { locale: idLocale })}
                            </p>
                            {data.rejectionReason && (
                              <p className="text-xs text-muted-foreground mt-2">
                                <span className="font-medium">Alasan:</span> {data.rejectionReason}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Converted */}
                      {data.convertedAt && (
                        <div className="flex gap-3 pb-4 border-b last:border-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">Berhasil dikonversi ke SPPG</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(data.convertedAt), 'dd MMMM yyyy, HH:mm', { locale: idLocale })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Catatan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.notes ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap">{data.notes}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Belum ada catatan untuk demo request ini.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Additional Info */}
                {(data.currentSystem || data.specialRequirements) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Informasi Tambahan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {data.currentSystem && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Sistem Saat Ini</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {data.currentSystem}
                          </p>
                        </div>
                      )}
                      {data.specialRequirements && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Kebutuhan Khusus</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {data.specialRequirements}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
