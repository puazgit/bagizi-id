/**
 * @fileoverview School Statistics Cards Component
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 */

'use client'

import { useSchools } from '../hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
      <div className={cn('grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4', className)}>
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardHeader className="pb-2 md:pb-3">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4', className)}>
      {/* Total Schools */}
      <StatCard
        title="Total Sekolah"
        value={stats?.total || 0}
        description="Total sekolah terdaftar"
      />

      {/* Active Schools */}
      <StatCard
        title="Sekolah Aktif"
        value={stats?.active || 0}
        description="Sekolah yang aktif"
      />

      {/* Total Students */}
      <StatCard
        title="Total Siswa"
        value={stats?.totalStudents || 0}
        description="Siswa di semua sekolah"
      />

      {/* Target Beneficiaries */}
      <StatCard
        title="Target Penerima"
        value={stats?.targetStudents || 0}
        description="Siswa penerima manfaat"
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
}

function StatCard({ title, value, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2 md:pb-3">
        <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-xl md:text-2xl font-bold">
          {value.toLocaleString('id-ID')}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}
