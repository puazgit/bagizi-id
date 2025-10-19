/**
 * @fileoverview DeliveryDetail component with comprehensive tabs
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * 
 * @description
 * Detailed delivery view with tabs:
 * - Info: All delivery details, metrics, quality check
 * - Tracking: GPS history with route visualization
 * - Photos: Photo gallery by type
 * - Issues: Issue list with severity levels
 */

'use client'

import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import {
  MapPin,
  Clock,
  Package,
  User,
  Thermometer,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Camera,
  FileText,
  Navigation,
  TrendingUp,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { useDelivery, useDeliveryTracking } from '@/features/sppg/distribution/delivery/hooks'

// ============================================================================
// Types
// ============================================================================

interface DeliveryDetailProps {
  deliveryId: string
}

// ============================================================================
// Status Configuration
// ============================================================================

const STATUS_CONFIG: Record<
  string,
  { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }
> = {
  ASSIGNED: { variant: 'secondary', label: 'Ditugaskan' },
  DEPARTED: { variant: 'default', label: 'Dalam Perjalanan' },
  DELIVERED: { variant: 'outline', label: 'Terkirim' },
  FAILED: { variant: 'destructive', label: 'Gagal' },
}

const SEVERITY_CONFIG: Record<
  string,
  { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }
> = {
  LOW: { variant: 'secondary', label: 'Rendah' },
  MEDIUM: { variant: 'default', label: 'Sedang' },
  HIGH: { variant: 'destructive', label: 'Tinggi' },
  CRITICAL: { variant: 'destructive', label: 'Kritis' },
}

// ============================================================================
// Main Component
// ============================================================================

export function DeliveryDetail({ deliveryId }: DeliveryDetailProps) {
  const { data: deliveryData, isLoading, error } = useDelivery(deliveryId)
  const { data: trackingData } = useDeliveryTracking(deliveryId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Memuat detail pengiriman...</div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Error: {error.message}</AlertDescription>
      </Alert>
    )
  }

  if (!deliveryData?.data) {
    return (
      <Alert>
        <AlertDescription>Data pengiriman tidak ditemukan</AlertDescription>
      </Alert>
    )
  }

  const delivery = deliveryData.data
  const metrics = delivery.metrics
  const statusConfig = STATUS_CONFIG[delivery.status] || STATUS_CONFIG.ASSIGNED

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl">{delivery.targetName}</CardTitle>
              <CardDescription className="mt-1">
                {delivery.targetAddress}
              </CardDescription>
            </div>
            <Badge variant={statusConfig.variant} className="text-base px-4 py-1">
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Status Waktu
            </CardDescription>
            <CardTitle className={metrics.isOnTime ? 'text-green-600' : 'text-destructive'}>
              {metrics.isOnTime ? 'Tepat Waktu' : 'Terlambat'}
            </CardTitle>
            {metrics.delayMinutes > 0 && (
              <p className="text-xs text-muted-foreground">
                Terlambat {metrics.delayMinutes} menit
              </p>
            )}
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Porsi Terkirim
            </CardDescription>
            <CardTitle>{metrics.portionsFulfillment}%</CardTitle>
            <Progress value={metrics.portionsFulfillment} className="h-2" />
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Jarak Tempuh
            </CardDescription>
            <CardTitle>
              {metrics.totalDistance ? `${metrics.totalDistance.toFixed(2)} km` : '-'}
            </CardTitle>
            {metrics.averageSpeed && (
              <p className="text-xs text-muted-foreground">
                Avg: {metrics.averageSpeed.toFixed(0)} km/jam
              </p>
            )}
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Dokumentasi
            </CardDescription>
            <CardTitle>{metrics.photoCount} Foto</CardTitle>
            <p className="text-xs text-muted-foreground">
              {metrics.trackingPointsCount} GPS Points
            </p>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">Informasi</TabsTrigger>
          <TabsTrigger value="tracking">
            Tracking ({trackingData?.data.length || 0})
          </TabsTrigger>
          <TabsTrigger value="photos">
            Foto ({metrics.photoCount})
          </TabsTrigger>
          <TabsTrigger value="issues">
            Masalah ({metrics.unresolvedIssuesCount})
          </TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-4">
          {/* Schedule Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Jadwal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Menu</p>
                  <p className="font-medium">{delivery.schedule.menuName}</p>
                </div>
                {delivery.plannedTime && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Waktu Rencana</p>
                    <p className="font-medium">
                      {format(new Date(delivery.plannedTime), 'dd MMMM yyyy, HH:mm', {
                        locale: localeId,
                      })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detail Pengiriman</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Driver & Vehicle */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Driver
                  </p>
                  <p className="font-medium">{delivery.driverName}</p>
                </div>
                {delivery.vehicleInfo && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Kendaraan</p>
                    <p className="font-medium">{delivery.vehicleInfo}</p>
                  </div>
                )}
              </div>

              {delivery.helperNames && delivery.helperNames.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Helper</p>
                  <p className="font-medium">{delivery.helperNames.join(', ')}</p>
                </div>
              )}

              <Separator />

              {/* Portions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Porsi Rencana
                  </p>
                  <p className="font-medium">{delivery.portionsPlanned} porsi</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Porsi Terkirim</p>
                  <p className="font-medium">{delivery.portionsDelivered} porsi</p>
                </div>
              </div>

              {/* Timing */}
              {delivery.departureTime && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Waktu Berangkat</p>
                      <p className="font-medium">
                        {format(new Date(delivery.departureTime), 'HH:mm', {
                          locale: localeId,
                        })}
                      </p>
                    </div>
                    {delivery.arrivalTime && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Waktu Tiba</p>
                        <p className="font-medium">
                          {format(new Date(delivery.arrivalTime), 'HH:mm', {
                            locale: localeId,
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {metrics.totalDuration && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Durasi Total
                  </p>
                  <p className="font-medium">{metrics.totalDuration} menit</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quality Check */}
          {delivery.foodQualityChecked && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Quality Check
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      Suhu Makanan
                    </p>
                    {delivery.foodTemperature ? (
                      <p className="font-medium">
                        {delivery.foodTemperature.toString()}°C
                        {metrics.temperatureInRange ? (
                          <CheckCircle2 className="inline ml-2 h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="inline ml-2 h-4 w-4 text-destructive" />
                        )}
                      </p>
                    ) : (
                      <p className="text-muted-foreground">-</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status Kualitas</p>
                    <Badge variant={metrics.qualityCheckPassed ? 'outline' : 'destructive'}>
                      {metrics.qualityCheckPassed ? 'Lolos' : 'Tidak Lolos'}
                    </Badge>
                  </div>
                </div>

                {delivery.foodQualityNotes && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Catatan</p>
                    <p className="text-sm">{delivery.foodQualityNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recipient Info */}
          {delivery.recipientName && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informasi Penerima</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Nama Penerima</p>
                    <p className="font-medium">{delivery.recipientName}</p>
                  </div>
                  {delivery.recipientTitle && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Jabatan</p>
                      <p className="font-medium">{delivery.recipientTitle}</p>
                    </div>
                  )}
                </div>

                {delivery.deliveryCompletedAt && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Waktu Selesai</p>
                    <p className="font-medium">
                      {format(new Date(delivery.deliveryCompletedAt), 'dd MMMM yyyy, HH:mm', {
                        locale: localeId,
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {(delivery.notes || delivery.deliveryNotes) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Catatan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {delivery.notes && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Catatan Umum</p>
                    <p className="text-sm">{delivery.notes}</p>
                  </div>
                )}
                {delivery.deliveryNotes && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Catatan Pengiriman</p>
                    <p className="text-sm">{delivery.deliveryNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tracking Tab */}
        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Riwayat Tracking GPS</CardTitle>
              {trackingData?.statistics && (
                <CardDescription>
                  Total {trackingData.statistics.totalPoints} titik tracking • Jarak:{' '}
                  {trackingData.statistics.totalDistance} km
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {trackingData?.data && trackingData.data.length > 0 ? (
                <div className="space-y-3">
                  {trackingData.data.map((point) => (
                    <div
                      key={point.id}
                      className="flex items-start gap-3 pb-3 border-b last:border-0"
                    >
                      <div className="shrink-0">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm">
                            {point.latitude.toString()}, {point.longitude.toString()}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {point.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(point.recordedAt), 'dd MMM yyyy, HH:mm:ss', {
                            locale: localeId,
                          })}
                        </p>
                        {point.accuracy && (
                          <p className="text-xs text-muted-foreground">
                            Akurasi: {point.accuracy.toString()}m
                          </p>
                        )}
                        {point.notes && (
                          <p className="text-sm mt-1">{point.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Belum ada data tracking GPS
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Galeri Foto</CardTitle>
            </CardHeader>
            <CardContent>
              {delivery.photos && delivery.photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {delivery.photos.map((photo) => (
                    <div key={photo.id} className="space-y-2">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.photoUrl}
                          alt={photo.caption || 'Delivery photo'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <Badge variant="secondary" className="text-xs">
                          {photo.photoType}
                        </Badge>
                        {photo.caption && (
                          <p className="text-xs text-muted-foreground">{photo.caption}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(photo.takenAt), 'dd MMM, HH:mm', {
                            locale: localeId,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Belum ada foto pengiriman
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daftar Masalah</CardTitle>
            </CardHeader>
            <CardContent>
              {delivery.issues && delivery.issues.length > 0 ? (
                <div className="space-y-3">
                  {delivery.issues.map((issue) => {
                    const severityConfig =
                      SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.LOW
                    return (
                      <div
                        key={issue.id}
                        className="flex items-start gap-3 pb-3 border-b last:border-0"
                      >
                        <div className="shrink-0">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {issue.issueType}
                            </Badge>
                            <Badge variant={severityConfig.variant} className="text-xs">
                              {severityConfig.label}
                            </Badge>
                          </div>
                          <p className="text-sm">{issue.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(issue.reportedAt), 'dd MMM yyyy, HH:mm', {
                              locale: localeId,
                            })}
                          </p>
                          {issue.resolvedAt && (
                            <div className="flex items-center gap-2 text-xs text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              Resolved:{' '}
                              {format(new Date(issue.resolvedAt), 'dd MMM, HH:mm', {
                                locale: localeId,
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Tidak ada masalah yang dilaporkan
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
