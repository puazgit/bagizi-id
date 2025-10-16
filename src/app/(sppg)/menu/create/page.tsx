/**
 * @fileoverview Create Menu Page
 * @version Next.js 15.5.4
 */

'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MenuForm } from '@/features/sppg/menu/components/MenuForm'
import type { Menu } from '@/features/sppg/menu/types'

export default function CreateMenuPage() {
  const router = useRouter()

  const handleSuccess = (menu: Menu) => {
    router.push(`/menu/${menu.id}`)
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="flex-1 space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/menu">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buat Menu Baru</h1>
          <p className="text-muted-foreground mt-2">
            Tambahkan menu makanan baru untuk program gizi
          </p>
        </div>
      </div>

      {/* Menu Form */}
      <MenuForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}
