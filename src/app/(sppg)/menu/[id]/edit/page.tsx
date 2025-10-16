/**
 * @fileoverview Edit Menu Page
 * @version Next.js 15.5.4
 */

'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

import { MenuForm } from '@/features/sppg/menu/components/MenuForm'
import { useMenu } from '@/features/sppg/menu/hooks'
import type { Menu } from '@/features/sppg/menu/types'

interface EditMenuPageProps {
  params: Promise<{ id: string }>
}

function EditMenuSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function EditMenuPage({ params }: EditMenuPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  
  const { data: menu, isLoading, error } = useMenu(resolvedParams.id)

  const handleSuccess = (updatedMenu: Menu) => {
    router.push(`/menu/${updatedMenu.id}`)
  }

  const handleCancel = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 md:space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <Skeleton className="h-9 w-[200px]" />
            <Skeleton className="h-4 w-[300px] mt-2" />
          </div>
        </div>
        <EditMenuSkeleton />
      </div>
    )
  }

  if (error || !menu) {
    return (
      <div className="flex-1 space-y-4 md:space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {(error as Error)?.message || 'Menu tidak ditemukan'}
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/menu">
              Kembali ke Daftar Menu
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/menu/${menu.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Menu</h1>
          <p className="text-muted-foreground mt-2">
            Perbarui informasi menu: {menu.menuName}
          </p>
        </div>
      </div>

      {/* Menu Form */}
      <MenuForm
        menu={menu}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}
