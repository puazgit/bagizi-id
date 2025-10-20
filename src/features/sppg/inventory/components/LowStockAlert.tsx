/**
 * @fileoverview Low Stock Alert Banner Component
 * Real-time monitoring component that displays critical low stock warnings
 * with urgency-based color coding and quick action buttons.
 * 
 * Features:
 * - Auto-refresh every 5 minutes via useLowStockItems hook
 * - Three urgency levels: CRITICAL (≤25%), HIGH (≤50%), MEDIUM (>50%)
 * - Dismissible with localStorage persistence per session
 * - Quick actions: View all low stock items, Create procurement order
 * - Responsive design with mobile support
 * - Dark mode support via shadcn/ui
 * 
 * @version Next.js 15.5.4 / React 19
 * @author Bagizi-ID Development Team
 * @see {@link /docs/INVENTORY_STEP_6_COMPONENTS_PLAN.md} Component Specifications
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useLowStockItems } from '../hooks'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, X, Eye, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Props for LowStockAlert component
 */
interface LowStockAlertProps {
  /**
   * Custom className for styling
   */
  className?: string
  
  /**
   * Callback when alert is dismissed
   */
  onDismiss?: () => void
  
  /**
   * Show only critical items (default: true)
   */
  criticalOnly?: boolean
  
  /**
   * Enable auto-dismiss after X seconds (0 = never)
   */
  autoDismissSeconds?: number
}

/**
 * LocalStorage key for dismissed alerts tracking
 */
const DISMISSED_KEY = 'bagizi_low_stock_dismissed'

/**
 * LowStockAlert Component
 * 
 * Displays a prominent alert banner when inventory items reach low stock levels.
 * Automatically refreshes data every 5 minutes and provides quick access to
 * inventory management and procurement workflows.
 * 
 * @example
 * ```tsx
 * // On Dashboard
 * <LowStockAlert criticalOnly />
 * 
 * // On Inventory Page (show all urgencies)
 * <LowStockAlert criticalOnly={false} />
 * 
 * // With custom styling
 * <LowStockAlert className="mb-6" onDismiss={handleDismiss} />
 * ```
 */
export function LowStockAlert({
  className,
  onDismiss,
  criticalOnly = true,
  autoDismissSeconds = 0,
}: LowStockAlertProps) {
  // Fetch low stock items with auto-refresh
  const { data: items, isLoading } = useLowStockItems()
  
  // Dismissal state (persisted in localStorage for current session)
  const [isDismissed, setIsDismissed] = useState(false)
  
  // Load dismissed state from localStorage on mount
  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY)
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10)
      const now = Date.now()
      // Reset after 1 hour (3600000ms)
      if (now - dismissedTime < 3600000) {
        setIsDismissed(true)
      } else {
        localStorage.removeItem(DISMISSED_KEY)
      }
    }
  }, [])
  
  /**
   * Handle alert dismissal
   * Saves timestamp to localStorage and triggers callback
   */
  const handleDismiss = useCallback(() => {
    setIsDismissed(true)
    localStorage.setItem(DISMISSED_KEY, Date.now().toString())
    onDismiss?.()
  }, [onDismiss])
  
  // Auto-dismiss timer
  useEffect(() => {
    if (autoDismissSeconds > 0 && !isDismissed) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, autoDismissSeconds * 1000)
      
      return () => clearTimeout(timer)
    }
  }, [autoDismissSeconds, isDismissed, handleDismiss])
  
  // Don't render if loading, dismissed, or no low stock items
  if (isLoading || isDismissed || !items?.length) return null
  
  // Filter items based on criticalOnly prop
  const displayItems = criticalOnly
    ? items.filter(item => item.urgency === 'CRITICAL')
    : items
  
  // Don't render if no items to display after filtering
  if (!displayItems.length) return null
  
  // Count items by urgency
  const criticalCount = items.filter(item => item.urgency === 'CRITICAL').length
  const highCount = items.filter(item => item.urgency === 'HIGH').length
  const mediumCount = items.filter(item => item.urgency === 'MEDIUM').length
  
  // Determine alert variant based on highest urgency
  const hasAnyCritical = criticalCount > 0
  const variant = hasAnyCritical ? 'destructive' : 'default'
  
  return (
    <Alert 
      variant={variant}
      className={cn(
        'relative',
        hasAnyCritical && 'border-destructive/50 dark:border-destructive',
        className
      )}
    >
      {/* Icon */}
      <AlertTriangle className="h-5 w-5" />
      
      {/* Dismiss Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-8 w-8"
        onClick={handleDismiss}
        aria-label="Dismiss alert"
      >
        <X className="h-4 w-4" />
      </Button>
      
      {/* Alert Content */}
      <div className="pr-8">
        <AlertTitle className="mb-2 flex items-center gap-2">
          {hasAnyCritical ? '⚠️ Peringatan Stok Kritis!' : '📦 Peringatan Stok Rendah'}
          
          {/* Urgency Badges */}
          <div className="ml-2 flex gap-1">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {criticalCount} Kritis
              </Badge>
            )}
            {highCount > 0 && !criticalOnly && (
              <Badge 
                variant="secondary" 
                className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 text-xs"
              >
                {highCount} Tinggi
              </Badge>
            )}
            {mediumCount > 0 && !criticalOnly && (
              <Badge 
                variant="secondary"
                className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 text-xs"
              >
                {mediumCount} Sedang
              </Badge>
            )}
          </div>
        </AlertTitle>
        
        <AlertDescription className="space-y-3">
          {/* Description */}
          <p className="text-sm">
            {hasAnyCritical ? (
              <>
                <span className="font-semibold">{criticalCount}</span> item inventori 
                memerlukan perhatian segera. Stok sangat rendah dan dapat mengganggu 
                operasional SPPG.
              </>
            ) : (
              <>
                <span className="font-semibold">{displayItems.length}</span> item inventori 
                berada di bawah level stok minimum. Pertimbangkan untuk melakukan pemesanan 
                ulang.
              </>
            )}
          </p>
          
          {/* Item Preview (first 3) */}
          {displayItems.length > 0 && (
            <div className="space-y-1 text-xs">
              {displayItems.slice(0, 3).map(item => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between rounded border border-border/50 bg-background/50 px-2 py-1"
                >
                  <span className="font-medium">{item.itemName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {item.currentStock} {item.unit}
                    </span>
                    <Badge 
                      variant={
                        item.urgency === 'CRITICAL' ? 'destructive' : 
                        item.urgency === 'HIGH' ? 'secondary' : 
                        'outline'
                      }
                      className={cn(
                        'text-[10px]',
                        item.urgency === 'HIGH' && 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
                        item.urgency === 'MEDIUM' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      )}
                    >
                      {item.urgency}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {/* Show more indicator */}
              {displayItems.length > 3 && (
                <p className="text-center text-muted-foreground">
                  +{displayItems.length - 3} item lainnya
                </p>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/inventory?filter=low-stock">
                <Eye className="mr-2 h-4 w-4" />
                Lihat Semua
              </Link>
            </Button>
            
            <Button asChild size="sm" variant="outline">
              <Link href="/procurement/create">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Buat Pesanan
              </Link>
            </Button>
          </div>
        </AlertDescription>
      </div>
    </Alert>
  )
}

/**
 * Compact variant of LowStockAlert for smaller spaces
 * Shows only count and quick link
 */
export function LowStockAlertCompact({ className }: { className?: string }) {
  const { data: items } = useLowStockItems()
  const criticalCount = items?.filter(item => item.urgency === 'CRITICAL').length ?? 0
  
  if (criticalCount === 0) return null
  
  return (
    <Link 
      href="/inventory?filter=low-stock"
      className={cn(
        'flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm transition-colors hover:bg-destructive/20',
        'dark:border-destructive dark:bg-destructive/20 dark:hover:bg-destructive/30',
        className
      )}
    >
      <AlertTriangle className="h-4 w-4 text-destructive" />
      <span className="font-medium">
        {criticalCount} item stok kritis
      </span>
    </Link>
  )
}
