'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, Target, Users } from 'lucide-react'
import { calculateProgress, formatNumber } from '@/features/sppg/program/lib/programUtils'
import type { Program } from '@/features/sppg/program/types/program.types'

interface ProgramOverviewTabProps {
  program: Program
}

export function ProgramOverviewTab({ program }: ProgramOverviewTabProps) {
  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Deskripsi Program
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {program.description || 'Tidak ada deskripsi program.'}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Target Penerima Manfaat
            </CardTitle>
            <CardDescription>
              Progress pencapaian target penerima
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Target:</span>
              <span className="text-2xl font-bold">{formatNumber(program.targetRecipients)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Terdaftar Saat Ini:</span>
              <span className="text-2xl font-bold text-primary">{formatNumber(program.currentRecipients)}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress:</span>
                <span className="font-medium">
                  {calculateProgress(program.currentRecipients, program.targetRecipients)}%
                </span>
              </div>
              <Progress 
                value={calculateProgress(program.currentRecipients, program.targetRecipients)} 
                className="h-2"
              />
            </div>
            {program.currentRecipients < program.targetRecipients && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-md">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm text-amber-600 dark:text-amber-400">
                  Masih membutuhkan {program.targetRecipients - program.currentRecipients} penerima lagi
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Lokasi Implementasi
            </CardTitle>
            <CardDescription>
              Area dan sekolah mitra program
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm text-muted-foreground">Area:</span>
              <p className="font-medium mt-1">{program.implementationArea}</p>
            </div>
            
            {program.partnerSchools.length > 0 && (
              <div>
                <span className="text-sm text-muted-foreground">
                  Sekolah Mitra ({program.partnerSchools.length})
                </span>
                <ul className="mt-2 space-y-2">
                  {program.partnerSchools.map((school, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">
                        {idx + 1}
                      </Badge>
                      <span className="text-sm">{school}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {program.partnerSchools.length === 0 && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Belum ada sekolah mitra terdaftar
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
