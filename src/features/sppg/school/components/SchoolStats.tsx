/**
 * @fileoverview School Statistics Cards Component
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 */

'use client'

import { useSchools } from '../hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { School, Users, Target, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SchoolStatsProps {
  programId?: string
  className?: string
}

/**
 * School Statistics Component
 * 
 * Displays key metrics about schools:
 * - Total schools
 * - Active schools
 * - Total students
 * - Target beneficiaries
 * 
 * @example
 * ```tsx
 * <SchoolStats programId="prog_123" />
 * ```
 */
export function SchoolStats({ programId, className }: SchoolStatsProps) {
  const { data, isLoading } = useSchools({
    mode: 'standard',
    programId,
  })

  // Extract schools from response data
  const schools = data?.schools || []

  // Calculate statistics
  const stats = schools.length > 0 ? {
    total: schools.length,
    active: schools.filter(s => s.isActive).length,
    totalStudents: schools.reduce((sum, s) => sum + s.totalStudents, 0),
    targetStudents: schools.reduce((sum, s) => sum + s.targetStudents, 0),
  } : null

  if (isLoading) {
    return (
      <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
      {/* Total Schools */}
      <StatCard
        title="Total Sekolah"
        value={stats?.total || 0}
        description="Total sekolah terdaftar"
        icon={School}
        iconColor="text-blue-600 dark:text-blue-400"
      />

      {/* Active Schools */}
      <StatCard
        title="Sekolah Aktif"
        value={stats?.active || 0}
        description="Sekolah yang aktif"
        icon={CheckCircle}
        iconColor="text-green-600 dark:text-green-400"
      />

      {/* Total Students */}
      <StatCard
        title="Total Siswa"
        value={stats?.totalStudents || 0}
        description="Siswa di semua sekolah"
        icon={Users}
        iconColor="text-purple-600 dark:text-purple-400"
      />

      {/* Target Beneficiaries */}
      <StatCard
        title="Target Penerima"
        value={stats?.targetStudents || 0}
        description="Siswa penerima manfaat"
        icon={Target}
        iconColor="text-orange-600 dark:text-orange-400"
      />
    </div>
  )
}

/**
 * Individual Stat Card Component
 */
interface StatCardProps {
  title: string
  value: number
  description: string
  icon: React.ElementType
  iconColor: string
}

function StatCard({ title, value, description, icon: Icon, iconColor }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className={cn('h-4 w-4', iconColor)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value.toLocaleString('id-ID')}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}
