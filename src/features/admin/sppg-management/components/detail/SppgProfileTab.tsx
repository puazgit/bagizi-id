/**
 * SPPG Profile Tab Component
 * Displays organization profile details
 * 
 * @component
 * @example
 * <SppgProfileTab sppg={sppg} />
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Hash } from 'lucide-react'
import type { SppgDetail } from '@/features/admin/sppg-management/types'

interface SppgProfileTabProps {
  sppg: SppgDetail
}

export function SppgProfileTab({ sppg }: SppgProfileTabProps) {
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

      {/* Demo Account Info */}
      {sppg.isDemoAccount && (
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-orange-600" />
              Akun Demo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                <Badge variant="outline" className="border-orange-600 text-orange-600">
                  DEMO
                </Badge>
                <span>Ini adalah akun demo dengan fitur terbatas</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {sppg.demoStartedAt && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Mulai Demo</div>
                    <div className="font-medium">{formatDate(sppg.demoStartedAt)}</div>
                  </div>
                )}
                
                {sppg.demoExpiresAt && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Berakhir Demo</div>
                    <div className="font-medium">{formatDate(sppg.demoExpiresAt)}</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
