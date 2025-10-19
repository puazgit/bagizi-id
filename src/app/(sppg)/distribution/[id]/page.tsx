/**
 * @fileoverview Distribution Detail Page
 * @route /distribution/[id]
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * 
 * View distribution details, status, and timeline
 */

'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { 
  useDistribution, 
} from '@/features/sppg/distribution/hooks'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Calendar,
  MapPin,
  Users,
  Package,
  Truck,
  Clock,
  Edit,
  Loader2,
  ArrowLeft,
  Thermometer,
  Cloud,
} from 'lucide-react'
import { format } from 'date-fns'
import { safeFormatDate } from '@/features/sppg/distribution/lib/dateUtils'

interface DistributionDetailPageProps {
  params: Promise<{ id: string }>
}

interface TimelineEvent {
  id: string
  event?: string
  description?: string
  timestamp: string
  userName?: string
  user?: {
    name: string
  }
}

interface DistributionDetail {
  id: string
  distributionCode: string
  executionDate: string
  distributionDate?: string
  mealType: string
  status: string
  distributionPoint?: string
  targetLocation?: string
  totalPortions: number
  portionsDelivered?: number
  actualRecipients?: number
  plannedRecipients?: number
  distributionMethod?: string
  vehicleType?: string
  vehiclePlate?: string
  transportCost?: number
  fuelCost?: number
  otherCosts?: number
  departureTemp?: number
  arrivalTemp?: number
  weatherCondition?: string
  program?: {
    id: string
    name: string
  }
  school?: {
    schoolName: string
    schoolAddress: string
  }
  distributor?: {
    name: string
    email: string
  }
  driver?: {
    name: string
    phone?: string
  }
  issues?: unknown[]
  vehicleAssignments?: unknown[]
  distribution_deliveries?: unknown[]
  schedule?: unknown
}

export default function DistributionDetailPage({ params }: DistributionDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()

  const { data, isLoading, error } = useDistribution(id)
  const distribution = data as DistributionDetail | undefined

  const timeline = [] as TimelineEvent[] // Timeline not in API yet

  const handleEdit = () => {
    router.push(`/distribution/${id}/edit`)
  }

  // Calculate progress
  const getProgress = () => {
    if (!distribution) return 0
    const statusProgress: Record<string, number> = {
      SCHEDULED: 0,
      PREPARING: 25,
      IN_TRANSIT: 50,
      DISTRIBUTING: 75,
      COMPLETED: 100,
      CANCELLED: 0,
    }
    return statusProgress[distribution.status] || 0
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !distribution) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error Memuat Distribusi</CardTitle>
          <CardDescription>{error?.message || 'Distribusi tidak ditemukan'}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const canEdit = ['SCHEDULED', 'PREPARING'].includes(distribution.status)

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dasbor</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/distribution">Distribusi</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{distribution.distributionCode}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="sm" onClick={() => router.push('/distribution')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <Badge variant={
              distribution.status === 'COMPLETED' ? 'default' :
              distribution.status === 'CANCELLED' ? 'destructive' :
              'secondary'
            }>
              {distribution.status}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{distribution.distributionCode}</h1>
          <p className="text-muted-foreground mt-2">
            {distribution.program?.name || 'Tanpa Program'} • {distribution.distributionPoint}
          </p>
        </div>

        <div className="flex gap-2">
          {canEdit && (
            <Button onClick={handleEdit} variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Status Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Status</CardTitle>
          <CardDescription>
            Status distribusi saat ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Status Saat Ini</p>
              <Badge className="mt-2" variant={
                distribution.status === 'COMPLETED' ? 'default' :
                distribution.status === 'CANCELLED' ? 'destructive' :
                'secondary'
              }>
                {distribution.status}
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push(`/distribution/${distribution.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {distribution.status !== 'CANCELLED' && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Kemajuan</span>
                <span className="font-medium">{getProgress()}%</span>
              </div>
              <Progress value={getProgress()} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Distribution Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detail Distribusi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Tanggal Distribusi:</span>
                <span className="ml-auto font-medium">
                  {safeFormatDate(distribution.distributionDate, 'dd MMM yyyy')}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Location:</span>
                <span className="ml-auto font-medium">{distribution.distributionPoint}</span>
              </div>

              <div className="flex items-center text-sm">
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Recipients:</span>
                <span className="ml-auto font-medium">
                  {distribution.actualRecipients || distribution.plannedRecipients || 0}
                </span>
              </div>

              {distribution.distributionMethod && (
                <div className="flex items-center text-sm">
                  <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Method:</span>
                  <span className="ml-auto font-medium capitalize">
                    {distribution.distributionMethod.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
              )}

              {distribution.vehicleType && (
                <div className="flex items-center text-sm">
                  <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Kendaraan:</span>
                  <span className="ml-auto font-medium">
                    {distribution.vehicleType} {distribution.vehiclePlate && `(${distribution.vehiclePlate})`}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Staff & Logistics */}
        <Card>
          <CardHeader>
            <CardTitle>Staff & Logistik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {distribution.distributor && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Distributor</p>
                <p className="font-medium">{distribution.distributor.name}</p>
                <p className="text-sm text-muted-foreground">{distribution.distributor.email}</p>
              </div>
            )}

            {distribution.driver && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Driver</p>
                <p className="font-medium">{distribution.driver.name}</p>
                {distribution.driver.phone && (
                  <p className="text-sm text-muted-foreground">{distribution.driver.phone}</p>
                )}
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Transport</p>
                <p className="font-medium">
                  {distribution.transportCost ? `Rp ${distribution.transportCost.toLocaleString()}` : '-'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Fuel</p>
                <p className="font-medium">
                  {distribution.fuelCost ? `Rp ${distribution.fuelCost.toLocaleString()}` : '-'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Other</p>
                <p className="font-medium">
                  {distribution.otherCosts ? `Rp ${distribution.otherCosts.toLocaleString()}` : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environmental Conditions */}
        {(distribution.departureTemp || distribution.weatherCondition) && (
          <Card>
            <CardHeader>
              <CardTitle>Kondisi Lingkungan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {distribution.departureTemp && (
                <div className="flex items-center text-sm">
                  <Thermometer className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Suhu Keberangkatan:</span>
                  <span className="ml-auto font-medium">{distribution.departureTemp}°C</span>
                </div>
              )}

              {distribution.arrivalTemp && (
                <div className="flex items-center text-sm">
                  <Thermometer className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Suhu Kedatangan:</span>
                  <span className="ml-auto font-medium">{distribution.arrivalTemp}°C</span>
                </div>
              )}

              {distribution.weatherCondition && (
                <div className="flex items-center text-sm">
                  <Cloud className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Cuaca:</span>
                  <span className="ml-auto font-medium capitalize">{distribution.weatherCondition}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Aktivitas</CardTitle>
          <CardDescription>Kronologi peristiwa distribusi</CardDescription>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Belum ada aktivitas yang tercatat
            </p>
          ) : (
            <div className="space-y-4">
              {timeline.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-primary p-2">
                      <Clock className="h-3 w-3 text-primary-foreground" />
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="w-px h-full bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium">
                      {event.event?.replace(/_/g, ' ') || event.description || 'Unknown event'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.userName || 'System'} • {format(new Date(event.timestamp), 'dd MMM yyyy HH:mm')}
                    </p>
                    {event.description && event.description !== event.event && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
