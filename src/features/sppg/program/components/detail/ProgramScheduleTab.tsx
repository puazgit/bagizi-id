'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, ChefHat, ArrowLeft } from 'lucide-react'
import { formatDate } from '@/features/sppg/program/lib/programUtils'
import type { Program } from '@/features/sppg/program/types/program.types'

interface ProgramScheduleTabProps {
  program: Program
}

export function ProgramScheduleTab({ program }: ProgramScheduleTabProps) {
  const durationInDays = program.endDate
    ? Math.ceil((new Date(program.endDate).getTime() - new Date(program.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : null

  const durationInWeeks = durationInDays ? Math.ceil(durationInDays / 7) : null

  return (
    <div className="space-y-4 mt-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Periode Program
            </CardTitle>
            <CardDescription>
              Tanggal mulai dan berakhir program
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Tanggal Mulai</p>
                <p className="text-lg font-semibold mt-1">
                  {formatDate(program.startDate, 'dd MMMM yyyy')}
                </p>
              </div>
              <ArrowLeft className="h-8 w-8 text-muted-foreground rotate-180" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Tanggal Berakhir</p>
                <p className="text-lg font-semibold mt-1">
                  {program.endDate 
                    ? formatDate(program.endDate, 'dd MMMM yyyy')
                    : 'Belum ditentukan'}
                </p>
              </div>
              {program.endDate && new Date(program.endDate) > new Date() && (
                <Badge variant="secondary">Aktif</Badge>
              )}
            </div>

            {program.endDate && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Durasi Program
                  </span>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {durationInDays} hari ({durationInWeeks} minggu)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-primary" />
              Jadwal Pemberian Makanan
            </CardTitle>
            <CardDescription>
              Hari dan frekuensi pemberian makan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">Hari Pemberian:</p>
              <div className="flex flex-wrap gap-2">
                {program.feedingDays && program.feedingDays.length > 0 ? (
                  program.feedingDays.map((day) => (
                    <Badge key={day} variant="default" className="text-sm">
                      {['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][day]}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">Belum ditentukan</span>
                )}
              </div>
              {program.feedingDays && program.feedingDays.length > 0 && (
                <p className="text-sm text-muted-foreground mt-3">
                  Total: {program.feedingDays.length} hari per minggu
                </p>
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Frekuensi per Hari</p>
                <p className="text-2xl font-bold mt-1">
                  {program.mealsPerDay}x
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-primary" />
              </div>
            </div>

            {program.feedingDays && program.feedingDays.length > 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Total pemberian per minggu:
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {program.feedingDays.length * program.mealsPerDay}x
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
