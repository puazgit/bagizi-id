/**
 * SPPG System Tab Component
 * Displays system metadata and audit information
 * 
 * @component
 * @example
 * <SppgSystemTab sppg={sppg} />
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'
import type { SppgDetail } from '@/features/admin/sppg-management/types'

interface SppgSystemTabProps {
  sppg: SppgDetail
}

export function SppgSystemTab({ sppg }: SppgSystemTabProps) {
  // Format date with time
  const formatDateTime = (date?: Date | string | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="grid gap-6">
      {/* Audit Trail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Tanggal Dibuat</div>
              <div className="font-medium">{formatDateTime(sppg.createdAt)}</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Terakhir Diperbarui</div>
              <div className="font-medium">{formatDateTime(sppg.updatedAt)}</div>
            </div>
          </div>

          {/* Calculate age */}
          {sppg.createdAt && (
            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground mb-1">Usia Data</div>
              <div className="font-medium">
                {(() => {
                  const now = new Date()
                  const created = new Date(sppg.createdAt)
                  const diffTime = Math.abs(now.getTime() - created.getTime())
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                  
                  if (diffDays < 30) {
                    return `${diffDays} hari`
                  } else if (diffDays < 365) {
                    const months = Math.floor(diffDays / 30)
                    return `${months} bulan`
                  } else {
                    const years = Math.floor(diffDays / 365)
                    const months = Math.floor((diffDays % 365) / 30)
                    return `${years} tahun ${months} bulan`
                  }
                })()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
