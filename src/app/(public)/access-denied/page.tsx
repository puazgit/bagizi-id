/**
 * @fileoverview Access denied page for SPPG users
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Ban, Home, ArrowLeft, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

function AccessDeniedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()

  const error = searchParams.get('error')
  const from = searchParams.get('from')

  const getErrorMessage = () => {
    switch (error) {
      case 'no-sppg':
        return 'Akun Anda tidak terhubung dengan SPPG manapun.'
      case 'access-denied':
        return 'Anda tidak memiliki izin untuk mengakses halaman ini.'
      case 'role-mismatch':
        return 'Role Anda tidak sesuai untuk mengakses halaman ini.'
      case 'subscription-expired':
        return 'Langganan SPPG Anda telah berakhir.'
      default:
        return 'Akses ditolak. Silakan hubungi administrator SPPG Anda.'
    }
  }

  const handleContactAdmin = () => {
    // Redirect ke halaman contact atau help
    router.push('/help')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <Ban className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Akses Ditolak</CardTitle>
          <CardDescription className="text-base">
            {getErrorMessage()}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Session Info */}
          {session?.user && (
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertTitle>Informasi Akun Anda</AlertTitle>
              <AlertDescription className="mt-2 space-y-1">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{session.user.email}</span>
                  
                  <span className="text-muted-foreground">Role:</span>
                  <span className="font-medium">{session.user.userRole || 'N/A'}</span>
                  
                  {session.user.sppgId && (
                    <>
                      <span className="text-muted-foreground">SPPG ID:</span>
                      <span className="font-medium font-mono text-xs">
                        {session.user.sppgId}
                      </span>
                    </>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Attempted Access Info */}
          {from && (
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <p className="text-sm font-medium">Halaman yang Anda coba akses:</p>
              <code className="text-sm bg-background px-3 py-1.5 rounded border block">
                {from}
              </code>
            </div>
          )}

          {/* Common Reasons */}
          <div className="p-4 rounded-lg bg-muted/50 space-y-3">
            <p className="text-sm font-medium">Kemungkinan Penyebab:</p>
            <ul className="text-sm space-y-2 ml-4 list-disc text-muted-foreground">
              <li>Akun Anda belum terhubung dengan SPPG</li>
              <li>Role Anda tidak memiliki izin untuk halaman ini</li>
              <li>Langganan SPPG belum aktif atau sudah berakhir</li>
              <li>Administrator SPPG belum memberikan akses</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={() => router.push('/')}
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Button>

            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </div>

          {/* Contact Admin */}
          <div className="pt-4 border-t">
            <p className="text-sm text-center text-muted-foreground mb-3">
              Butuh bantuan? Hubungi administrator SPPG Anda
            </p>
            <Button
              variant="secondary"
              onClick={handleContactAdmin}
              className="w-full"
            >
              Hubungi Administrator
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AccessDeniedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Ban className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <AccessDeniedContent />
    </Suspense>
  )
}
