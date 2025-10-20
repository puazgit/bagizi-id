'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Target, Award, AlertCircle, Edit } from 'lucide-react'
import type { Program } from '@/features/sppg/program/types/program.types'

interface ProgramNutritionTabProps {
  program: Program
  onEdit: () => void
}

export function ProgramNutritionTab({ program, onEdit }: ProgramNutritionTabProps) {
  const hasNutritionTargets = 
    program.calorieTarget || 
    program.proteinTarget || 
    program.carbTarget || 
    program.fatTarget || 
    program.fiberTarget

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Target Gizi Harian per Penerima
          </CardTitle>
          <CardDescription>
            Standar nutrisi yang harus dipenuhi dalam program
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasNutritionTargets ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {program.calorieTarget && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Kalori</span>
                    <Badge variant="secondary">kkal</Badge>
                  </div>
                  <p className="text-3xl font-bold">{program.calorieTarget}</p>
                  <Progress value={85} className="h-1.5 mt-3" />
                  <p className="text-xs text-muted-foreground mt-2">Target energi harian</p>
                </div>
              )}

              {program.proteinTarget && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Protein</span>
                    <Badge variant="secondary">gram</Badge>
                  </div>
                  <p className="text-3xl font-bold">{program.proteinTarget}</p>
                  <Progress value={75} className="h-1.5 mt-3" />
                  <p className="text-xs text-muted-foreground mt-2">Pembentukan otot & sel</p>
                </div>
              )}

              {program.carbTarget && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Karbohidrat</span>
                    <Badge variant="secondary">gram</Badge>
                  </div>
                  <p className="text-3xl font-bold">{program.carbTarget}</p>
                  <Progress value={90} className="h-1.5 mt-3" />
                  <p className="text-xs text-muted-foreground mt-2">Sumber energi utama</p>
                </div>
              )}

              {program.fatTarget && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Lemak</span>
                    <Badge variant="secondary">gram</Badge>
                  </div>
                  <p className="text-3xl font-bold">{program.fatTarget}</p>
                  <Progress value={70} className="h-1.5 mt-3" />
                  <p className="text-xs text-muted-foreground mt-2">Penyerapan vitamin</p>
                </div>
              )}

              {program.fiberTarget && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Serat</span>
                    <Badge variant="secondary">gram</Badge>
                  </div>
                  <p className="text-3xl font-bold">{program.fiberTarget}</p>
                  <Progress value={65} className="h-1.5 mt-3" />
                  <p className="text-xs text-muted-foreground mt-2">Kesehatan pencernaan</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Target Gizi Belum Ditetapkan</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Silakan tetapkan target gizi harian untuk memastikan program memenuhi standar nutrisi yang diperlukan.
              </p>
              <Button variant="outline" className="mt-4" onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Tetapkan Target Gizi
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {hasNutritionTargets && (
        <Card>
          <CardHeader>
            <CardTitle>Rekomendasi Nutrisi</CardTitle>
            <CardDescription>
              Berdasarkan target kelompok: {program.targetGroup}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-1">
                      Standar Kecukupan Gizi
                    </h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Target nutrisi sudah disesuaikan dengan standar kecukupan gizi untuk kelompok {program.targetGroup.toLowerCase()}.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <span className="text-xl">🥗</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Variasi Makanan</p>
                    <p className="text-xs text-muted-foreground">Sumber gizi beragam</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="text-xl">💧</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Hidrasi</p>
                    <p className="text-xs text-muted-foreground">Air putih cukup</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                    <span className="text-xl">🍎</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Buah & Sayur</p>
                    <p className="text-xs text-muted-foreground">Vitamin & mineral</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <span className="text-xl">🥛</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Protein Hewani</p>
                    <p className="text-xs text-muted-foreground">Pertumbuhan optimal</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
