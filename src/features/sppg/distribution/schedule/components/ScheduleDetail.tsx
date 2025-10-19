/**
 * @fileoverview DistributionSchedule Detail View Component
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 */

'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import {
  CalendarDays,
  Users,
  Truck,
  Package,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { Separator } from '@/components/ui/separator'

import { useSchedule, useDeleteSchedule } from '../hooks'

interface ScheduleDetailProps {
  scheduleId: string
}

/**
 * ScheduleDetail Component
 * Comprehensive detail view for distribution schedules
 */
export function ScheduleDetail({ scheduleId }: ScheduleDetailProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data: response, isLoading, error } = useSchedule(scheduleId)
  const { mutate: deleteSchedule, isPending: isDeleting } = useDeleteSchedule()

  const schedule = response?.data

  /**
   * Handle delete schedule
   */
  const handleDelete = () => {
    deleteSchedule(scheduleId, {
      onSuccess: () => {
        router.push('/distribution/schedule')
      },
    })
  }

  /**
   * Calculate total cost
   */
  const totalCost = schedule
    ? (schedule.packagingCost || 0) + (schedule.fuelCost || 0)
    : 0

  /**
   * Get status badge variant
   */
  const getStatusVariant = (
    status: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'COMPLETED':
        return 'default'
      case 'IN_PROGRESS':
        return 'default'
      case 'CONFIRMED':
        return 'secondary'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  /**
   * Get wave label
   */
  const getWaveLabel = (wave: string) => {
    switch (wave) {
      case 'MORNING':
        return 'Pagi (06:00 - 10:00)'
      case 'AFTERNOON':
        return 'Siang (10:00 - 14:00)'
      case 'EVENING':
        return 'Sore (14:00 - 18:00)'
      default:
        return wave
    }
  }

  /**
   * Get delivery method label
   */
  const getDeliveryMethodLabel = (method: string) => {
    switch (method) {
      case 'SCHOOL_DELIVERY':
        return 'Antar ke Sekolah'
      case 'PICKUP':
        return 'Diambil di Lokasi'
      case 'POSYANDU':
        return 'Distribusi Posyandu'
      case 'PKK':
        return 'Distribusi PKK'
      default:
        return method
    }
  }

  /**
   * Loading state
   */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Memuat detail jadwal...</span>
      </div>
    )
  }

  /**
   * Error state
   */
  if (error || !schedule) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Gagal Memuat Data</h3>
            <p className="text-muted-foreground mb-4">
              Terjadi kesalahan saat memuat detail jadwal
            </p>
            <Button onClick={() => router.back()} variant="outline">
              Kembali
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">Detail Jadwal Distribusi</h2>
            <Badge variant={getStatusVariant(schedule.status)}>
              {schedule.status === 'PLANNED' && 'Direncanakan'}
              {schedule.status === 'PREPARED' && 'Disiapkan'}
              {schedule.status === 'IN_PROGRESS' && 'Sedang Berlangsung'}
              {schedule.status === 'COMPLETED' && 'Selesai'}
              {schedule.status === 'CANCELLED' && 'Dibatalkan'}
              {schedule.status === 'DELAYED' && 'Tertunda'}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {format(new Date(schedule.distributionDate), 'EEEE, dd MMMM yyyy', {
              locale: localeId,
            })}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/distribution/schedule/${scheduleId}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Porsi</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedule.totalPortions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              @ {schedule.portionSize}g per porsi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Penerima Manfaat</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schedule.estimatedBeneficiaries.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Estimasi penerima</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kendaraan</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schedule.vehicleAssignments?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Kendaraan ditugaskan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Biaya</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {totalCost.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground">Kemasan + BBM</p>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Informasi Jadwal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gelombang</p>
              <p className="text-base font-medium">{getWaveLabel(schedule.wave)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Metode Pengiriman</p>
              <p className="text-base font-medium">
                {getDeliveryMethodLabel(schedule.deliveryMethod)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Waktu Tempuh (Est.)</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-base font-medium">{schedule.estimatedTravelTime || 0} menit</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Kategori Penerima</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {schedule.targetCategories.map((category) => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Informasi Menu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Nama Menu</p>
            <p className="text-lg font-semibold">{schedule.menuName}</p>
          </div>

          {schedule.menuDescription && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Deskripsi</p>
              <p className="text-base">{schedule.menuDescription}</p>
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Jenis Kemasan</p>
              <p className="text-base font-medium">
                {schedule.packagingType === 'OMPRENG' && 'Ompreng'}
                {schedule.packagingType === 'BOX' && 'Box'}
                {schedule.packagingType === 'CONTAINER' && 'Container'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Biaya Kemasan</p>
              <p className="text-base font-medium">
                Rp {(schedule.packagingCost || 0).toLocaleString('id-ID')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Biaya BBM</p>
              <p className="text-base font-medium">
                Rp {(schedule.fuelCost || 0).toLocaleString('id-ID')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Biaya</p>
              <p className="text-base font-semibold">
                Rp {totalCost.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribution Team */}
      {schedule.distributionTeam && schedule.distributionTeam.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tim Distribusi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {schedule.distributionTeam.map((member, index) => (
                <Badge key={index} variant="outline">
                  {member}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Jadwal Distribusi?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Jadwal distribusi akan dihapus secara permanen
              dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
