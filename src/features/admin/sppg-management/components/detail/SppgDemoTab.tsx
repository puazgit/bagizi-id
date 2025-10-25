/**
 * SPPG Demo Tab Component
 * Displays demo account settings and limitations
 * Only shown for demo accounts (isDemoAccount = true)
 * 
 * @component
 * @example
 * <SppgDemoTab sppg={sppg} />
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, Users, CheckCircle2, ExternalLink, AlertTriangle, Clock } from 'lucide-react'
import type { SppgDetail } from '@/features/admin/sppg-management/types'

interface SppgDemoTabProps {
  sppg: SppgDetail
}

export function SppgDemoTab({ sppg }: SppgDemoTabProps) {
  // Format date
  const formatDate = (date?: Date | string | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Calculate remaining days
  const getRemainingDays = () => {
    if (!sppg.demoExpiresAt) return null
    
    const now = new Date()
    const expiryDate = new Date(sppg.demoExpiresAt)
    const diffTime = expiryDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  const remainingDays = getRemainingDays()
  const isExpiringSoon = remainingDays !== null && remainingDays <= 7
  const isExpired = remainingDays !== null && remainingDays < 0

  return (
    <div className="grid gap-6">
      {/* Demo Status Alert */}
      <Alert variant={isExpired ? 'destructive' : isExpiringSoon ? 'default' : 'default'}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {isExpired ? (
            <span className="font-medium">Akun demo telah berakhir</span>
          ) : isExpiringSoon ? (
            <span>
              Akun demo akan berakhir dalam{' '}
              <span className="font-semibold">{remainingDays} hari</span>
            </span>
          ) : (
            <span>Ini adalah akun demo dengan fitur terbatas untuk evaluasi platform</span>
          )}
        </AlertDescription>
      </Alert>

      {/* Demo Period */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Periode Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sppg.demoStartedAt && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Tanggal Mulai</div>
                <div className="font-medium">{formatDate(sppg.demoStartedAt)}</div>
              </div>
            )}

            {sppg.demoExpiresAt && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Tanggal Berakhir</div>
                <div className={`font-medium ${isExpiringSoon ? 'text-orange-600 dark:text-orange-400' : ''}`}>
                  {formatDate(sppg.demoExpiresAt)}
                </div>
              </div>
            )}
          </div>

          {remainingDays !== null && !isExpired && (
            <div className="pt-2 border-t">
              <div className="flex items-center gap-3">
                <Clock className={`h-5 w-5 ${isExpiringSoon ? 'text-orange-500' : 'text-muted-foreground'}`} />
                <div>
                  <div className="text-sm text-muted-foreground">Sisa Waktu Demo</div>
                  <div className={`text-xl font-bold ${isExpiringSoon ? 'text-orange-600' : ''}`}>
                    {remainingDays} hari
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo Limitations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Batasan Akun Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Maksimal Penerima Manfaat</div>
            <div className="text-2xl font-bold">
              {sppg.demoMaxBeneficiaries?.toLocaleString('id-ID') || 'Tidak Terbatas'}
            </div>
          </div>

          {sppg.demoParentId && (
            <div className="space-y-2 pt-2 border-t">
              <div className="text-sm text-muted-foreground">Demo Parent ID</div>
              <div className="font-mono text-sm bg-muted px-3 py-2 rounded">
                {sppg.demoParentId}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allowed Features */}
      {sppg.demoAllowedFeatures && sppg.demoAllowedFeatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Fitur yang Tersedia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {sppg.demoAllowedFeatures.map((feature) => (
                <Badge key={feature} variant="secondary">
                  {feature.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Hanya fitur yang ditandai di atas yang dapat digunakan dalam akun demo ini.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Notice */}
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <ExternalLink className="h-5 w-5" />
            Upgrade ke Akun Penuh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Untuk mendapatkan akses penuh ke semua fitur tanpa batasan, upgrade akun demo
            Anda menjadi akun berlangganan.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground mb-4">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Akses ke semua fitur platform
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Tanpa batasan jumlah penerima manfaat
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Dukungan teknis prioritas
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Penyimpanan data jangka panjang
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
