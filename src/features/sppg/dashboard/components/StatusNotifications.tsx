/**
 * @fileoverview Status Notifications Component - Dashboard alerts and notifications
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Info,
  X
} from 'lucide-react'
import { useDashboardStore } from '../stores'
import { useMarkNotificationRead, useClearNotifications } from '../hooks'
import { cn } from '@/lib/utils'
import type { NotificationItem } from '../types'

interface StatusNotificationsProps {
  className?: string
  maxItems?: number
}

function getNotificationIcon(priority: NotificationItem['priority']) {
  const iconMap = {
    high: AlertTriangle,
    medium: Info,
    low: CheckCircle
  }
  
  const IconComponent = iconMap[priority] || Info
  return <IconComponent className="h-4 w-4" />
}

function getNotificationColor(priority: NotificationItem['priority']) {
  const colorMap = {
    high: 'text-red-600 bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    low: 'text-green-600 bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800'
  }
  
  return colorMap[priority] || 'text-muted-foreground bg-muted border-border'
}

function getBadgeVariant(priority: NotificationItem['priority']): "default" | "secondary" | "destructive" | "outline" {
  const variantMap = {
    high: 'destructive' as const,
    medium: 'default' as const,
    low: 'secondary' as const
  }
  
  return variantMap[priority] || 'outline'
}

function formatNotificationTime(timestamp: string): string {
  const now = new Date()
  const past = new Date(timestamp)
  const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / 60000)
  
  if (diffInMinutes < 1) return 'Baru saja'
  if (diffInMinutes < 60) return `${diffInMinutes}m`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}j`
  
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}h`
}

export function StatusNotifications({ className, maxItems = 4 }: StatusNotificationsProps) {
  // SSR-safe client-side mounting detection and store subscription
  const [isClient, setIsClient] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Hooks that are safe to call during SSR
  const { mutate: markAsRead } = useMarkNotificationRead()
  const { mutate: clearAll, isPending: isClearingAll } = useClearNotifications()
  
  // Subscribe to store only on client side
  useEffect(() => {
    setIsClient(true)
    
    // Initial state sync first
    const currentState = useDashboardStore.getState()
    setNotifications(currentState.data?.notifications || [])
    setIsLoading(currentState.isLoading)
    
    // Create store subscription after initial sync
    const unsubscribe = useDashboardStore.subscribe(
      (state) => ({
        notifications: state.data?.notifications || [],
        isLoading: state.isLoading
      }),
      (current) => {
        // Use setTimeout to avoid setState during render
        setTimeout(() => {
          setNotifications(current.notifications)
          setIsLoading(current.isLoading)
        }, 0)
      }
    )
    
    return unsubscribe
  }, [])
  
  // Show loading skeleton during SSR/hydration
  if (!isClient || isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-5 w-5 rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-start space-x-3">
                <Skeleton className="h-4 w-4 rounded mt-1" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }
  
  const displayNotifications = notifications.slice(0, maxItems)
  const unreadCount = notifications.filter((n: NotificationItem) => !n.isRead).length

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId)
  }

  const handleClearAll = () => {
    clearAll()
  }

  if (displayNotifications.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifikasi
          </CardTitle>
          <CardDescription>
            Status dan peringatan sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-sm text-muted-foreground">
              Tidak ada notifikasi baru
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifikasi
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs px-2 py-1">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Status dan peringatan sistem
            </CardDescription>
          </div>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleClearAll}
              disabled={isClearingAll}
            >
              {isClearingAll ? 'Menghapus...' : 'Hapus Semua'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayNotifications.map((notification: NotificationItem) => (
            <div
              key={notification.id}
              className={cn(
                'p-3 rounded-lg border transition-all duration-200',
                getNotificationColor(notification.priority),
                !notification.isRead && 'shadow-sm',
                notification.isRead && 'opacity-60'
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.priority)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium',
                    !notification.isRead && 'font-semibold'
                  )}>
                    {notification.title}
                  </p>
                  <p className="text-xs opacity-80 mt-1">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-70">
                      {formatNotificationTime(notification.timestamp)}
                    </span>
                    <Badge 
                      variant={getBadgeVariant(notification.priority)}
                      className="text-xs"
                    >
                      {notification.priority === 'high' && 'Tinggi'}
                      {notification.priority === 'medium' && 'Sedang'} 
                      {notification.priority === 'low' && 'Rendah'}
                    </Badge>
                  </div>
                </div>
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Tandai sudah dibaca</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        {notifications.length > maxItems && (
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm">
              Lihat Semua ({notifications.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}