/**
 * @fileoverview Unauthorized access page for admin routes
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AlertCircle, Home, ArrowLeft, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

function UnauthorizedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()

  const error = searchParams.get('error')
  const from = searchParams.get('from')

  const getErrorMessage = () => {
    switch (error) {
      case 'unauthorized':
        return 'Anda tidak memiliki izin untuk mengakses halaman admin.'
      case 'read-only':
        return 'Sebagai Analyst, Anda hanya memiliki akses read-only.'
      case 'restricted':
        return 'Rute ini terbatas hanya untuk Super Admin.'
      case 'access-denied':
        return 'Akses ditolak. Anda tidak memiliki role yang sesuai.'
      default:
        return 'Anda tidak memiliki izin untuk mengakses halaman ini.'
    }
  }

  const getRecommendedAction = () => {
    const userRole = session?.user?.userRole

    if (userRole?.startsWith('SPPG_')) {
      return {
        text: 'Kembali ke Dashboard SPPG',
        path: '/dashboard',
      }
    }

    if (userRole === 'PLATFORM_ANALYST') {
      return {
        text: 'Kembali ke Dashboard Admin',
        path: '/admin',
      }
    }

    return {
      text: 'Kembali ke Halaman Utama',
      path: '/',
    }
  }

  const action = getRecommendedAction()

  const handleContactSupport = () => {
    // Bisa redirect ke halaman support atau buka email
    window.location.href = 'mailto:support@bagizi.id?subject=Request Admin Access'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <ShieldAlert className="h-8 w-8 text-destructive" />
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
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Informasi Akun Anda</AlertTitle>
              <AlertDescription className="mt-2 space-y-1">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{session.user.email}</span>
                  
                  <span className="text-muted-foreground">Role:</span>
                  <span className="font-medium">{session.user.userRole || 'N/A'}</span>
                  
                  {session.user.userType && (
                    <>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{session.user.userType}</span>
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

          {/* Role Requirements */}
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <p className="text-sm font-medium">Role yang Dibutuhkan untuk Akses Admin:</p>
            <ul className="text-sm space-y-1 ml-4 list-disc text-muted-foreground">
              <li>PLATFORM_SUPERADMIN (Akses penuh)</li>
              <li>PLATFORM_SUPPORT (Akses terbatas)</li>
              <li>PLATFORM_ANALYST (Read-only)</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={() => router.push(action.path)}
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              {action.text}
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

          {/* Contact Support */}
          <div className="pt-4 border-t">
            <p className="text-sm text-center text-muted-foreground mb-3">
              Butuh akses admin? Hubungi tim support kami
            </p>
            <Button
              variant="secondary"
              onClick={handleContactSupport}
              className="w-full"
            >
              Hubungi Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <UnauthorizedContent />
    </Suspense>
  )
}
