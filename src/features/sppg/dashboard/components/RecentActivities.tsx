/**
 * @fileoverview Recent Activities Component - Dashboard activity feed
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChefHat,
  Truck,
  Package,
  Factory,
  AlertCircle
} from 'lucide-react'
import { useDashboardStore } from '../stores'
import { cn } from '@/lib/utils'
import type { ActivityItem } from '../types'

interface RecentActivitiesProps {
  className?: string
  maxItems?: number
}

function getActivityIcon(type: ActivityItem['type']) {
  const iconMap = {
    menu: ChefHat,
    distribution: Truck,
    procurement: Package,
    production: Factory
  }
  
  const IconComponent = iconMap[type] || AlertCircle
  return <IconComponent className="h-4 w-4" />
}

function getActivityColor(type: ActivityItem['type'], status: ActivityItem['status']) {
  if (status === 'error') return 'text-red-600 bg-red-100 dark:bg-red-900/20'
  if (status === 'warning') return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
  if (status === 'success') return 'text-green-600 bg-green-100 dark:bg-green-900/20'
  
  // Default colors by type
  const colorMap = {
    menu: 'text-primary bg-primary/10',
    distribution: 'text-green-600 bg-green-100 dark:bg-green-900/20',
    procurement: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
    production: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20'
  }
  
  return colorMap[type] || 'text-muted-foreground bg-muted'
}

function getBadgeVariant(type: ActivityItem['type']): "default" | "secondary" | "destructive" | "outline" {
  const variantMap = {
    menu: 'default' as const,
    distribution: 'secondary' as const, 
    procurement: 'outline' as const,
    production: 'secondary' as const
  }
  
  return variantMap[type] || 'outline'
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date()
  const past = new Date(timestamp)
  const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / 60000)
  
  if (diffInMinutes < 1) return 'Baru saja'
  if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} jam yang lalu`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays} hari yang lalu`
  
  return past.toLocaleDateString('id-ID')
}

export function RecentActivities({ className, maxItems = 5 }: RecentActivitiesProps) {
  // SSR-safe client-side mounting detection and store subscription
  const [isClient, setIsClient] = useState(false)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Subscribe to store only on client side
  useEffect(() => {
    setIsClient(true)
    
    // Initial state sync first
    const currentState = useDashboardStore.getState()
    setActivities(currentState.data?.recentActivities || [])
    setIsLoading(currentState.isLoading)
    
    // Create store subscription after initial sync
    const unsubscribe = useDashboardStore.subscribe(
      (state) => ({
        activities: state.data?.recentActivities || [],
        isLoading: state.isLoading
      }),
      (current) => {
        // Use setTimeout to avoid setState during render
        setTimeout(() => {
          setActivities(current.activities)
          setIsLoading(current.isLoading)
        }, 0)
      }
    )
    
    return unsubscribe
  }, [])
  
  const displayActivities = activities.slice(0, maxItems)

  // Prevent SSR hydration issues by showing loading state until client-side
  if (!isClient || isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }



  if (displayActivities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
          <CardDescription>
            Aktivitas terbaru di sistem SPPG
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Belum ada aktivitas terbaru
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Aktivitas Terbaru</CardTitle>
        <CardDescription>
          Aktivitas terbaru di sistem SPPG
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.map((activity, index) => (
            <div key={activity.id}>
              <div className="flex items-center gap-4">
                <div className={cn(
                  'p-2 rounded-lg flex-shrink-0',
                  getActivityColor(activity.type, activity.status)
                )}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {activity.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(activity.timestamp)} • {activity.actor}
                    </p>
                  </div>
                </div>
                <Badge variant={getBadgeVariant(activity.type)}>
                  {activity.badge}
                </Badge>
              </div>
              {index < displayActivities.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}