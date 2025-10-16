/**
 * @fileoverview User navigation components with shadcn/ui and enterprise features
 * @version Next.js 15.5.4 / Auth.js v5 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise UI Guidelines
 */

'use client'

import { useAuth } from '@/hooks/use-auth'
import { getRoleDisplayName } from '@/lib/auth-utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Settings, 
  LogOut, 
  Building2, 
  Shield,
  ChevronDown,
  Bell
} from 'lucide-react'

/**
 * User avatar with dropdown menu for authenticated users
 * 
 * Features:
 * - User profile information
 * - Role display with localization
 * - SPPG information for SPPG users
 * - Navigation shortcuts
 * - Logout functionality
 * - Dark mode support
 * 
 * @example
 * <UserMenu />
 */
export function UserMenu() {
  const { user, logout, isSppgUser, isAdminUser } = useAuth()
  
  if (!user) {
    return null
  }
  
  // Generate user initials for avatar fallback
  const initials = user.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email.slice(0, 2).toUpperCase()
  
  const roleDisplayName = getRoleDisplayName(user.userRole)
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-10 w-auto rounded-full px-2 hover:bg-accent/50 dark:hover:bg-accent/30"
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={user.avatar || undefined} 
                alt={user.name || 'User'} 
              />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="hidden lg:flex lg:flex-col lg:items-start lg:text-left">
              <span className="text-sm font-medium text-foreground">
                {user.name || 'User'}
              </span>
              <span className="text-xs text-muted-foreground">
                {roleDisplayName}
              </span>
            </div>
            
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-72 p-2" 
        align="end" 
        sideOffset={8}
      >
        {/* User Information Header */}
        <DropdownMenuLabel className="pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={user.avatar || undefined} 
                alt={user.name || 'User'} 
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex flex-col">
              <span className="font-medium text-foreground">
                {user.name || 'Pengguna'}
              </span>
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        
        {/* Role and SPPG Information */}
        <div className="px-2 pb-2">
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant="secondary" 
              className="text-xs bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary-foreground"
            >
              <Shield className="mr-1 h-3 w-3" />
              {roleDisplayName}
            </Badge>
            
            {isSppgUser() && user.sppgName && (
              <Badge 
                variant="outline" 
                className="text-xs border-muted-foreground/30 text-muted-foreground"
              >
                <Building2 className="mr-1 h-3 w-3" />
                {user.sppgName}
              </Badge>
            )}
          </div>
        </div>
        
        <DropdownMenuSeparator className="my-2" />
        
        {/* Navigation Items */}
        <DropdownMenuItem className="cursor-pointer focus:bg-accent/50 dark:focus:bg-accent/30">
          <User className="mr-3 h-4 w-4 text-muted-foreground" />
          <span>Profil Saya</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer focus:bg-accent/50 dark:focus:bg-accent/30">
          <Bell className="mr-3 h-4 w-4 text-muted-foreground" />
          <span>Notifikasi</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer focus:bg-accent/50 dark:focus:bg-accent/30">
          <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
          <span>Pengaturan</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="my-2" />
        
        {/* Quick Navigation for SPPG Users */}
        {isSppgUser() && (
          <>
            <DropdownMenuLabel className="px-2 py-1 text-xs font-medium text-muted-foreground">
              Navigasi Cepat
            </DropdownMenuLabel>
            
            <DropdownMenuItem className="cursor-pointer focus:bg-accent/50 dark:focus:bg-accent/30">
              <Building2 className="mr-3 h-4 w-4 text-muted-foreground" />
              <span>Dashboard SPPG</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="my-2" />
          </>
        )}
        
        {/* Quick Navigation for Admin Users */}
        {isAdminUser() && (
          <>
            <DropdownMenuLabel className="px-2 py-1 text-xs font-medium text-muted-foreground">
              Admin Panel
            </DropdownMenuLabel>
            
            <DropdownMenuItem className="cursor-pointer focus:bg-accent/50 dark:focus:bg-accent/30">
              <Shield className="mr-3 h-4 w-4 text-muted-foreground" />
              <span>Platform Admin</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="my-2" />
          </>
        )}
        
        {/* Logout */}
        <DropdownMenuItem 
          className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive dark:focus:bg-destructive/20"
          onClick={logout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span>Keluar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Compact user avatar button for mobile/small spaces
 * 
 * @example
 * <UserAvatar />
 */
export function UserAvatar() {
  const { user } = useAuth()
  
  if (!user) {
    return null
  }
  
  const initials = user.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email.slice(0, 2).toUpperCase()
  
  return (
    <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-background shadow-sm hover:shadow-md transition-shadow">
      <AvatarImage 
        src={user.avatar || undefined} 
        alt={user.name || 'User'} 
      />
      <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}

/**
 * Login/Auth button for unauthenticated users
 * 
 * @example
 * <LoginButton />
 */
export function LoginButton() {
  const { login } = useAuth()
  
  return (
    <Button 
      onClick={() => login()}
      className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all"
    >
      <User className="mr-2 h-4 w-4" />
      Masuk
    </Button>
  )
}

/**
 * Conditional auth navigation - shows UserMenu or LoginButton based on auth state
 * 
 * @example
 * <AuthNav />
 */
export function AuthNav() {
  const { isAuthenticated, isLoading } = useAuth()
  
  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        <div className="hidden lg:block h-4 w-20 bg-muted animate-pulse rounded" />
      </div>
    )
  }
  
  return isAuthenticated ? <UserMenu /> : <LoginButton />
}