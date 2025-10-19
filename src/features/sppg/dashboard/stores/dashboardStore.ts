/**
 * @fileoverview Dashboard Zustand store - SPPG dashboard state management
 * @version Next.js 15.5.4 / Zustand / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { DashboardData, DashboardStats, ActivityItem, NotificationItem } from '../types'
import { dashboardApi } from '../api'

interface DashboardState {
  // State
  data: DashboardData | null
  isLoading: boolean
  error: string | null
  lastFetch: number | null
  
  // Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setDashboardData: (data: DashboardData) => void
  updateStats: (stats: Partial<DashboardStats>) => void
  addActivity: (activity: ActivityItem) => void
  addNotification: (notification: NotificationItem) => void
  markNotificationRead: (notificationId: string) => void
  clearNotifications: () => void
  refreshData: () => Promise<void>
}

/**
 * SPPG Dashboard store with enterprise patterns
 */
export const useDashboardStore = create<DashboardState>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        data: null,
        isLoading: false,
        error: null,
        lastFetch: null,

        // Actions
        setLoading: (loading) =>
          set((state) => {
            state.isLoading = loading
            if (loading) state.error = null
          }),

        setError: (error) =>
          set((state) => {
            state.error = error
            state.isLoading = false
          }),

        setDashboardData: (data) =>
          set((state) => {
            state.data = data
            state.isLoading = false
            state.error = null
            state.lastFetch = Date.now()
          }),

        updateStats: (newStats) =>
          set((state) => {
            if (state.data) {
              state.data.stats = { ...state.data.stats, ...newStats }
            }
          }),

        addActivity: (activity) =>
          set((state) => {
            if (state.data) {
              state.data.recentActivities.unshift(activity)
              // Keep only latest 10 activities
              if (state.data.recentActivities.length > 10) {
                state.data.recentActivities = state.data.recentActivities.slice(0, 10)
              }
            }
          }),

        addNotification: (notification) =>
          set((state) => {
            if (state.data) {
              state.data.notifications.unshift(notification)
              // Keep only latest 20 notifications
              if (state.data.notifications.length > 20) {
                state.data.notifications = state.data.notifications.slice(0, 20)
              }
            }
          }),

        markNotificationRead: (notificationId) =>
          set((state) => {
            if (state.data) {
              const notification = state.data.notifications.find((n: NotificationItem) => n.id === notificationId)
              if (notification) {
                notification.isRead = true
              }
            }
          }),

        clearNotifications: () =>
          set((state) => {
            if (state.data) {
              state.data.notifications = []
            }
          }),

        refreshData: async () => {
          const { setLoading, setError, setDashboardData } = get()
          
          setLoading(true)
          
          try {
            const result = await dashboardApi.getDashboard()
            
            if (!result.success || !result.data) {
              throw new Error(result.error || 'Failed to fetch dashboard data')
            }
            
            // Transform API response to DashboardData format
            const dashboardData: DashboardData = {
              stats: result.data.stats,
              quickActions: [
                { id: '1', title: 'Buat Menu Baru', description: 'Tambah menu gizi baru', icon: 'Plus', href: '/menu/new' },
                { id: '2', title: 'Review Menu', description: 'Lihat dan approve menu', icon: 'Check', href: '/menu?status=PENDING' },
                { id: '3', title: 'Laporan', description: 'Unduh laporan bulanan', icon: 'Download', href: '/reports' },
              ],
              recentActivities: result.data.activities.slice(0, 10),
              notifications: result.data.notifications.slice(0, 10),
              lastUpdated: new Date().toISOString()
            }
            
            setDashboardData(dashboardData)
          } catch (error) {
            console.error('Dashboard refresh error:', error)
            setError(error instanceof Error ? error.message : 'Failed to refresh dashboard')
          }
        }
      }))
    ),
    {
      name: 'sppg-dashboard-store'
    }
  )
)

/**
 * Dashboard selectors for optimized component updates
 */
export const dashboardSelectors = {
  // Stats selectors
  stats: (state: DashboardState) => state.data?.stats,
  totalBeneficiaries: (state: DashboardState) => state.data?.stats?.totalBeneficiaries,
  activeMenus: (state: DashboardState) => state.data?.stats?.activeMenus,
  todayDistribution: (state: DashboardState) => state.data?.stats?.todayDistribution,
  monthlyBudget: (state: DashboardState) => state.data?.stats?.monthlyBudget,
  
  // Quick actions selectors
  quickActions: (state: DashboardState) => state.data?.quickActions || [],
  
  // Activities selectors
  recentActivities: (state: DashboardState) => state.data?.recentActivities || [],
  
  // Notifications selectors
  notifications: (state: DashboardState) => state.data?.notifications || [],
  unreadNotifications: (state: DashboardState) => 
    state.data?.notifications?.filter(n => !n.isRead) || [],
  
  // Meta selectors
  isLoading: (state: DashboardState) => state.isLoading,
  error: (state: DashboardState) => state.error,
  lastFetch: (state: DashboardState) => state.lastFetch
}