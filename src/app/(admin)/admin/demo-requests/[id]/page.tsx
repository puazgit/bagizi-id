/**
 * @fileoverview Admin Demo Request Detail Page
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  ArrowLeft, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  CheckCircle,
  XCircle,
  UserPlus,
  RefreshCw,
  Clock,
  Target,
  TrendingUp,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { useDemoRequest } from '@/features/admin/demo-requests'
import { DemoRequestStatusBadge } from '@/features/admin/demo-requests/components'
import { ApproveDialog } from '@/features/admin/demo-requests/components/dialogs/ApproveDialog'
import { RejectDialog } from '@/features/admin/demo-requests/components/dialogs/RejectDialog'
import { AssignDialog } from '@/features/admin/demo-requests/components/dialogs/AssignDialog'
import { ConvertDialog } from '@/features/admin/demo-requests/components/dialogs/ConvertDialog'
import { 
  ORGANIZATION_TYPE_LABELS,
  DEMO_TYPE_LABELS 
} from '@/features/admin/demo-requests/types/demo-request.types'
import { useState } from 'react'
import { useDemoRequestPermissions, useIsReadOnly } from '@/hooks/usePermissions'

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

interface PageProps {
  params: Promise<{
    id: string
  }>
}

interface DialogState {
  approve: boolean
  reject: boolean
  assign: boolean
  convert: boolean
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Demo Request Detail Page - View and manage single demo request
 *
 * Features:
 * - Complete request information
 * - Status badge
 * - Action buttons (Approve, Reject, Assign, Convert)
 * - Timeline history
 * - Related SPPG information
 *
 * @example
 * // Route: /admin/demo-requests/[id]
 */
export default function DemoRequestDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { data: request, isLoading, error } = useDemoRequest(resolvedParams.id)
  
  // Permission checks
  const permissions = useDemoRequestPermissions()
  const isReadOnly = useIsReadOnly()
  
  const [dialogs, setDialogs] = useState<DialogState>({
    approve: false,
    reject: false,
    assign: false,
    convert: false,
  })

  const openDialog = (type: keyof DialogState) => {
    setDialogs({ ...dialogs, [type]: true })
  }

  const closeDialog = (type: keyof DialogState) => {
    setDialogs({ ...dialogs, [type]: false })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  // Error state
  if (error || !request) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="text-lg font-semibold">Demo request tidak ditemukan</p>
              <p className="text-sm text-muted-foreground mt-2">{error?.message}</p>
              <Button onClick={() => router.back()} className="mt-4">
                Kembali
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {request.organizationName}
            </h1>
            <p className="text-muted-foreground mt-1">
              Demo Request Detail
            </p>
          </div>
        </div>

        {/* Action Buttons - With Permission Checks */}
        <div className="flex items-center gap-2">
          {/* SUBMITTED Status - Can Approve/Reject */}
          {request.status === 'SUBMITTED' && permissions.canTakeAction && (
            <>
              {permissions.canReject && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => openDialog('reject')}
                  disabled={isReadOnly}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              )}
              {permissions.canApprove && (
                <Button
                  variant="default"
                  size="default"
                  onClick={() => openDialog('approve')}
                  disabled={isReadOnly}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              )}
            </>
          )}
          
          {/* UNDER_REVIEW Status - Can Assign/Approve/Reject */}
          {request.status === 'UNDER_REVIEW' && permissions.canTakeAction && (
            <>
              {permissions.canTakeAction && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => openDialog('assign')}
                  disabled={isReadOnly}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign
                </Button>
              )}
              {permissions.canReject && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => openDialog('reject')}
                  disabled={isReadOnly}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              )}
              {permissions.canApprove && (
                <Button
                  variant="default"
                  size="default"
                  onClick={() => openDialog('approve')}
                  disabled={isReadOnly}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              )}
            </>
          )}
          
          {/* APPROVED Status - Can Convert to SPPG */}
          {request.status === 'APPROVED' && permissions.canConvert && (
            <Button
              variant="default"
              size="default"
              onClick={() => openDialog('convert')}
              disabled={isReadOnly}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Convert to SPPG
            </Button>
          )}
          
          {/* Read-only indicator for ANALYST role */}
          {isReadOnly && (
            <Badge variant="outline" className="text-xs">
              <Clock className="mr-1 h-3 w-3" />
              View Only Access
            </Badge>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div>
        <DemoRequestStatusBadge status={request.status} size="lg" />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Kontak
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nama PIC</p>
                  <p className="text-base">{request.picName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {request.picEmail}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telepon</p>
                  <p className="text-base flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {request.picPhone}
                  </p>
                </div>
                {request.picWhatsapp && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">WhatsApp</p>
                    <p className="text-base">{request.picWhatsapp}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Organization Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informasi Organisasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nama Organisasi</p>
                  <p className="text-base font-semibold">{request.organizationName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipe Organisasi</p>
                  <p className="text-base">
                    {ORGANIZATION_TYPE_LABELS[request.organizationType]}
                  </p>
                </div>
                {request.operationalArea && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Wilayah Operasional</p>
                    <p className="text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {request.operationalArea}
                    </p>
                  </div>
                )}
                {request.targetBeneficiaries && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Target Penerima Manfaat</p>
                    <p className="text-base font-semibold flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      {request.targetBeneficiaries.toLocaleString('id-ID')} orang
                    </p>
                  </div>
                )}
              </div>
              
              {request.currentChallenges && request.currentChallenges.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Tantangan Saat Ini</p>
                    <ul className="list-disc list-inside space-y-1">
                      {(request.currentChallenges as string[]).map((challenge, idx) => (
                        <li key={idx} className="text-sm">{challenge}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
              
              {request.expectedGoals && request.expectedGoals.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Tujuan yang Diharapkan</p>
                    <ul className="list-disc list-inside space-y-1">
                      {(request.expectedGoals as string[]).map((goal, idx) => (
                        <li key={idx} className="text-sm">{goal}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Demo Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Detail Demo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipe Demo</p>
                  <Badge variant="outline">{DEMO_TYPE_LABELS[request.demoType]}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Durasi Estimasi</p>
                  <p className="text-base">{request.estimatedDuration} hari</p>
                </div>
                {request.preferredTime && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Waktu Preferensi</p>
                    <p className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {request.preferredTime}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Statistik</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {request.conversionProbability !== null && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Probabilitas Konversi</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">
                      {request.conversionProbability}%
                    </span>
                  </div>
                </div>
              )}
              
              <Separator />
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Dibuat</p>
                <p className="text-sm">
                  {format(new Date(request.createdAt), 'dd MMMM yyyy, HH:mm', { locale: idLocale })}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Terakhir Diupdate</p>
                <p className="text-sm">
                  {format(new Date(request.updatedAt), 'dd MMMM yyyy, HH:mm', { locale: idLocale })}
                </p>
              </div>
              
              {request.assignedAt && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ditugaskan Pada</p>
                  <p className="text-sm">
                    {format(new Date(request.assignedAt), 'dd MMMM yyyy, HH:mm', { locale: idLocale })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related SPPG */}
          {request.demoSppg && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Demo SPPG</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{request.demoSppg.name}</p>
                <p className="text-sm text-muted-foreground">{request.demoSppg.code}</p>
              </CardContent>
            </Card>
          )}
          
          {request.productionSppg && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Production SPPG</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{request.productionSppg.name}</p>
                <Badge variant="default" className="mt-2">Converted</Badge>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <ApproveDialog
        open={dialogs.approve}
        onOpenChange={(open: boolean) => !open && closeDialog('approve')}
        requestId={request.id}
        organizationName={request.organizationName}
      />
      
      <RejectDialog
        open={dialogs.reject}
        onOpenChange={(open: boolean) => !open && closeDialog('reject')}
        requestId={request.id}
        organizationName={request.organizationName}
      />
      
      <AssignDialog
        open={dialogs.assign}
        onOpenChange={(open: boolean) => !open && closeDialog('assign')}
        requestId={request.id}
        organizationName={request.organizationName}
      />
      
      <ConvertDialog
        open={dialogs.convert}
        onOpenChange={(open: boolean) => !open && closeDialog('convert')}
        requestId={request.id}
        organizationName={request.organizationName}
      />
    </div>
  )
}
