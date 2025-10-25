/**
 * @fileoverview Regional Data Navigation Tabs
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { MapPin, Building2, Home, Map } from 'lucide-react'

interface RegionalNavProps {
  /**
   * Custom class name
   */
  className?: string
}

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const navItems: NavItem[] = [
  {
    label: 'Provinsi',
    href: '/admin/regional/provinces',
    icon: MapPin,
    description: '34 provinsi di Indonesia'
  },
  {
    label: 'Kabupaten/Kota',
    href: '/admin/regional/regencies',
    icon: Building2,
    description: 'Kabupaten dan Kota'
  },
  {
    label: 'Kecamatan',
    href: '/admin/regional/districts',
    icon: Map,
    description: 'Kecamatan di Indonesia'
  },
  {
    label: 'Desa/Kelurahan',
    href: '/admin/regional/villages',
    icon: Home,
    description: 'Desa dan Kelurahan'
  }
]

/**
 * Regional Navigation Tabs Component
 * 
 * Provides tab-style navigation between different regional data levels
 * 
 * @example
 * ```tsx
 * <RegionalNav />
 * ```
 */
export function RegionalNav({ className }: RegionalNavProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div className={cn('border-b bg-background', className)}>
      <nav className="flex gap-1 overflow-x-auto px-2 py-2" aria-label="Regional data navigation">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all',
                'hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                active
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={active ? 'page' : undefined}
              title={item.description}
            >
              <Icon 
                className={cn(
                  'h-4 w-4 transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )} 
              />
              <span className="whitespace-nowrap">{item.label}</span>
              {active && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  Active
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
