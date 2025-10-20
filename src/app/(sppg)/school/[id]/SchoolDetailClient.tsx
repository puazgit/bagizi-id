/**
 * @fileoverview School Detail Client Component
 * @version Next.js 15.5.4 / React Query
 * @author Bagizi-ID Development Team
 */

'use client'

import { useRouter } from 'next/navigation'
import { useSchool } from '@/features/sppg/school/hooks'
import { SchoolCard } from '@/features/sppg/school/components'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface SchoolDetailClientProps {
  schoolId: string
}

/**
 * School Detail Client Component
 * 
 * Fetches and displays complete school information
 * Handles loading and error states
 */
export default function SchoolDetailClient({ schoolId }: SchoolDetailClientProps) {
  const router = useRouter()
  const { data: school, isLoading, error } = useSchool(schoolId)

  if (isLoading) {
    return <SchoolDetailSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error.message || 'Gagal memuat data sekolah'}
        </AlertDescription>
      </Alert>
    )
  }

  if (!school) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sekolah Tidak Ditemukan</h3>
          <p className="text-muted-foreground mb-4">
            Data sekolah tidak ditemukan atau Anda tidak memiliki akses.
          </p>
          <Button asChild variant="outline">
            <Link href="/school">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main School Card - Detailed View */}
      <SchoolCard
        school={school}
        variant="detailed"
        onEdit={(id) => router.push(`/school/${id}/edit`)}
      />

      {/* Additional Information Sections */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Student Age Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Usia Siswa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <StatRow
                label="Usia 4-6 tahun"
                value={school.students4to6Years}
                total={school.totalStudents}
              />
              <StatRow
                label="Usia 7-12 tahun"
                value={school.students7to12Years}
                total={school.totalStudents}
              />
              <StatRow
                label="Usia 13-15 tahun"
                value={school.students13to15Years}
                total={school.totalStudents}
              />
              <StatRow
                label="Usia 16-18 tahun"
                value={school.students16to18Years}
                total={school.totalStudents}
              />
            </div>
          </CardContent>
        </Card>

        {/* Feeding Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Jadwal Pemberian Makan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Hari Pemberian Makan</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {school.feedingDays.map(day => (
                    <span
                      key={day}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                    >
                      {getDayName(day)}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Frekuensi per Hari</span>
                <p className="text-lg font-semibold mt-1">
                  {school.mealsPerDay} kali
                </p>
              </div>
              {school.feedingTime && (
                <div>
                  <span className="text-sm text-muted-foreground">Waktu Pemberian</span>
                  <p className="text-lg font-semibold mt-1">
                    {school.feedingTime}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Special Dietary Requirements */}
      {school.specialDietary && school.specialDietary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Kebutuhan Diet Khusus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {school.specialDietary.map((dietary, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium"
                >
                  {dietary}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suspension Info (if suspended) */}
      {!school.isActive && school.suspensionReason && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Sekolah Dinonaktifkan</strong>
            <br />
            {school.suspensionReason}
            {school.suspendedAt && (
              <span className="text-xs block mt-1">
                Pada: {new Date(school.suspendedAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

/**
 * Stat Row Component with Progress Bar
 */
interface StatRowProps {
  label: string
  value: number
  total: number
}

function StatRow({ label, value, total }: StatRowProps) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">
          {value.toLocaleString('id-ID')} ({percentage}%)
        </span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Convert day number to Indonesian name
 */
function getDayName(day: number): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  return days[day] || String(day)
}

/**
 * Loading Skeleton
 */
function SchoolDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  )
}
