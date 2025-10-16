/**
 * @fileoverview Menu Planning List Page - Enterprise Rich UI
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 */

'use client'

import Link from 'next/link'
import { Plus, Download, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MenuPlanList } from '@/features/sppg/menu-planning/components'

export default function MenuPlanningPage() {
  return (
    <div className="flex-1 space-y-4 md:space-y-6">
      {/* Page Header with Actions */}
      <div className="space-y-3 md:space-y-4">
        <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Perencanaan Menu</h1>
            <p className="text-sm text-muted-foreground mt-1 md:mt-2">
              Buat dan kelola rencana menu program gizi
            </p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="default" className="md:size-lg">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Opsi
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Aksi Rencana</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Ekspor Excel
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Ekspor PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button asChild size="default" className="md:size-lg">
              <Link href="/menu-planning/create">
                <Plus className="mr-2 h-4 w-4" />
                Buat Rencana Baru
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Menu Plan List Component */}
      <MenuPlanList />
    </div>
  )
}
