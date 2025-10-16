/**
 * @fileoverview Main application header with navigation and user menu
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise UI Guidelines
 */

'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { AuthNav } from '@/components/auth/user-nav'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Menu, 
  Home, 
  Shield,
  Users,
  BookOpen
} from 'lucide-react'

interface AppHeaderProps {
  onMenuToggle?: () => void
  showMenuButton?: boolean
}

/**
 * Main application header component
 * 
 * Features:
 * - Responsive design with mobile menu toggle
 * - Brand logo and navigation
 * - User authentication state management
 * - Role-based navigation items
 * - Dark mode compatible
 * - Enterprise styling
 * 
 * @param props - Component props
 * @example
 * <AppHeader onMenuToggle={() => setMenuOpen(!menuOpen)} />
 */
export function AppHeader({ onMenuToggle, showMenuButton = false }: AppHeaderProps) {
  const { isAuthenticated, isSppgUser, isAdminUser, user } = useAuth()
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 lg:px-6">
        {/* Left Section: Menu + Logo */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          {showMenuButton && onMenuToggle && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onMenuToggle}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          )}
          
          {/* Brand Logo */}
          <Link 
            href={isAuthenticated ? (isAdminUser() ? '/admin' : '/dashboard') : '/'}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="hidden sm:flex sm:flex-col">
              <span className="text-lg font-bold text-foreground leading-tight">
                Bagizi-ID
              </span>
              <span className="text-xs text-muted-foreground leading-tight">
                SPPG Management Platform
              </span>
            </div>
          </Link>
          
          {/* Environment Badge (Development) */}
          {process.env.NODE_ENV === 'development' && (
            <Badge variant="outline" className="hidden md:inline-flex text-xs">
              DEV
            </Badge>
          )}
        </div>
        
        {/* Center Section: Navigation (Desktop) */}
        {isAuthenticated && (
          <nav className="hidden lg:flex lg:items-center lg:gap-1">
            {/* SPPG Navigation */}
            {isSppgUser() && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-muted-foreground hover:text-foreground hover:bg-accent/50"
                >
                  <Link href="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-muted-foreground hover:text-foreground hover:bg-accent/50"
                >
                  <Link href="/menu">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Menu
                  </Link>
                </Button>
              </>
            )}
            
            {/* Admin Navigation */}
            {isAdminUser() && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-muted-foreground hover:text-foreground hover:bg-accent/50"
                >
                  <Link href="/admin">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin
                  </Link>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-muted-foreground hover:text-foreground hover:bg-accent/50"
                >
                  <Link href="/admin/sppg">
                    <Users className="mr-2 h-4 w-4" />
                    SPPG Management
                  </Link>
                </Button>
              </>
            )}
          </nav>
        )}
        
        {/* Right Section: User Navigation */}
        <div className="flex items-center gap-4">
          {/* User Info (Authenticated) */}
          {isAuthenticated && user && (
            <div className="hidden xl:flex xl:flex-col xl:items-end xl:text-right">
              <span className="text-sm font-medium text-foreground">
                {user.name || 'Pengguna'}
              </span>
              {isSppgUser() && user.sppgName && (
                <span className="text-xs text-muted-foreground">
                  {user.sppgName}
                </span>
              )}
            </div>
          )}
          
          {/* Auth Navigation */}
          <AuthNav />
        </div>
      </div>
    </header>
  )
}

/**
 * Simple header for public/marketing pages
 * NO USER NAVIGATION - Public pages don't require authentication
 * Login button redirects directly to /login
 * 
 * @example
 * <PublicHeader />
 */
export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 lg:px-6">
        {/* Brand Logo */}
        <Link 
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground leading-tight">
              Bagizi-ID
            </span>
            <span className="text-xs text-muted-foreground leading-tight">
              SPPG Management Platform
            </span>
          </div>
        </Link>
        
        {/* Navigation */}
        <nav className="hidden md:flex md:items-center md:gap-1">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-muted-foreground hover:text-foreground hover:bg-accent/50"
          >
            <Link href="/features">Features</Link>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-muted-foreground hover:text-foreground hover:bg-accent/50"
          >
            <Link href="/pricing">Pricing</Link>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-muted-foreground hover:text-foreground hover:bg-accent/50"
          >
            <Link href="/blog">Blog</Link>
          </Button>
        </nav>
        
        {/* Simple Login Button (No User Menu for Public Pages) */}
        <Button 
          asChild
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all"
        >
          <Link href="/login">
            <Shield className="mr-2 h-4 w-4" />
            Masuk
          </Link>
        </Button>
      </div>
    </header>
  )
}