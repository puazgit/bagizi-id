/**
 * @fileoverview User Statistics Dashboard Widget
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  TrendingUp,
  Building2
} from 'lucide-react'
import { useUserStatistics } from '../hooks'
import { getRoleLabel } from '../types'
import { UserRole } from '@prisma/client'

/**
 * User Statistics Component
 * Displays comprehensive user metrics for admin dashboard
 */
export function UserStatistics() {
  const { data: stats, isLoading, error } = useUserStatistics()

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Failed to Load Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  // Calculate percentages
  const activePercentage = stats.totalUsers > 0 
    ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
    : 0
  
  const verifiedPercentage = stats.totalUsers > 0
    ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100)
    : 0

  return (
    <div className="space-y-4">
      {/* Primary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.recentlyAdded > 0 && (
                <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +{stats.recentlyAdded} last 7 days
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activePercentage}% of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verifiedUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {verifiedPercentage}% verified emails
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactiveUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.lockedUsers > 0 && `${stats.lockedUsers} locked`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Users by Role */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Users by Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.byRole)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                  .map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getRoleLabel(role as UserRole)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{count}</span>
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ 
                            width: `${stats.totalUsers > 0 ? (count / stats.totalUsers) * 100 : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              {Object.keys(stats.byRole).length > 8 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{Object.keys(stats.byRole).length - 8} more roles
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Users by SPPG */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Users by SPPG
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.bySppg.length > 0 ? (
                <>
                  {stats.bySppg
                    .sort((a, b) => b.userCount - a.userCount)
                    .slice(0, 6)
                    .map((sppg) => (
                      <div key={sppg.sppgId} className="flex items-center justify-between">
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-medium truncate">
                            {sppg.sppgName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {sppg.sppgCode}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="secondary" className="text-xs">
                            {sppg.userCount}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  {stats.bySppg.length > 6 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      +{stats.bySppg.length - 6} more SPPG
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No SPPG-assigned users yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Stats */}
      {stats.recentlyActive > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span>
                <span className="font-medium text-foreground">{stats.recentlyActive}</span> users 
                active in the last 24 hours
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
