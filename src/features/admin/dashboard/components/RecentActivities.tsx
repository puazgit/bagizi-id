/**
 * @fileoverview Dashboard Recent Activities Component
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { Building2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import type { DemoRequestActivity, ConversionActivity } from '../types'

interface RecentActivitiesProps {
  demoRequests: DemoRequestActivity[]
  conversions: ConversionActivity[]
}

export function RecentActivities({ demoRequests, conversions }: RecentActivitiesProps) {
  // Combine and sort activities by timestamp
  const allActivities = [
    ...demoRequests.map(activity => ({
      ...activity,
      type: 'demo_request' as const,
      timestamp: new Date(activity.timestamp)
    })),
    ...conversions.map(activity => ({
      ...activity,
      type: 'conversion' as const,
      timestamp: activity.timestamp ? new Date(activity.timestamp) : new Date()
    }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'secondary'
      case 'UNDER_REVIEW':
        return 'default'
      case 'APPROVED':
        return 'default'
      case 'DEMO_ACTIVE':
        return 'default'
      case 'CONVERTED':
        return 'default'
      case 'REJECTED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'Diajukan'
      case 'UNDER_REVIEW':
        return 'Ditinjau'
      case 'APPROVED':
        return 'Disetujui'
      case 'DEMO_ACTIVE':
        return 'Demo Aktif'
      case 'CONVERTED':
        return 'Konversi'
      case 'REJECTED':
        return 'Ditolak'
      default:
        return status
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Belum ada aktivitas
            </p>
          ) : (
            allActivities.map((activity) => (
              <Link
                key={activity.id}
                href={`/admin/demo-requests/${activity.id}`}
                className="block group"
              >
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`mt-0.5 rounded-full p-2 ${
                    activity.type === 'conversion' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {activity.type === 'conversion' ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Building2 className="h-4 w-4" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {activity.organizationName}
                      </p>
                      {'status' in activity && (
                        <Badge variant={getStatusBadgeVariant(activity.status)}>
                          {getStatusLabel(activity.status)}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {activity.organizationType} • {activity.targetBeneficiaries} beneficiaries
                    </p>
                    
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.timestamp, { 
                        addSuffix: true,
                        locale: localeId
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
