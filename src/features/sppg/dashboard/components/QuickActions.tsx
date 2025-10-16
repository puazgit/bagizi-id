/**
 * @fileoverview Quick Actions Component - Dashboard action buttons
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ChefHat, 
  Package, 
  Truck, 
  TrendingUp 
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface QuickActionsProps {
  className?: string
}

const quickActions = [
  {
    title: 'Kelola Menu',
    href: '/menu',
    icon: ChefHat,
    description: 'Buat dan kelola menu harian',
    resource: 'menu'
  },
  {
    title: 'Procurement',
    href: '/procurement', 
    icon: Package,
    description: 'Kelola pengadaan bahan baku',
    resource: 'procurement'
  },
  {
    title: 'Distribusi',
    href: '/distribution',
    icon: Truck,
    description: 'Monitor distribusi makanan',
    resource: 'distribution'
  },
  {
    title: 'Laporan',
    href: '/reports',
    icon: TrendingUp,
    description: 'Lihat laporan dan analitik',
    resource: 'reports'
  }
]

export function QuickActions({ className }: QuickActionsProps) {
  const { canAccess } = useAuth()

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg">Quick Actions</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Aksi cepat untuk operasional SPPG harian
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          {quickActions.map((action) => {
            const IconComponent = action.icon
            
            // Check if user has access to this resource
            if (action.resource && !canAccess(action.resource)) {
              return null
            }

            return (
              <Button 
                key={action.href}
                asChild 
                variant="outline" 
                className="justify-start h-auto p-2 md:p-3"
              >
                <Link href={action.href} className="flex flex-col items-start gap-1 md:gap-2">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="text-xs md:text-sm font-medium">{action.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground text-left">
                    {action.description}
                  </span>
                </Link>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}