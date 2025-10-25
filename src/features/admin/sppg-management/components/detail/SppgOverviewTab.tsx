/**
 * SPPG Overview Tab Component
 * Displays key metrics and quick information
 * 
 * @component
 * @example
 * <SppgOverviewTab sppg={sppg} />
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getSppgStatusConfig, getOrganizationTypeLabel } from '@/features/admin/sppg-management/lib'
import { Building2, Users, DollarSign, Calendar, MapPin, Clock } from 'lucide-react'
import type { SppgDetail } from '@/features/admin/sppg-management/types'

interface SppgOverviewTabProps {
  sppg: SppgDetail
}

export function SppgOverviewTab({ sppg }: SppgOverviewTabProps) {
  const statusConfig = getSppgStatusConfig(sppg.status)
  
  // Format currency
  const formatCurrency = (amount?: number | null) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: sppg.budgetCurrency || 'IDR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Format date
  const formatDate = (date?: Date | string | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="grid gap-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-2">Status</div>
                <Badge 
                  variant={
                    statusConfig.variant === 'default' ? 'default' :
                    statusConfig.variant === 'secondary' ? 'secondary' :
                    statusConfig.variant === 'destructive' ? 'destructive' :
                    statusConfig.variant === 'outline' ? 'outline' :
                    'default'
                  }
                  className={statusConfig.className}
                >
                  {statusConfig.label}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Type */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Jenis Organisasi</div>
                <div className="text-lg font-semibold mt-1">
                  {getOrganizationTypeLabel(sppg.organizationType)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Target Recipients */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Target Penerima</div>
                <div className="text-2xl font-bold mt-1">
                  {sppg.targetRecipients.toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Budget */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Budget Bulanan</div>
                <div className="text-lg font-semibold mt-1">
                  {formatCurrency(sppg.monthlyBudget)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {sppg.description && (
        <Card>
          <CardHeader>
            <CardTitle>Deskripsi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{sppg.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Operational Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Operasional</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-1">Tanggal Mulai Operasi</div>
              <div className="font-medium">{formatDate(sppg.operationStartDate)}</div>
            </div>
          </div>

          {sppg.operationEndDate && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Tanggal Berakhir Operasi</div>
                <div className="font-medium">{formatDate(sppg.operationEndDate)}</div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-1">Radius Maksimal</div>
              <div className="font-medium">{sppg.maxRadius} km</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-1">Waktu Tempuh Maksimal</div>
              <div className="font-medium">{sppg.maxTravelTime} menit</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
