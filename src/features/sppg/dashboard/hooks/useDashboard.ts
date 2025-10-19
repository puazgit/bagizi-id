/**
 * @fileoverview Dashboard hooks - TanStack Query hooks untuk dashboard data
 * @version Next.js 15.5.4 / TanStack Query / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { useDashboardStore } from '../stores'
import { dashboardApi } from '../api'
import type { DashboardData, ActivityItem, NotificationItem } from '../types'

/**
 * Dashboard query keys for consistent cache management
 */
export const dashboardKeys = {
  all: ['dashboard'] as const,
  data: (sppgId: string) => [...dashboardKeys.all, 'data', sppgId] as const,
  stats: (sppgId: string) => [...dashboardKeys.all, 'stats', sppgId] as const,
  activities: (sppgId: string) => [...dashboardKeys.all, 'activities', sppgId] as const,
  notifications: (sppgId: string) => [...dashboardKeys.all, 'notifications', sppgId] as const,
}

/**
 * Helper function to get complete dashboard data
 */
async function getDashboardData(): Promise<DashboardData> {
  // Fetch all data in parallel for better performance
  const [statsResult, activitiesResult, notificationsResult] = await Promise.all([
    dashboardApi.getStats(),
    dashboardApi.getActivities(10),
    dashboardApi.getNotifications()
  ])
  
  if (!statsResult.success || !activitiesResult.success || !notificationsResult.success) {
    throw new Error('Failed to fetch dashboard data')
  }
  
  return {
    stats: statsResult.data!,
    quickActions: [
      {
        id: '1',
        title: 'Kelola Menu',
        href: '/menu',
        icon: 'ChefHat',
        description: 'Buat dan kelola menu harian'
      },
      {
        id: '2',
        title: 'Procurement',
        href: '/procurement',
        icon: 'Package',
        description: 'Kelola pengadaan bahan baku'
      },
      {
        id: '3',
        title: 'Distribusi',
        href: '/distribution',
        icon: 'Truck',
        description: 'Monitor distribusi makanan'
      },
      {
        id: '4',
        title: 'Laporan',
        href: '/reports',
        icon: 'TrendingUp',
        description: 'Lihat laporan dan analitik'
      }
    ],
    recentActivities: activitiesResult.data!.slice(0, 10),
    notifications: notificationsResult.data!.slice(0, 10),
    lastUpdated: new Date().toISOString()
  }
}

/**
 * Hook untuk mengambil data dashboard
 */
export function useDashboardData() {
  const setDashboardData = useDashboardStore(state => state.setDashboardData)
  const setLoading = useDashboardStore(state => state.setLoading)
  const setError = useDashboardStore(state => state.setError)

  const query = useQuery({
    queryKey: dashboardKeys.all,
    queryFn: getDashboardData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 2, // 2 minutes for real-time updates
  })

  // Handle data updates
  if (query.data) {
    setDashboardData(query.data)
  }
  
  if (query.error) {
    setError(query.error instanceof Error ? query.error.message : 'Failed to load dashboard')
  }

  setLoading(query.isLoading)

  return query
}

/**
 * Hook untuk mengambil statistik dashboard
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats('current'),
    queryFn: async () => {
      const result = await dashboardApi.getStats()
      if (!result.success || !result.data) {
        throw new Error('Failed to fetch dashboard stats')
      }
      return result.data
    },
    staleTime: 1000 * 60 * 2, // 2 minutes - more frequent for stats
    gcTime: 1000 * 60 * 5, // 5 minutes garbage collection
    refetchOnWindowFocus: true
  })
}

/**
 * Hook untuk mark notification as read
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  const markNotificationRead = useDashboardStore(state => state.markNotificationRead)

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const result = await dashboardApi.markNotificationRead(notificationId)
      if (!result.success) {
        throw new Error(result.error || 'Failed to mark notification as read')
      }
      return result
    },
    onSuccess: (_, notificationId) => {
      // Update store
      markNotificationRead(notificationId)
      
      // Invalidate notifications query
      queryClient.invalidateQueries({ 
        queryKey: dashboardKeys.all
      })
      
      toast.success('Notifikasi ditandai telah dibaca')
    },
    onError: (error) => {
      toast.error('Gagal menandai notifikasi sebagai dibaca')
      console.error('Mark notification read error:', error)
    }
  })
}

/**
 * Hook untuk clear semua notifikasi
 */
export function useClearNotifications() {
  const queryClient = useQueryClient()
  const clearNotifications = useDashboardStore(state => state.clearNotifications)

  return useMutation({
    mutationFn: async () => {
      const result = await dashboardApi.clearNotifications()
      if (!result.success) {
        throw new Error(result.error || 'Failed to clear notifications')
      }
      return result
    },
    onSuccess: () => {
      // Update store
      clearNotifications()
      
      // Invalidate notifications query
      queryClient.invalidateQueries({ 
        queryKey: dashboardKeys.all
      })
      
      toast.success('Semua notifikasi telah dihapus')
    },
    onError: (error) => {
      toast.error('Gagal menghapus notifikasi')
      console.error('Clear notifications error:', error)
    }
  })
}

/**
 * Hook untuk real-time dashboard updates
 */
export function useRealTimeDashboard() {
  const addActivity = useDashboardStore(state => state.addActivity)
  const addNotification = useDashboardStore(state => state.addNotification)
  const updateStats = useDashboardStore(state => state.updateStats)

  const simulateRealTimeUpdate = useCallback(() => {
    // Simulate new activity
    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      type: 'menu',
      title: 'Menu baru telah ditambahkan',
      description: `${new Date().toLocaleTimeString()} • Menu "Nasi Ayam Bakar"`,
      timestamp: new Date().toISOString(),
      actor: 'System',
      badge: 'Menu',
      status: 'info'
    }

    const newNotification: NotificationItem = {
      id: Date.now().toString(),
      type: 'info',
      title: 'Update real-time',
      message: 'Data dashboard telah diperbarui',
      timestamp: new Date().toISOString(),
      isRead: false,
      priority: 'low'
    }

    addActivity(newActivity)
    addNotification(newNotification)

    // Simulate stats update
    updateStats({
      activeMenus: {
        current: 24,
        newThisWeek: 9
      }
    })
  }, [addActivity, addNotification, updateStats])

  return {
    simulateUpdate: simulateRealTimeUpdate
  }
}