/**
 * @fileoverview Admin Demo Requests Analytics Page
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useDemoRequestAnalytics } from '@/features/admin/demo-requests'
import { DemoRequestAnalyticsDashboard } from '@/features/admin/demo-requests/components'

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Demo Requests Analytics Page - Dashboard analytics untuk demo requests
 *
 * Features:
 * - Overview statistics
 * - Conversion rate charts
 * - Status distribution
 * - Trend analysis
 * - Date range filters
 *
 * @example
 * // Route: /admin/demo-requests/analytics
 */
export default function DemoRequestAnalyticsPage() {
  const router = useRouter()
  // TODO: Implement date range filter in DemoRequestAnalyticsDashboard component
  // const [dateRange, setDateRange] = useState<{
  //   startDate?: Date
  //   endDate?: Date
  // }>({})

  const { data: analytics, isLoading, error } = useDemoRequestAnalytics()

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Demo Requests Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Analisis performa dan konversi demo requests
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <DemoRequestAnalyticsDashboard
        data={analytics || null}
        isLoading={isLoading}
        error={error?.message}
      />
    </div>
  )
}
