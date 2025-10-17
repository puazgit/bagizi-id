/**
 * @fileoverview Quality Control Management Component
 * @version Next.js 15.5.4 / shadcn/ui / TanStack Query
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import {
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Thermometer,
  Eye,
  Utensils,
  Shield,
  Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAddQualityCheck, useQualityChecks } from '../hooks/useProductions'
import { qualityCheckCreateSchema } from '../schemas'
import { formatDateTime } from '../lib'
import type { QualityCheckCreateInput } from '../schemas'

// ============================================================================
// Types
// ============================================================================

type QualityCheckType = 'TEMPERATURE' | 'HYGIENE' | 'TASTE' | 'APPEARANCE' | 'SAFETY'
type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

interface QualityControlProps {
  productionId: string
  className?: string
}

interface QualityCheck {
  id: string
  checkType: string
  parameter: string
  expectedValue?: string | null
  actualValue: string
  passed: boolean
  score?: number | null
  severity?: string | null
  notes?: string | null
  recommendations?: string | null
  actionRequired?: boolean | null
  actionTaken?: string | null
  checkTime: Date
  checkedBy: string
}

// ============================================================================
// Constants
// ============================================================================

const CHECK_TYPES: { value: QualityCheckType; label: string; icon: typeof Thermometer }[] = [
  { value: 'TEMPERATURE', label: 'Suhu', icon: Thermometer },
  { value: 'HYGIENE', label: 'Kebersihan', icon: Shield },
  { value: 'TASTE', label: 'Rasa', icon: Utensils },
  { value: 'APPEARANCE', label: 'Penampilan', icon: Eye },
  { value: 'SAFETY', label: 'Keamanan', icon: Award },
]

const SEVERITY_LEVELS: { value: Severity; label: string; className: string }[] = [
  { value: 'LOW', label: 'Rendah', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
  { value: 'MEDIUM', label: 'Sedang', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' },
  { value: 'HIGH', label: 'Tinggi', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' },
  { value: 'CRITICAL', label: 'Kritis', className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' },
]

// ============================================================================
// Helper Functions
// ============================================================================

function getCheckTypeIcon(type: string) {
  const checkType = CHECK_TYPES.find((t) => t.value === type)
  return checkType?.icon || Shield
}

function getCheckTypeLabel(type: string) {
  const checkType = CHECK_TYPES.find((t) => t.value === type)
  return checkType?.label || type
}

function getSeverityLabel(severity: string) {
  const severityLevel = SEVERITY_LEVELS.find((s) => s.value === severity)
  return severityLevel?.label || severity
}

function getSeverityClassName(severity: string) {
  const severityLevel = SEVERITY_LEVELS.find((s) => s.value === severity)
  return severityLevel?.className || ''
}

function calculateOverallScore(checks: QualityCheck[]): number {
  const scoresWithValues = checks.filter((c) => c.score !== null && c.score !== undefined)
  if (scoresWithValues.length === 0) return 0

  const totalScore = scoresWithValues.reduce((sum, c) => sum + (c.score || 0), 0)
  return Math.round(totalScore / scoresWithValues.length)
}

// ============================================================================
// Add Quality Check Dialog
// ============================================================================

function AddQualityCheckDialog({
  open,
  onOpenChange,
  productionId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  productionId: string
}) {
  const { mutate: addCheck, isPending } = useAddQualityCheck()

  const form = useForm<QualityCheckCreateInput>({
    resolver: zodResolver(qualityCheckCreateSchema),
    defaultValues: {
      checkType: 'TEMPERATURE',
      parameter: '',
      expectedValue: '',
      actualValue: '',
      passed: true,
      score: undefined,
      severity: undefined,
      notes: '',
      recommendations: '',
      actionRequired: false,
      actionTaken: '',
    },
  })

  const onSubmit = (data: QualityCheckCreateInput) => {
    addCheck(
      { productionId, data },
      {
        onSuccess: () => {
          form.reset()
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Quality Check</DialogTitle>
          <DialogDescription>Tambahkan pemeriksaan kualitas baru untuk produksi ini</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Check Type & Parameter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkType">Tipe Pemeriksaan</Label>
              <Select
                value={form.watch('checkType')}
                onValueChange={(value) => form.setValue('checkType', value as QualityCheckType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  {CHECK_TYPES.map((type) => {
                    const Icon = type.icon
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {form.formState.errors.checkType && (
                <p className="text-sm text-destructive">{form.formState.errors.checkType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parameter">Parameter</Label>
              <Input
                id="parameter"
                {...form.register('parameter')}
                placeholder="Contoh: Suhu makanan"
              />
              {form.formState.errors.parameter && (
                <p className="text-sm text-destructive">{form.formState.errors.parameter.message}</p>
              )}
            </div>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expectedValue">Nilai yang Diharapkan (Opsional)</Label>
              <Input
                id="expectedValue"
                {...form.register('expectedValue')}
                placeholder="Contoh: 85°C"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualValue">Nilai Aktual</Label>
              <Input
                id="actualValue"
                {...form.register('actualValue')}
                placeholder="Contoh: 87°C"
              />
              {form.formState.errors.actualValue && (
                <p className="text-sm text-destructive">{form.formState.errors.actualValue.message}</p>
              )}
            </div>
          </div>

          {/* Passed & Score */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passed">Status</Label>
              <Select
                value={form.watch('passed') ? 'true' : 'false'}
                onValueChange={(value) => form.setValue('passed', value === 'true')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Lulus</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="false">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span>Tidak Lulus</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="score">Skor (0-100)</Label>
              <Input
                id="score"
                type="number"
                min="0"
                max="100"
                {...form.register('score', { valueAsNumber: true })}
                placeholder="85"
              />
              {form.formState.errors.score && (
                <p className="text-sm text-destructive">{form.formState.errors.score.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Tingkat Keparahan</Label>
              <Select
                value={form.watch('severity') || 'LOW'}
                onValueChange={(value) => form.setValue('severity', value as Severity)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tingkat" />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Notes & Recommendations */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                rows={3}
                {...form.register('notes')}
                placeholder="Catatan tambahan tentang pemeriksaan..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommendations">Rekomendasi</Label>
              <Textarea
                id="recommendations"
                rows={3}
                {...form.register('recommendations')}
                placeholder="Rekomendasi perbaikan atau tindakan..."
              />
            </div>
          </div>

          {/* Action Required */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="actionRequired"
                {...form.register('actionRequired')}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="actionRequired" className="cursor-pointer">
                Tindakan diperlukan
              </Label>
            </div>

            {form.watch('actionRequired') && (
              <div className="space-y-2">
                <Label htmlFor="actionTaken">Tindakan yang Diambil</Label>
                <Textarea
                  id="actionTaken"
                  rows={2}
                  {...form.register('actionTaken')}
                  placeholder="Deskripsi tindakan yang telah diambil..."
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Simpan Quality Check'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function QualityControl({ productionId, className }: QualityControlProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const { data: checks = [], isLoading } = useQualityChecks(productionId)

  const overallScore = calculateOverallScore(checks)
  const passedChecks = checks.filter((c) => c.passed).length
  const totalChecks = checks.length
  const failedChecks = totalChecks - passedChecks

  return (
    <>
      <Card className={cn('', className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quality Control</CardTitle>
              <CardDescription>Pemeriksaan kualitas produksi makanan</CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Check
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Statistics */}
          {checks.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Skor Keseluruhan</p>
                  <p className="text-2xl font-bold">{overallScore}</p>
                  <p className="text-xs text-muted-foreground mt-1">dari 100</p>
                </div>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Total Pemeriksaan</p>
                  <p className="text-2xl font-bold">{totalChecks}</p>
                  <p className="text-xs text-muted-foreground mt-1">checks dilakukan</p>
                </div>
                <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                  <p className="text-xs text-muted-foreground mb-1">Lulus</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {passedChecks}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">pemeriksaan</p>
                </div>
                <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-900/20">
                  <p className="text-xs text-muted-foreground mb-1">Tidak Lulus</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{failedChecks}</p>
                  <p className="text-xs text-muted-foreground mt-1">pemeriksaan</p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Quality Checks Table */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Memuat data quality check...</div>
          ) : checks.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Belum ada quality check</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Quality Check Pertama
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Parameter</TableHead>
                    <TableHead>Nilai</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Skor</TableHead>
                    <TableHead>Tingkat</TableHead>
                    <TableHead>Waktu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checks.map((check) => {
                    const Icon = getCheckTypeIcon(check.checkType)
                    return (
                      <TableRow key={check.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{getCheckTypeLabel(check.checkType)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{check.parameter}</p>
                            {check.expectedValue && (
                              <p className="text-xs text-muted-foreground">
                                Target: {check.expectedValue}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold">{check.actualValue}</p>
                        </TableCell>
                        <TableCell>
                          {check.passed ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Lulus
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                              <XCircle className="h-3 w-3 mr-1" />
                              Tidak Lulus
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {check.score !== null && check.score !== undefined ? (
                            <span className="font-semibold">{check.score}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {check.severity ? (
                            <Badge className={getSeverityClassName(check.severity)}>
                              {check.severity === 'CRITICAL' && (
                                <AlertTriangle className="h-3 w-3 mr-1" />
                              )}
                              {getSeverityLabel(check.severity)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{formatDateTime(check.checkTime)}</p>
                          {check.checkedBy && (
                            <p className="text-xs text-muted-foreground">{check.checkedBy}</p>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Action Required Alerts */}
          {checks.some((c) => c.actionRequired && !c.actionTaken) && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  Tindakan Diperlukan
                </p>
                {checks
                  .filter((c) => c.actionRequired && !c.actionTaken)
                  .map((check) => (
                    <div
                      key={check.id}
                      className="p-3 border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20 rounded-lg"
                    >
                      <p className="text-sm font-medium">
                        {getCheckTypeLabel(check.checkType)} - {check.parameter}
                      </p>
                      {check.recommendations && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Rekomendasi: {check.recommendations}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <AddQualityCheckDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        productionId={productionId}
      />
    </>
  )
}
