/**
 * @fileoverview Admin Platform Sidebar Navigation
 * Enterprise-grade navigation for Platform Admin management
 * 
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard,
  Building2,
  Users,
  MapPin,
  Settings,
  BarChart3,
  FileText,
  CreditCard,
  Bell,
  Shield,
  Database,
  Activity,
  HelpCircle,
  ChevronUp,
  LogOut,
  UserCog,
  Presentation,
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
import { Badge } from '@/components/ui/badge'
import { 
  useSppgPermissions,
  useUserPermissions,
  useDemoRequestPermissions,
  useBillingPermissions,
  useSettingsPermissions,
  useAnalyticsPermissions,
  useRegionalPermissions,
} from '@/hooks/usePermissions'

interface AdminSidebarProps {
  className?: string
  onClose?: () => void
}

interface NavigationItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number | null
  description?: string
}

interface NavigationGroup {
  title: string
  items: NavigationItem[]
}

/**
 * Get navigation items based on user permissions
 * Different menu items shown for SUPERADMIN, SUPPORT, and ANALYST roles
 */
function getAdminNavigation(permissions: {
  sppg: ReturnType<typeof useSppgPermissions>
  user: ReturnType<typeof useUserPermissions>
  demoRequest: ReturnType<typeof useDemoRequestPermissions>
  billing: ReturnType<typeof useBillingPermissions>
  settings: ReturnType<typeof useSettingsPermissions>
  analytics: ReturnType<typeof useAnalyticsPermissions>
  regional: ReturnType<typeof useRegionalPermissions>
}): NavigationGroup[] {
  const navigation: NavigationGroup[] = []

  // Overview - Available to all admin roles
  navigation.push({
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
        description: 'Platform overview & statistics'
      }
    ]
  })

  // Core Management - Conditional items based on permissions
  const coreManagementItems: NavigationItem[] = []
  
  if (permissions.sppg.canView) {
    coreManagementItems.push({
      title: 'SPPG Management',
      href: '/admin/sppg',
      icon: Building2,
      description: 'Manage all SPPG tenants'
    })
  }
  
  if (permissions.user.canView) {
    coreManagementItems.push({
      title: 'User Management',
      href: '/admin/users',
      icon: Users,
      description: 'Manage platform users'
    })
  }
  
  if (permissions.demoRequest.canView) {
    coreManagementItems.push({
      title: 'Demo Requests',
      href: '/admin/demo-requests',
      icon: Presentation,
      description: 'Manage demo requests from prospects'
    })
  }
  
  if (permissions.regional.canManage) {
    coreManagementItems.push({
      title: 'Regional Data',
      href: '/admin/regional',
      icon: MapPin,
      description: 'Province, regency, district, village'
    })
  }

  if (coreManagementItems.length > 0) {
    navigation.push({
      title: 'Core Management',
      items: coreManagementItems
    })
  }

  // Financial - Only show if user has billing permissions
  const financialItems: NavigationItem[] = []
  
  if (permissions.billing.canViewSubscription) {
    financialItems.push({
      title: 'Subscriptions',
      href: '/admin/subscriptions',
      icon: CreditCard,
      description: 'Subscription plans & billing'
    })
  }
  
  if (permissions.billing.canViewBilling) {
    financialItems.push({
      title: 'Invoices',
      href: '/admin/invoices',
      icon: FileText,
      description: 'Invoice management'
    })
  }

  if (financialItems.length > 0) {
    navigation.push({
      title: 'Financial',
      items: financialItems
    })
  }

  // Analytics - Available to all, but primary for ANALYST
  const analyticsItems: NavigationItem[] = []
  
  if (permissions.analytics.canView) {
    analyticsItems.push({
      title: 'Platform Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      description: 'Usage & performance metrics'
    })
  }
  
  if (permissions.analytics.canViewAuditLog) {
    analyticsItems.push({
      title: 'Activity Logs',
      href: '/admin/activity-logs',
      icon: Activity,
      description: 'Audit trail & system logs'
    })
  }

  if (analyticsItems.length > 0) {
    navigation.push({
      title: 'Analytics',
      items: analyticsItems
    })
  }

  // System - Conditional based on permissions
  const systemItems: NavigationItem[] = []
  
  // Notifications - Available to all
  systemItems.push({
    title: 'Notifications',
    href: '/admin/notifications',
    icon: Bell,
    badge: 3, // Example badge
    description: 'System notifications'
  })
  
  if (permissions.settings.canView) {
    systemItems.push({
      title: 'System Settings',
      href: '/admin/settings',
      icon: Settings,
      description: 'Platform configuration'
    })
  }
  
  // Security & Database - Only for SUPERADMIN
  if (permissions.settings.canManageSecurity) {
    systemItems.push({
      title: 'Security',
      href: '/admin/security',
      icon: Shield,
      description: 'Security & permissions'
    })
  }
  
  if (permissions.settings.canAccessDatabase) {
    systemItems.push({
      title: 'Database',
      href: '/admin/database',
      icon: Database,
      description: 'Database management'
    })
  }

  if (systemItems.length > 0) {
    navigation.push({
      title: 'System',
      items: systemItems
    })
  }

  // Support - Available to all
  navigation.push({
    title: 'Support',
    items: [
      {
        title: 'Help Center',
        href: '/admin/help',
        icon: HelpCircle,
        description: 'Documentation & guides'
      }
    ]
  })

  return navigation
}

export function AdminSidebar({ className, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Get permissions for current user
  const sppgPermissions = useSppgPermissions()
  const userPermissions = useUserPermissions()
  const demoRequestPermissions = useDemoRequestPermissions()
  const billingPermissions = useBillingPermissions()
  const settingsPermissions = useSettingsPermissions()
  const analyticsPermissions = useAnalyticsPermissions()
  const regionalPermissions = useRegionalPermissions()

  // Generate navigation based on permissions
  const adminNavigation = getAdminNavigation({
    sppg: sppgPermissions,
    user: userPermissions,
    demoRequest: demoRequestPermissions,
    billing: billingPermissions,
    settings: settingsPermissions,
    analytics: analyticsPermissions,
    regional: regionalPermissions,
  })

  const handleSignOut = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const isActivePath = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  const getUserInitials = (name?: string | null) => {
    if (!name) return 'AD'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadge = (role?: string | null) => {
    if (!role) return null
    
    const roleLabels: Record<string, string> = {
      PLATFORM_SUPERADMIN: 'Super Admin',
      PLATFORM_SUPPORT: 'Support',
      PLATFORM_ANALYST: 'Analyst'
    }
    
    return roleLabels[role] || role
  }

  return (
    <Sidebar className={cn('border-r', className)} collapsible="icon">
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link 
              href="/admin" 
              className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-lg transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Shield className="h-4 w-4" />
              </div>
              <div className="flex flex-col flex-1">
                <span className="font-semibold text-sm">Bagizi Admin</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Platform Control</span>
                  {user?.userRole && (
                    <Badge 
                      variant={
                        user.userRole === 'PLATFORM_SUPERADMIN' ? 'default' :
                        user.userRole === 'PLATFORM_SUPPORT' ? 'secondary' :
                        'outline'
                      }
                      className="text-[10px] px-1 py-0 h-4"
                    >
                      {getRoleBadge(user.userRole)}
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      {/* Navigation Content */}
      <SidebarContent>
        {adminNavigation.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item, itemIndex) => {
                  const isActive = isActivePath(item.href)
                  const Icon = item.icon

                  return (
                    <SidebarMenuItem key={itemIndex}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.description}
                      >
                        <Link 
                          href={item.href}
                          onClick={onClose}
                          className="flex items-center gap-3"
                        >
                          <Icon className="h-4 w-4" />
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <SidebarMenuBadge>
                              {item.badge}
                            </SidebarMenuBadge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage 
                      src={user?.avatar || undefined} 
                      alt={user?.name || 'Admin'} 
                    />
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                      {getUserInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.name || 'Admin User'}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email || 'admin@bagizi.id'}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <div className="px-2 py-2">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    {user?.name || 'Admin User'}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {user?.email || 'admin@bagizi.id'}
                  </div>
                  {user?.userRole && (
                    <Badge variant="secondary" className="text-xs">
                      {getRoleBadge(user.userRole)}
                    </Badge>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile" className="cursor-pointer">
                    <UserCog className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    System Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
