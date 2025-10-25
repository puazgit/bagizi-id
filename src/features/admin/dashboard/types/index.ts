/**
 * @fileoverview Admin Dashboard Type Definitions
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

/**
 * Dashboard Statistics Response Type
 */
export interface DashboardStats {
  demoRequests: {
    total: number
    byStatus: {
      submitted: number
      underReview: number
      approved: number
      demoActive: number
      converted: number
      rejected: number
    }
    thisMonth: number
    growth: number
  }
  sppg: {
    total: number
    active: number
    trial: number
    demo: number
  }
  users: {
    total: number
    platformAdmins: number
    sppgUsers: number
  }
  conversion: {
    rate: number
    thisMonth: number
    averageProbability: number
  }
  recentActivities: {
    demoRequests: DemoRequestActivity[]
    conversions: ConversionActivity[]
  }
}

/**
 * Demo Request Activity
 */
export interface DemoRequestActivity {
  id: string
  type: 'demo_request'
  organizationName: string
  organizationType: string
  status: string
  timestamp: Date
  picName: string
  targetBeneficiaries: number
  description: string
}

/**
 * Conversion Activity
 */
export interface ConversionActivity {
  id: string
  type: 'conversion'
  organizationName: string
  organizationType: string
  timestamp: Date | null
  targetBeneficiaries: number
  probability: number | null
  description: string
}

/**
 * Stat Card Props
 */
export interface StatCardProps {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    label: string
  }
  icon: React.ComponentType<{ className?: string }>
  href?: string
}
