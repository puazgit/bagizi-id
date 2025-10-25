/**
 * @fileoverview Demo Request Analytics Dashboard Component
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/ADMIN_DEMO_REQUESTS_FRONTEND_FOUNDATION_COMPLETE.md} Foundation Documentation
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Activity,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react'
import type { DemoRequestAnalytics } from '../types/demo-request.types'

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

interface DemoRequestAnalyticsDashboardProps {
  /**
   * Analytics data
   */
  data: DemoRequestAnalytics | null

  /**
   * Loading state
   */
  isLoading?: boolean

  /**
   * Error message
   */
  error?: string | null

  /**
   * Show compact view
   */
  compact?: boolean

  /**
   * Additional CSS classes
   */
  className?: string
}

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  iconClassName?: string
}

interface StatusDistributionItemProps {
  label: string
  value: number
  percentage: string
  color: string
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get trend icon
 */
function getTrendIcon(trend: 'up' | 'down' | 'neutral') {
  switch (trend) {
    case 'up':
      return ArrowUpRight
    case 'down':
      return ArrowDownRight
    default:
      return Minus
  }
}

/**
 * Get trend color
 */
function getTrendColor(trend: 'up' | 'down' | 'neutral') {
  switch (trend) {
    case 'up':
      return 'text-green-600 dark:text-green-400'
    case 'down':
      return 'text-red-600 dark:text-red-400'
    default:
      return 'text-muted-foreground'
  }
}

/**
 * Get organization type label
 */
function getOrgTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    PEMERINTAH: 'Pemerintah',
    SWASTA: 'Swasta',
    YAYASAN: 'Yayasan',
    KOMUNITAS: 'Komunitas',
    LAINNYA: 'Lainnya',
  }
  return labels[type] || type
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * KPI Card component
 */
function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  iconClassName = 'text-primary',
}: KPICardProps) {
  const TrendIcon = trend ? getTrendIcon(trend) : null
  const trendColorClass = trend ? getTrendColor(trend) : ''

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconClassName}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && trendValue && TrendIcon && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${trendColorClass}`}>
            <TrendIcon className="h-3 w-3" />
            <span>{trendValue}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Status distribution item
 */
function StatusDistributionItem({
  label,
  value,
  percentage,
  color,
}: StatusDistributionItemProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div className={`h-3 w-3 rounded-full ${color}`} />
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">{value}</span>
        <Badge variant="secondary" className="text-xs">
          {percentage}
        </Badge>
      </div>
    </div>
  )
}

/**
 * Conversion funnel item
 */
function FunnelItem({
  label,
  value,
  percentage,
  isLast = false,
}: {
  label: string
  value: number
  percentage: string
  isLast?: boolean
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{value}</span>
          <Badge variant="outline" className="text-xs">
            {percentage}
          </Badge>
        </div>
      </div>
      <div className="relative h-8 bg-muted rounded">
        <div
          className="absolute inset-y-0 left-0 bg-primary rounded transition-all"
          style={{ width: percentage }}
        />
      </div>
      {!isLast && (
        <div className="flex justify-center">
          <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  )
}

/**
 * Organization type row
 */
function OrgTypeRow({
  type,
  count,
  converted,
  conversionRate,
}: {
  type: string
  count: number
  converted: number
  conversionRate: string
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium">{getOrgTypeLabel(type)}</p>
        <p className="text-xs text-muted-foreground">
          {count} request • {converted} converted
        </p>
      </div>
      <Badge variant="secondary">{conversionRate}</Badge>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * DemoRequestAnalyticsDashboard - Analytics dashboard with charts and metrics
 *
 * Features:
 * - KPI cards (Total Requests, Conversion Rate, Active Demos, Avg Response Time)
 * - Status distribution visualization
 * - Conversion funnel chart
 * - Organization type breakdown
 * - Monthly trends (if available)
 * - Loading and error states
 * - Responsive design
 * - Dark mode support
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useDemoRequestAnalytics()
 * 
 * <DemoRequestAnalyticsDashboard
 *   data={data}
 *   isLoading={isLoading}
 *   error={error}
 * />
 * ```
 */
export function DemoRequestAnalyticsDashboard({
  data,
  isLoading = false,
  error = null,
  compact = false,
  className = '',
}: DemoRequestAnalyticsDashboardProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-20 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-5 w-32 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-4 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Activity className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (!data) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">
            Tidak ada data analytics tersedia
          </p>
        </CardContent>
      </Card>
    )
  }

  const { conversionMetrics, conversionFunnel, orgTypeBreakdown, timeMetrics } = data

  return (
    <div className={`space-y-6 ${className}`}>
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Requests"
          value={conversionMetrics.totalRequests.toLocaleString('id-ID')}
          subtitle="Total demo requests"
          icon={Users}
          iconClassName="text-blue-600 dark:text-blue-400"
        />
        <KPICard
          title="Conversion Rate"
          value={conversionMetrics.conversionRate}
          subtitle="Request → SPPG"
          icon={Target}
          trend="up"
          trendValue={`${conversionMetrics.conversionRate} vs avg`}
          iconClassName="text-green-600 dark:text-green-400"
        />
        <KPICard
          title="Active Demos"
          value={conversionMetrics.attendedDemos.toLocaleString('id-ID')}
          subtitle="Currently running"
          icon={Activity}
          iconClassName="text-purple-600 dark:text-purple-400"
        />
        <KPICard
          title="Avg Response Time"
          value={`${timeMetrics.avgTimeToApproval.toFixed(1)}h`}
          subtitle="Time to approval"
          icon={Clock}
          iconClassName="text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <StatusDistributionItem
              label="Submitted"
              value={conversionFunnel.submitted}
              percentage={`${((conversionFunnel.submitted / conversionMetrics.totalRequests) * 100).toFixed(1)}%`}
              color="bg-blue-500"
            />
            <StatusDistributionItem
              label="Under Review"
              value={conversionFunnel.underReview}
              percentage={`${((conversionFunnel.underReview / conversionMetrics.totalRequests) * 100).toFixed(1)}%`}
              color="bg-yellow-500"
            />
            <StatusDistributionItem
              label="Approved"
              value={conversionFunnel.approved}
              percentage={`${((conversionFunnel.approved / conversionMetrics.totalRequests) * 100).toFixed(1)}%`}
              color="bg-green-500"
            />
            <StatusDistributionItem
              label="Demo Active"
              value={conversionFunnel.demoActive}
              percentage={`${((conversionFunnel.demoActive / conversionMetrics.totalRequests) * 100).toFixed(1)}%`}
              color="bg-purple-500"
            />
            <StatusDistributionItem
              label="Converted"
              value={conversionFunnel.converted}
              percentage={`${((conversionFunnel.converted / conversionMetrics.totalRequests) * 100).toFixed(1)}%`}
              color="bg-emerald-500"
            />
            <StatusDistributionItem
              label="Rejected"
              value={conversionFunnel.rejected}
              percentage={`${((conversionFunnel.rejected / conversionMetrics.totalRequests) * 100).toFixed(1)}%`}
              color="bg-red-500"
            />
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Conversion Funnel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FunnelItem
              label="Submitted"
              value={conversionFunnel.submitted}
              percentage="100%"
            />
            <FunnelItem
              label="Approved"
              value={conversionFunnel.approved}
              percentage={conversionMetrics.approvalRate}
            />
            <FunnelItem
              label="Demo Active"
              value={conversionFunnel.demoActive}
              percentage={conversionMetrics.attendanceRate}
            />
            <FunnelItem
              label="Converted to SPPG"
              value={conversionFunnel.converted}
              percentage={conversionMetrics.conversionRate}
              isLast
            />
          </CardContent>
        </Card>
      </div>

      {/* Organization Type Breakdown & Time Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Organization Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Top Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orgTypeBreakdown && orgTypeBreakdown.length > 0 ? (
              <div className="space-y-0">
                {orgTypeBreakdown.slice(0, 5).map((org) => (
                  <OrgTypeRow
                    key={org.organizationType}
                    type={org.organizationType}
                    count={org.count}
                    converted={org.converted}
                    conversionRate={org.conversionRate}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Belum ada data organisasi
              </p>
            )}
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Key Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="space-y-1">
                <p className="text-sm font-medium">Approval Rate</p>
                <p className="text-xs text-muted-foreground">
                  Requests approved
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {conversionMetrics.approvalRate}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pb-3 border-b">
              <div className="space-y-1">
                <p className="text-sm font-medium">Attendance Rate</p>
                <p className="text-xs text-muted-foreground">
                  Demos attended
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {conversionMetrics.attendanceRate}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pb-3 border-b">
              <div className="space-y-1">
                <p className="text-sm font-medium">No-Show Rate</p>
                <p className="text-xs text-muted-foreground">
                  Missed demos
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {conversionMetrics.noShowRate}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Overall Conversion</p>
                <p className="text-xs text-muted-foreground">
                  Submit → SPPG
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {conversionMetrics.overallConversionRate}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Metrics */}
      {!compact && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Avg Time to Approval</p>
                <p className="text-2xl font-bold">
                  {timeMetrics.avgTimeToApproval.toFixed(1)}h
                </p>
                <p className="text-xs text-muted-foreground">
                  From submission
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Avg Time to Demo</p>
                <p className="text-2xl font-bold">
                  {timeMetrics.avgTimeToDemo.toFixed(1)} days
                </p>
                <p className="text-xs text-muted-foreground">
                  From approval
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Avg Time to Conversion</p>
                <p className="text-2xl font-bold">
                  {timeMetrics.avgTimeToConversion.toFixed(1)} days
                </p>
                <p className="text-xs text-muted-foreground">
                  From demo start
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
