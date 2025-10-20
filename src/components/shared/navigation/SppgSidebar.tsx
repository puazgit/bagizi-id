/**
 * @fileoverview SPPG Sidebar Navigation dengan menu lengkap SPPG operations
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Building2,
  LayoutDashboard,
  ChefHat,
  Calendar,
  ShoppingCart,
  Factory,
  Truck,
  Package,
  Users,
  FileText,
  Settings,
  ChevronUp,
  LogOut,
  UserCog,
  Briefcase,
  School,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

interface SppgSidebarProps {
  className?: string
  onClose?: () => void
}

interface NavigationItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | null
  resource?: string
}

interface NavigationGroup {
  title: string
  items: NavigationItem[]
}

// SPPG Navigation Items sesuai copilot instructions
const sppgNavigation: NavigationGroup[] = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        badge: null
      }
    ]
  },
  {
    title: 'Program Management',
    items: [
      {
        title: 'Program',
        href: '/program',
        icon: Briefcase,
        badge: null,
        resource: 'program'
      },
      {
        title: 'School',
        href: '/school',
        icon: School,
        badge: null,
        resource: 'school'
      }
    ]
  },
  {
    title: 'Operations',
    items: [
      {
        title: 'Menu Management',
        href: '/menu',
        icon: ChefHat,
        badge: null,
        resource: 'menu'
      },
      {
        title: 'Menu Planning',
        href: '/menu-planning',
        icon: Calendar,
        badge: null,
        resource: 'menu-planning'
      },
      {
        title: 'Procurement',
        href: '/procurement',
        icon: ShoppingCart,
        badge: '3', // Pending orders
        resource: 'procurement'
      },
      {
        title: 'Production',
        href: '/production',
        icon: Factory,
        badge: null,
        resource: 'production'
      },
      {
        title: 'Distribution',
        href: '/distribution',
        icon: Truck,
        badge: null,
        resource: 'distribution'
      }
    ]
  },
  {
    title: 'Management',
    items: [
      {
        title: 'Inventory',
        href: '/inventory',
        icon: Package,
        badge: null,
        resource: 'inventory'
      },
      {
        title: 'HRD',
        href: '/hrd',
        icon: Users,
        badge: null,
        resource: 'hrd'
      },
      {
        title: 'Reports',
        href: '/reports',
        icon: FileText,
        badge: null,
        resource: 'reports'
      }
    ]
  },
  {
    title: 'Settings',
    items: [
      {
        title: 'SPPG Settings',
        href: '/settings',
        icon: Settings,
        badge: null,
        resource: 'settings'
      }
    ]
  }
]

export function SppgSidebar({ className, onClose }: SppgSidebarProps) {
  const pathname = usePathname()
  const { user, canAccess, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <Sidebar collapsible="icon" className={cn(className)}>
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">SPPG Dashboard</span>
                  <span className="text-xs text-muted-foreground">
                    {user?.email || 'SPPG Purwakarta'}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        {sppgNavigation.map((group, index) => (
          <React.Fragment key={group.title}>
            <SidebarGroup>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    // Check resource access permissions
                    if (item.resource && !canAccess(item.resource)) {
                      return null
                    }

                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link href={item.href} onClick={onClose}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                        {item.badge && (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            {/* Add separator between groups, except after last group */}
            {index < sppgNavigation.length - 1 && <SidebarSeparator />}
          </React.Fragment>
        ))}
      </SidebarContent>

      {/* Footer with User Dropdown */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.avatar || ''} alt={user?.name || ''} />
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                      {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.name || 'User'}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email || 'user@sppg.id'}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <UserCog className="mr-2 size-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 size-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      {/* Sidebar Rail for better hover/toggle UX */}
      <SidebarRail />
    </Sidebar>
  )
}